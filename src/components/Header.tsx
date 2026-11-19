import type { Level } from '../lessons/types';

interface Props {
  levels: Level[];
  currentLevel: Level;
  currentLessonId: string;
  isLessonDone: (lessonId: string) => boolean;
  onSelectLesson(lessonId: string): void;
  onOpenMenu(): void;
}

export function Header({ levels, currentLevel, currentLessonId, isLessonDone, onSelectLesson, onOpenMenu }: Props) {
  const lessons = currentLevel.lessons;
  const doneCount = lessons.filter((l) => isLessonDone(l.id)).length;
  const percent = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  return (
    <header className="header">
      <div className="brand">
        <button className="icon-btn" onClick={onOpenMenu} aria-label="Ders listesi">
          ☰
        </button>
        <span className="logo">
          <span className="logo-prompt">&gt;_</span> termi
        </span>
      </div>

      <div className="levels" role="tablist" aria-label="Seviyeler">
        {levels.map((lv) => (
          <button
            key={lv.id}
            role="tab"
            aria-selected={lv.id === currentLevel.id}
            className={`level-pill ${lv.id === currentLevel.id ? 'active' : ''}`}
            disabled={lv.comingSoon}
            title={lv.comingSoon ? `${lv.title} — yakında` : lv.description}
            onClick={() => lv.lessons[0] && onSelectLesson(lv.lessons[0].id)}
          >
            <span className="level-num">{lv.number}</span>
            <span className="level-name">{lv.title}</span>
            {lv.comingSoon && <span className="lock">🔒</span>}
          </button>
        ))}
      </div>

      <div className="progress" aria-label={`İlerleme: ${doneCount}/${lessons.length} ders`}>
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
          {doneCount}/{lessons.length} ders · %{percent}
        </span>
      </div>
    </header>
  );
}
