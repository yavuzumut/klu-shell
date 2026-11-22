import type { Level } from '../lessons/types';
import type { UseThemeReturn } from '../themes/useTheme';
import { ThemeSelector } from './ThemeSelector';

export type AppMode = 'lessons' | 'sandbox' | 'cheatsheet' | 'explore';

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
        {mode === 'lessons' && (
          <button className="icon-btn" onClick={onOpenMenu} aria-label="Ders listesi">
            ☰
          </button>
        )}
        <span className="logo">
          <span className="logo-mascot-frame">
            <img
              src="/klu-mascot-64.png"
              alt="KLU Maskotu"
              className="logo-mascot"
              width={32}
              height={32}
            />
          </span>
          <span className="logo-text">
            <span className="logo-prompt">&gt;_</span> klu
          </span>
        </span>
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
          </div>
        </>
      )}

      <div className="header-right-actions">
        {(mode === 'lessons' || mode === 'sandbox') && (
          <button
            className={`btn btn-small ${showFileTree ? 'btn-primary' : 'btn-ghost'}`}
            onClick={onToggleFileTree}
            title="Dosya Ağacını Göster/Gizle"
          >
            🗂️ Dosya Ağacı
          </button>
        )}
        <ThemeSelector {...themeControls} />
      </div>
    </header>
  );
}
