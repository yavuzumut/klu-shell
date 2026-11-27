import { useEffect, useRef } from 'react';
import type { Level } from '../lessons/types';
import type { AppMode } from './Header';
import { useI18n } from '../i18n/I18nProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { exportProgressPayload, GIT_STORAGE_KEY, importProgressPayload, loadProgress, STORAGE_KEY } from '../state/useProgress';

interface Props {
  open: boolean;
  levels: Level[];
  currentLessonId: string;
  isLessonDone: (lessonId: string) => boolean;
  onSelectLesson(lessonId: string): void;
  onClose(): void;
  onResetAll(): void;
  mode: AppMode;
  onModeChange(mode: AppMode): void;
  showFileTree: boolean;
  onToggleFileTree(): void;
}

export function LessonDrawer({
  open,
  levels,
  currentLessonId,
  isLessonDone,
  onSelectLesson,
  onClose,
  onResetAll,
  mode,
  onModeChange,
  showFileTree,
  onToggleFileTree,
}: Props) {
  const { t } = useI18n();
  const importInput = useRef<HTMLInputElement>(null);

  const exportProgress = () => {
    const payload = exportProgressPayload(loadProgress('l0-intro', STORAGE_KEY), loadProgress('git-1-init', GIT_STORAGE_KEY));
    const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'klu-progress.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProgress = async (file?: File) => {
    if (!file) return;
    const payload = importProgressPayload(await file.text());
    if (!payload) {
      alert(t('drawer.importInvalid'));
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.linux));
    localStorage.setItem(GIT_STORAGE_KEY, JSON.stringify(payload.git));
    window.location.reload();
  };

  const modeItems: { id: AppMode; label: string }[] = [
    { id: 'lessons', label: `📖 ${t('modes.lessons')}` },
    { id: 'sandbox', label: `💻 ${t('modes.sandbox')}` },
    { id: 'git', label: `🌿 ${t('modes.git')}` },
    { id: 'cheatsheet', label: `📑 ${t('modes.cheatsheet')}` },
    { id: 'explore', label: `🚀 ${t('modes.explore')}` },
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="drawer-head">
          <strong>
            <span className="drawer-title-desktop">{t('drawer.titleDesktop')}</span>
            <span className="drawer-title-mobile">{t('drawer.titleMobile')}</span>
          </strong>
          <button className="icon-btn" onClick={onClose} aria-label={t('drawer.closeAria')}>
            ✕
          </button>
        </div>

        {/* Mobile only (< 768px): items that live in the header on desktop. */}
        <section className="drawer-mobile-nav" aria-label={t('drawer.navAria')}>
          <div className="drawer-lang-row">
            <span className="drawer-lang-label">{t('drawer.language')}:</span>
            <LanguageSwitcher className="drawer-lang-switcher" />
          </div>

          <div className="drawer-mode-switch" role="group" aria-label={t('drawer.modeAria')}>
            {modeItems.map((m) => (
              <button
                key={m.id}
                className={`drawer-mode-btn ${mode === m.id ? 'active' : ''}`}
                aria-pressed={mode === m.id}
                onClick={() => {
                  onModeChange(m.id);
                  onClose();
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
          {(mode === 'lessons' || mode === 'sandbox') && (
            <button
              className={`btn btn-small drawer-tree-btn ${showFileTree ? 'btn-primary' : 'btn-ghost'}`}
              aria-pressed={showFileTree}
              onClick={onToggleFileTree}
            >
              {t('drawer.treeBtn', { state: showFileTree ? t('drawer.treeOpen') : t('drawer.treeClosed') })}
            </button>
          )}
        </section>

        <div className="drawer-section-title">{t('drawer.sectionLessons')}</div>
        {levels.map((lv) => (
          <section key={lv.id} className="drawer-level">
            <h3>
              {t('drawer.levelLabel', { num: lv.number, title: lv.title })}{' '}
              {lv.comingSoon && <span className="badge">{t('drawer.badgeComingSoon')}</span>}
            </h3>
            <p className="muted small">{lv.description}</p>
            <ul>
              {lv.lessons.map((l, i) => (
                <li key={l.id}>
                  <button
                    className={`drawer-lesson ${l.id === currentLessonId ? 'current' : ''}`}
                    onClick={() => {
                      onSelectLesson(l.id);
                      onClose();
                    }}
                  >
                    <span className={`dot ${isLessonDone(l.id) ? 'done' : ''}`}>{isLessonDone(l.id) ? '✓' : i + 1}</span>
                    <span>
                      <span className="drawer-lesson-title">{l.title}</span>
                      <span className="muted small">{l.summary}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <div className="drawer-progress-actions">
        <button className="btn btn-small btn-ghost" onClick={exportProgress}>{t('drawer.exportProgress')}</button>
        <button className="btn btn-small btn-ghost" onClick={() => importInput.current?.click()}>{t('drawer.importProgress')}</button>
        <input ref={importInput} type="file" accept="application/json,.json" hidden onChange={(event) => {
          void importProgress(event.currentTarget.files?.[0]);
          event.currentTarget.value = '';
        }} />
        </div>
        <button
          className="btn btn-ghost danger"
          onClick={() => {
            if (confirm(t('drawer.resetAllConfirm'))) onResetAll();
          }}
        >
          {t('drawer.resetAll')}
        </button>
      </aside>
    </>
  );
}
