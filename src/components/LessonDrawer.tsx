import { useEffect } from 'react';
import type { Level } from '../lessons/types';
import type { AppMode } from './Header';

const MODE_ITEMS: { id: AppMode; label: string }[] = [
  { id: 'lessons', label: '📖 Dersler' },
  { id: 'sandbox', label: '💻 Serbest Mod' },
  { id: 'git', label: '🌿 Git' },
  { id: 'cheatsheet', label: '📑 Hile Kağıdı' },
  { id: 'explore', label: '🚀 Meraklısına' },
];

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
            <span className="drawer-title-desktop">Dersler</span>
            <span className="drawer-title-mobile">Menü</span>
          </strong>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </div>

        {/* Mobile only (< 768px): items that live in the header on desktop. */}
        <section className="drawer-mobile-nav" aria-label="Gezinme">
          <div className="drawer-mode-switch" role="group" aria-label="Mod seçimi">
            {MODE_ITEMS.map((m) => (
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
              🗂️ Dosya Ağacı {showFileTree ? 'açık' : 'kapalı'}
            </button>
          )}
        </section>

        <div className="drawer-section-title">Dersler</div>
        {levels.map((lv) => (
          <section key={lv.id} className="drawer-level">
            <h3>
              Seviye {lv.number}: {lv.title} {lv.comingSoon && <span className="badge">Yakında</span>}
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
        <button
          className="btn btn-ghost danger"
          onClick={() => {
            if (confirm('Tüm ilerlemen silinecek. Emin misin?')) onResetAll();
          }}
        >
          Tüm ilerlemeyi sıfırla
        </button>
      </aside>
    </>
  );
}
