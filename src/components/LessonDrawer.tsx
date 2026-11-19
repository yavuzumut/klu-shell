import { useEffect } from 'react';
import type { Level } from '../lessons/types';

interface Props {
  open: boolean;
  levels: Level[];
  currentLessonId: string;
  isLessonDone: (lessonId: string) => boolean;
  onSelectLesson(lessonId: string): void;
  onClose(): void;
  onResetAll(): void;
}

export function LessonDrawer({ open, levels, currentLessonId, isLessonDone, onSelectLesson, onClose, onResetAll }: Props) {
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
          <strong>Dersler</strong>
          <button className="icon-btn" onClick={onClose} aria-label="Kapat">
            ✕
          </button>
        </div>
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
