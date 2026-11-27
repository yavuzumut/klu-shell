import type { Level } from '../lessons/types';
import type { UseThemeReturn } from '../themes/useTheme';
import { ThemeSelector } from './ThemeSelector';

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
          aria-label="Menü ve ders listesi"
        >
          ☰
        </button>
        <button
          type="button"
          className="header-logo-btn"
          onClick={() => onModeChange('lessons')}
          title="KLU — Ana Sayfa (Dersler)"
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

      <nav className="mode-nav" aria-label="Gezinme sekmeleri">
        <button
          className={`mode-tab ${mode === 'lessons' ? 'active' : ''}`}
          onClick={() => onModeChange('lessons')}
        >
          📖 Dersler
        </button>
        <button
          className={`mode-tab ${mode === 'sandbox' ? 'active' : ''}`}
          onClick={() => onModeChange('sandbox')}
        >
          💻 Serbest Mod
        </button>
        <button
          className={`mode-tab ${mode === 'git' ? 'active' : ''}`}
          onClick={() => onModeChange('git')}
        >
          🌿 Git
        </button>
        <button
          className={`mode-tab ${mode === 'cheatsheet' ? 'active' : ''}`}
          onClick={() => onModeChange('cheatsheet')}
        >
          📑 Hile Kağıdı
        </button>
        <button
          className={`mode-tab ${mode === 'explore' ? 'active' : ''}`}
          onClick={() => onModeChange('explore')}
        >
          🚀 Meraklısına
        </button>
      </nav>

      {mode === 'lessons' && (
        <>
          <div className="levels" role="tablist" aria-label="Seviyeler">
            {levels.map((lv, idx) => (
              <span key={lv.id} className="level-pill-wrapper">
                <button
                  role="tab"
                  aria-selected={lv.id === currentLevel.id}
                  className={`level-pill ${lv.id === 'level-0' ? 'level-pill-intro' : ''} ${lv.id === currentLevel.id ? 'active' : ''}`}
                  disabled={lv.comingSoon}
                  title={lv.comingSoon ? `${lv.title} — yakında` : lv.description}
                  onClick={() => lv.lessons[0] && onSelectLesson(lv.lessons[0].id)}
                >
                  <span className="level-num">{lv.number}</span>
                  <span className="level-name">{lv.title}</span>
                  {lv.id === 'level-0' && <span className="level-badge-intro">Yeni başlayanlar</span>}
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
                ? `Hazırlık ilerlemesi: ${doneCount}/${lessons.length} ders`
                : `İlerleme: ${doneCount}/${lessons.length} ders · %${mainPercent}`
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
                ? `Hazırlık: ${doneCount}/${lessons.length} ders`
                : `${doneCount}/${lessons.length} ders · %${mainPercent}`}
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
            title="Dosya Ağacını Göster/Gizle"
            aria-pressed={showFileTree}
          >
            🗂️ Dosya Ağacı
          </button>
        )}
        <ThemeSelector {...themeControls} />
      </div>
    </header>
  );
}
