import type { Level } from '../lessons/types';
import type { UseThemeReturn } from '../themes/useTheme';
import { ThemeSelector } from './ThemeSelector';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useI18n } from '../i18n/I18nProvider';

export type AppMode = 'lessons' | 'sandbox' | 'git' | 'cheatsheet' | 'explore';

interface Props {
  levels: Level[];
  currentLevel: Level;
  currentLessonId: string;
  isLessonDone: (lessonId: string) => boolean;
  onSelectLesson(lessonId: string): void;
  onOpenMenu(): void;
  mode: AppMode;
  onModeChange(mode: AppMode): void;
  showFileTree: boolean;
  onToggleFileTree(): void;
  themeControls: UseThemeReturn;
}

export function Header({
  levels,
  currentLevel,
  currentLessonId,
  isLessonDone,
  onSelectLesson,
  onOpenMenu,
  mode,
  onModeChange,
  showFileTree,
  onToggleFileTree,
  themeControls,
}: Props) {
  const { t } = useI18n();
  const isLevel0 = currentLevel.id === 'level-0';
  const lessons = currentLevel.lessons;
  const doneCount = lessons.filter((l) => isLessonDone(l.id)).length;

  // Main curriculum (Level 1-3) progress calculation
  const mainLessons = levels.filter((lv) => lv.id !== 'level-0').flatMap((lv) => lv.lessons);
  const mainDoneCount = mainLessons.filter((l) => isLessonDone(l.id)).length;
  const mainPercent = mainLessons.length ? Math.round((mainDoneCount / mainLessons.length) * 100) : 0;

  return (
    <header className="header">
      <div className="brand">
        {/* On mobile the menu is always available: the drawer also hosts mode navigation. */}
        <button
          className={`icon-btn menu-btn ${mode === 'lessons' ? '' : 'menu-btn-mobile-only'}`}
          onClick={onOpenMenu}
          aria-label={t('header.menuAria')}
        >
          ☰
        </button>
        <button
          type="button"
          className="header-logo-btn"
          onClick={() => onModeChange('lessons')}
          title={t('header.homeTitle')}
          aria-label="KLU"
        >
          <span className="header-logo-frame">
            <img
              src="/klu-logo-cropped.webp"
              alt="KLU"
              className="header-logo-img"
              height={42}
            />
          </span>
        </button>
      </div>

      <nav className="mode-nav" aria-label={t('header.navAria')}>
        <button
          className={`mode-tab ${mode === 'lessons' ? 'active' : ''}`}
          onClick={() => onModeChange('lessons')}
        >
          📖 {t('modes.lessons')}
        </button>
        <button
          className={`mode-tab ${mode === 'sandbox' ? 'active' : ''}`}
          onClick={() => onModeChange('sandbox')}
        >
          💻 {t('modes.sandbox')}
        </button>
        <button
          className={`mode-tab ${mode === 'git' ? 'active' : ''}`}
          onClick={() => onModeChange('git')}
        >
          🌿 {t('modes.git')}
        </button>
        <button
          className={`mode-tab ${mode === 'cheatsheet' ? 'active' : ''}`}
          onClick={() => onModeChange('cheatsheet')}
        >
          📑 {t('modes.cheatsheet')}
        </button>
        <button
          className={`mode-tab ${mode === 'explore' ? 'active' : ''}`}
          onClick={() => onModeChange('explore')}
        >
          🚀 {t('modes.explore')}
        </button>
      </nav>

      {mode === 'lessons' && (
        <>
          <div className="levels" role="tablist" aria-label={t('header.levelsAria')}>
            {levels.map((lv, idx) => (
              <span key={lv.id} className="level-pill-wrapper">
                <button
                  role="tab"
                  aria-selected={lv.id === currentLevel.id}
                  className={`level-pill ${lv.id === 'level-0' ? 'level-pill-intro' : ''} ${lv.id === currentLevel.id ? 'active' : ''}`}
                  disabled={lv.comingSoon}
                  title={lv.comingSoon ? t('header.lockedTitle', { title: lv.title }) : lv.description}
                  onClick={() => lv.lessons[0] && onSelectLesson(lv.lessons[0].id)}
                >
                  <span className="level-num">{lv.number}</span>
                  <span className="level-name">{lv.title}</span>
                  {lv.id === 'level-0' && <span className="level-badge-intro">{t('header.beginnersBadge')}</span>}
                  {lv.comingSoon && <span className="lock">🔒</span>}
                </button>
                {lv.id === 'level-0' && idx < levels.length - 1 && (
                  <span className="levels-divider" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>

          <div
            className="progress"
            aria-label={
              isLevel0
                ? t('header.progressAriaIntro', { done: doneCount, total: lessons.length })
                : t('header.progressAria', { done: doneCount, total: lessons.length, percent: mainPercent })
            }
          >
            <div className="progress-segments">
              {lessons.map((l, i) => (
                <button
                  key={l.id}
                  className={`segment ${isLessonDone(l.id) ? 'done' : ''} ${l.id === currentLessonId ? 'current' : ''}`}
                  title={`${i + 1}. ${l.title}`}
                  onClick={() => onSelectLesson(l.id)}
                />
              ))}
            </div>
            <span className="progress-text">
              {isLevel0
                ? t('header.progressTextIntro', { done: doneCount, total: lessons.length })
                : t('header.progressText', { done: doneCount, total: lessons.length, percent: mainPercent })}
            </span>
            <span className="progress-badge" aria-hidden="true">
              {doneCount}/{lessons.length}
            </span>
          </div>
        </>
      )}

      <div className="header-right-actions">
        {(mode === 'lessons' || mode === 'sandbox') && (
          <button
            className={`btn btn-small header-tree-btn ${showFileTree ? 'btn-primary' : 'btn-ghost'}`}
            onClick={onToggleFileTree}
            title={t('header.fileTreeTitle')}
            aria-pressed={showFileTree}
          >
            🗂️ {t('header.fileTreeBtn')}
          </button>
        )}
        <LanguageSwitcher className="header-lang-switcher" />
        <ThemeSelector {...themeControls} />
      </div>
    </header>
  );
}
