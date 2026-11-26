import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import type { Lesson, Level } from '../lessons/types';

marked.setOptions({ gfm: true, breaks: false });

marked.use({
  renderer: {
    link({ href, title, text }: { href: string; title?: string | null; text: string }) {
      const cleanHref = (href || '').trim();
      const isSafe = /^(?:https?:|\/|#|mailto:)/i.test(cleanHref);
      const safeHref = isSafe ? cleanHref : '#';
      const isExternal = /^https?:\/\//i.test(safeHref);
      const relTarget = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
      const titleAttr = title ? ` title="${title.replace(/"/g, '&quot;')}"` : '';
      return `<a href="${safeHref}"${relTarget}${titleAttr}>${text}</a>`;
    },
  },
});

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
}

const md = (text: string) => sanitizeHtml(marked.parse(text.trim(), { async: false }) as string);
const mdInline = (text: string) => sanitizeHtml(marked.parseInline(text, { async: false }) as string);

/** Hints become available one per wrong attempt; the solution after this many. */
export const SOLUTION_THRESHOLD = 3;

interface Props {
  level: Level;
  lesson: Lesson;
  lessonIndex: number;
  completedTaskIds: string[];
  attemptsFor: (taskId: string) => number;
  isRevealed: (taskId: string) => boolean;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev(): void;
  onNext(): void;
  onRevealSolution(taskId: string): void;
  onInsertCommand(command: string): void;
  onRestartLesson(): void;
  onResetTerminal(): void;
}

export function LessonPanel(props: Props) {
  const { level, lesson, lessonIndex, completedTaskIds } = props;
  const html = useMemo(() => md(lesson.content), [lesson.content]);
  const done = new Set(completedTaskIds);
  const activeTask = lesson.tasks.find((t) => !done.has(t.id)) ?? null;
  const lessonDone = !activeTask;

  return (
    <div className="lesson">
      <div className="lesson-meta">
        Seviye {level.number} · Ders {lessonIndex + 1}/{level.lessons.length}
      </div>
      <h1 className="lesson-title">{lesson.title}</h1>

      <article className="markdown" dangerouslySetInnerHTML={{ __html: html }} />

      {lesson.examples.length > 0 && (
        <section className="examples">
          <h2>Örnek komutlar</h2>
          <p className="muted small">Tıkla, terminale yazılsın; çalıştırmak için Enter'a bas.</p>
          <div className="chips">
            {lesson.examples.map((ex) => (
              <button key={ex} className="chip" onClick={() => props.onInsertCommand(ex)} title="Terminale yaz">
                <span className="chip-prompt">$</span> {ex}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="tasks">
        <h2>
          Görevler{' '}
          <span className="muted small">
            ({completedTaskIds.filter((id) => lesson.tasks.some((t) => t.id === id)).length}/{lesson.tasks.length})
          </span>
        </h2>
        <ol className="task-list">
          {lesson.tasks.map((task, i) => {
            const isDone = done.has(task.id);
            const isActive = activeTask?.id === task.id;
            const attempts = props.attemptsFor(task.id);
            const visibleHints = isActive ? task.hints.slice(0, Math.min(attempts, task.hints.length)) : [];
            const canReveal = isActive && attempts >= SOLUTION_THRESHOLD;
            const revealed = isActive && props.isRevealed(task.id);
            const state = isDone ? 'done' : isActive ? 'active' : 'locked';
            return (
              <li key={task.id} className={`task task-${state}`}>
                <div className="task-head">
                  <span className="task-icon" aria-hidden>
                    {isDone ? '✓' : i + 1}
                  </span>
                  <span className="task-desc" dangerouslySetInnerHTML={{ __html: mdInline(task.description) }} />
                </div>

                {isActive && attempts > 0 && (
                  <div className="task-feedback">
                    <div className="attempts">
                      Yanlış deneme: <strong>{attempts}</strong>
                    </div>
                    {visibleHints.map((h, idx) => (
                      <div key={idx} className="hint">
                        <span className="hint-label">💡 İpucu {idx + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: mdInline(h) }} />
                      </div>
                    ))}
                    {canReveal && !revealed && (
                      <button className="btn btn-warn" onClick={() => props.onRevealSolution(task.id)}>
                        Çözümü göster
                      </button>
                    )}
                    {revealed && (
                      <div className="solution">
                        <span className="hint-label">Çözüm</span>
                        <code>{task.solution}</code>
                        <button className="btn btn-small" onClick={() => props.onInsertCommand(task.solution)}>
                          Terminale yaz
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {lessonDone && (
          <div className="lesson-complete">
            <strong>🎉 Ders tamamlandı!</strong>
            <span>{props.hasNext ? 'Sonraki derse geçmeye hazırsın.' : 'Tüm dersleri tamamladın. Harika iş!'}</span>
          </div>
        )}
      </section>

      <div className="lesson-actions">
        <button className="btn btn-ghost" onClick={props.onResetTerminal} title="Dosya sistemini dersin başlangıç haline döndür">
          ↺ Terminali sıfırla
        </button>
        {completedTaskIds.length > 0 && (
          <button className="btn btn-ghost" onClick={props.onRestartLesson}>
            Dersi tekrarla
          </button>
        )}
      </div>

      <nav className="lesson-nav">
        <button className="btn" onClick={props.onPrev} disabled={!props.hasPrev}>
          ← Önceki
        </button>
        <button className={`btn ${lessonDone ? 'btn-primary' : ''}`} onClick={props.onNext} disabled={!props.hasNext}>
          Sonraki →
        </button>
      </nav>
    </div>
  );
}
