import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/Header';
import { LessonDrawer } from './components/LessonDrawer';
import { LessonPanel } from './components/LessonPanel';
import { createRegistry } from './core/commands';
import { Shell } from './core/shell/Shell';
import type { CommandRecord } from './core/shell/types';
import { ALL_LESSONS, findLesson, LEVELS } from './lessons/content';
import { createLessonFS, lessonStartCwd } from './lessons/session';
import { evaluateCommand } from './lessons/validator';
import { taskKey, useProgress } from './state/useProgress';
import { TerminalView, type TerminalHandle } from './terminal/TerminalView';

const FIRST_LESSON_ID = ALL_LESSONS[0].id;

const ansi = {
  green: (s: string) => `\x1b[1;32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[1;36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};
const plain = (md: string) => md.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');

type MobileTab = 'lesson' | 'terminal';

export default function App() {
  const { progress, actions } = useProgress(FIRST_LESSON_ID);
  const found = findLesson(progress.currentLessonId) ?? findLesson(FIRST_LESSON_ID)!;
  const { level, lesson, index: lessonIndex } = found;

  const [shell] = useState(() => {
    const fs = createLessonFS(lesson);
    return new Shell({ fs, registry: createRegistry(), cwd: lessonStartCwd(lesson, fs), history: progress.history });
  });
  const termRef = useRef<TerminalHandle>(null);
  const recordsRef = useRef<CommandRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('lesson');

  // Latest values for the (stable) terminal callback.
  const latest = useRef({ lesson, progress });
  latest.current = { lesson, progress };

  const lessonPos = ALL_LESSONS.findIndex((l) => l.id === lesson.id);
  const prevLesson = ALL_LESSONS[lessonPos - 1];
  const nextLesson = ALL_LESSONS[lessonPos + 1];

  const isLessonDone = useCallback(
    (id: string) => {
      const l = ALL_LESSONS.find((x) => x.id === id);
      const done = progress.completed[id] ?? [];
      return !!l && l.tasks.every((t) => done.includes(t.id));
    },
    [progress.completed],
  );

  /** Reset the virtual file system to the lesson's starting state. */
  const startLessonSession = useCallback(
    (message?: string) => {
      const fs = createLessonFS(lesson);
      shell.reset(fs, lessonStartCwd(lesson, fs));
      recordsRef.current = [];
      const banner =
        ansi.cyan(`── Ders ${lessonIndex + 1}: ${lesson.title} ──`) +
        '\n' +
        ansi.dim(message ?? "Komutları yazıp Enter'a bas. Yardım için: help") +
        '\n';
      termRef.current?.resetScreen(banner);
    },
    [lesson, lessonIndex, shell],
  );

  // New lesson → fresh file system.
  useEffect(() => {
    startLessonSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id]);

  const onExecuted = useCallback(
    (record: CommandRecord): string | void => {
      const { lesson: cur, progress: p } = latest.current;
      recordsRef.current.push(record);
      actions.setHistory(shell.history);

      const completed = p.completed[cur.id] ?? [];
      const result = evaluateCommand(cur, completed, {
        fs: shell.fs,
        cwd: shell.cwd,
        last: record,
        records: recordsRef.current,
      });

      if (result.completedTaskId) {
        const taskId = result.completedTaskId;
        actions.completeTask(cur.id, taskId);
        // Update the ref right away so a fast next command sees it.
        latest.current = {
          lesson: cur,
          progress: { ...p, completed: { ...p.completed, [cur.id]: [...completed, taskId] } },
        };
        const task = cur.tasks.find((t) => t.id === taskId)!;
        const remaining = cur.tasks.filter((t) => t.id !== taskId && !completed.includes(t.id));
        let msg = ansi.green(`✔ Görev tamamlandı: ${plain(task.description)}`);
        if (!remaining.length) msg += '\n' + ansi.green('🎉 Ders tamamlandı! Sol paneldeki "Sonraki →" ile devam et.');
        return msg;
      }

      if (result.wrongAttempt && result.activeTaskId) {
        const task = cur.tasks.find((t) => t.id === result.activeTaskId)!;
        const attempts = (p.attempts[taskKey(cur.id, task.id)] ?? 0) + 1;
        actions.addAttempt(cur.id, task.id);
        latest.current = {
          lesson: cur,
          progress: { ...p, attempts: { ...p.attempts, [taskKey(cur.id, task.id)]: attempts } },
        };
        const hint = task.hints[Math.min(attempts, task.hints.length) - 1];
        let msg = hint ? ansi.yellow(`💡 İpucu: ${plain(hint)}`) : '';
        if (attempts >= 3) msg += (msg ? '\n' : '') + ansi.dim('Takıldın mı? Sol panelde "Çözümü göster" düğmesi açıldı.');
        return msg || undefined;
      }
    },
    [actions, shell],
  );

  const goToLesson = useCallback(
    (id: string) => {
      actions.setCurrentLesson(id);
      setMobileTab('lesson');
    },
    [actions],
  );

  const insertCommand = useCallback((cmd: string) => {
    setMobileTab('terminal');
    // Wait for the terminal tab to become visible on mobile before focusing.
    requestAnimationFrame(() => termRef.current?.insert(cmd));
  }, []);

  const completedTaskIds = progress.completed[lesson.id] ?? [];
  const mobileKeys = useMemo(
    () => [
      { label: 'Tab', data: '\t' },
      { label: '↑', data: '\x1b[A' },
      { label: '↓', data: '\x1b[B' },
      { label: '←', data: '\x1b[D' },
      { label: '→', data: '\x1b[C' },
      { label: '~', data: '~' },
      { label: '/', data: '/' },
      { label: '-', data: '-' },
      { label: 'Ctrl+C', data: '\x03' },
    ],
    [],
  );

  return (
    <div className="app">
      <Header
        levels={LEVELS}
        currentLevel={level}
        currentLessonId={lesson.id}
        isLessonDone={isLessonDone}
        onSelectLesson={goToLesson}
        onOpenMenu={() => setDrawerOpen(true)}
      />

      <div className="mobile-tabs" role="tablist">
        <button className={mobileTab === 'lesson' ? 'active' : ''} onClick={() => setMobileTab('lesson')}>
          📖 Ders
        </button>
        <button
          className={mobileTab === 'terminal' ? 'active' : ''}
          onClick={() => {
            setMobileTab('terminal');
            requestAnimationFrame(() => termRef.current?.focus());
          }}
        >
          ⌨️ Terminal
        </button>
      </div>

      <main className={`panels show-${mobileTab}`}>
        <section className="panel panel-lesson">
          <LessonPanel
            level={level}
            lesson={lesson}
            lessonIndex={lessonIndex}
            completedTaskIds={completedTaskIds}
            attemptsFor={(taskId) => progress.attempts[taskKey(lesson.id, taskId)] ?? 0}
            isRevealed={(taskId) => !!progress.revealed[taskKey(lesson.id, taskId)]}
            hasPrev={!!prevLesson}
            hasNext={!!nextLesson}
            onPrev={() => prevLesson && goToLesson(prevLesson.id)}
            onNext={() => nextLesson && goToLesson(nextLesson.id)}
            onRevealSolution={(taskId) => actions.revealSolution(lesson.id, taskId)}
            onInsertCommand={insertCommand}
            onRestartLesson={() => {
              actions.restartLesson(lesson.id);
              startLessonSession('Ders baştan başladı.');
            }}
            onResetTerminal={() => startLessonSession('Dosya sistemi dersin başlangıç haline döndürüldü.')}
          />
        </section>

        <section className="panel panel-terminal">
          <div className="terminal-chrome">
            <span className="dots" aria-hidden>
              <i /> <i /> <i />
            </span>
            <span className="terminal-title">kullanici@termi: bash</span>
          </div>
          <TerminalView ref={termRef} shell={shell} onExecuted={onExecuted} />
          <div className="key-bar" aria-label="Terminal tuşları">
            {mobileKeys.map((k) => (
              <button
                key={k.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => termRef.current?.sendKey(k.data)}
              >
                {k.label}
              </button>
            ))}
          </div>
        </section>
      </main>

      <LessonDrawer
        open={drawerOpen}
        levels={LEVELS}
        currentLessonId={lesson.id}
        isLessonDone={isLessonDone}
        onSelectLesson={goToLesson}
        onClose={() => setDrawerOpen(false)}
        onResetAll={() => {
          actions.resetAll();
          shell.history.length = 0;
          startLessonSession('İlerleme sıfırlandı.');
        }}
      />
    </div>
  );
}
