import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LessonPanel } from '../components/LessonPanel';
import { TerminalView, type TerminalHandle } from '../terminal/TerminalView';
import { FileTree } from '../components/FileTree';
import { createRegistry } from '../core/commands';
import { Shell } from '../core/shell/Shell';
import { quotePath } from '../core/shell/parser';
import type { CommandRecord } from '../core/shell/types';
import { createLessonFS, lessonStartCwd, runLessonSetupCommands } from '../lessons/session';
import { evaluateCommand } from '../lessons/validator';
import { GIT_STORAGE_KEY, taskKey, useProgress } from '../state/useProgress';
import type { ITheme } from '@xterm/xterm';
import { findGitLesson, GIT_ALL_LESSONS, GIT_LEVELS } from './lessons';
import { useI18n } from '../i18n/I18nProvider';
import { localizeLesson, localizeLevels } from '../i18n/localize';

const FIRST_GIT_LESSON_ID = GIT_ALL_LESSONS[0].id;

const ansi = {
  green: (s: string) => `\x1b[1;32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[1;36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};
const plain = (md: string) => md.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');

type MobileTab = 'lesson' | 'terminal' | 'tree';

interface GitWorkspaceProps {
  onBackToIntro: () => void;
  terminalTheme?: ITheme;
  initialLessonId?: string;
}

export function GitWorkspace({ onBackToIntro, terminalTheme, initialLessonId }: GitWorkspaceProps) {
  const { lang, t } = useI18n();
  const { progress, actions } = useProgress(FIRST_GIT_LESSON_ID, GIT_STORAGE_KEY);
  const lastAppliedInitialId = useRef<string | undefined>(undefined);
  const sessionIdRef = useRef(0);

  // If initialLessonId is provided and genuinely changed, switch to it without overriding user navigation
  useEffect(() => {
    if (initialLessonId && initialLessonId !== lastAppliedInitialId.current) {
      lastAppliedInitialId.current = initialLessonId;
      const exists = findGitLesson(initialLessonId);
      if (exists) {
        actions.setCurrentLesson(initialLessonId);
      }
    }
  }, [initialLessonId, actions]);

  const rawFound = findGitLesson(progress.currentLessonId) ?? findGitLesson(FIRST_GIT_LESSON_ID)!;
  const level = useMemo(() => localizeLevels([rawFound.level], lang, true)[0], [rawFound.level, lang]);
  const lesson = useMemo(() => localizeLesson(rawFound.lesson, lang, true), [rawFound.lesson, lang]);
  const lessonIndex = rawFound.index;

  const localizedGitLevels = useMemo(() => localizeLevels(GIT_LEVELS, lang, true), [lang]);

  const [showFileTree, setShowFileTree] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>('lesson');

  const [gitShell] = useState(() => {
    const fs = createLessonFS(rawFound.lesson);
    return new Shell({
      fs,
      registry: createRegistry(),
      cwd: lessonStartCwd(rawFound.lesson, fs),
      history: progress.history,
      lang,
    });
  });

  useEffect(() => {
    gitShell.lang = lang;
  }, [gitShell, lang]);

  const [currentCwd, setCurrentCwd] = useState(gitShell.cwd);
  const termRef = useRef<TerminalHandle>(null);
  const recordsRef = useRef<CommandRecord[]>([]);

  useEffect(() => {
    setCurrentCwd(gitShell.cwd);
  }, [gitShell.cwd]);

  const latest = useRef({ lesson, progress });
  latest.current = { lesson, progress };

  const lessonPos = GIT_ALL_LESSONS.findIndex((l) => l.id === lesson.id);
  const prevLesson = GIT_ALL_LESSONS[lessonPos - 1];
  const nextLesson = GIT_ALL_LESSONS[lessonPos + 1];

  const isLessonDone = useCallback(
    (id: string) => {
      const l = GIT_ALL_LESSONS.find((x) => x.id === id);
      const done = progress.completed[id] ?? [];
      return !!l && l.tasks.every((t) => done.includes(t.id));
    },
    [progress.completed],
  );

  const startLessonSession = useCallback(
    async (message?: string) => {
      const sessionId = ++sessionIdRef.current;
      const fs = createLessonFS(lesson);
      gitShell.reset(fs, lessonStartCwd(lesson, fs), lesson.setup?.processes);
      await runLessonSetupCommands(gitShell, lesson, () => sessionIdRef.current !== sessionId);
      if (sessionIdRef.current !== sessionId) return;

      setCurrentCwd(gitShell.cwd);
      recordsRef.current = [];
      const banner =
        ansi.cyan(`── Git ${level.number}: ${lesson.title} ──`) +
        '\n' +
        ansi.dim(message ?? t('terminal.bannerGitHintDefault')) +
        '\n';
      termRef.current?.resetScreen(banner);
    },
    [gitShell, lesson, level.number, t],
  );

  useEffect(() => {
    startLessonSession();
    return () => {
      sessionIdRef.current++;
    };
  }, [lesson.id, startLessonSession]);

  const onExecuted = useCallback(
    (record: CommandRecord): string | void => {
      const { lesson: cur, progress: p } = latest.current;
      actions.setHistory(gitShell.history);
      setCurrentCwd(gitShell.cwd);

      recordsRef.current.push(record);
      const completed = p.completed[cur.id] ?? [];
      const result = evaluateCommand(cur, completed, {
        fs: gitShell.fs,
        cwd: gitShell.cwd,
        last: record,
        records: recordsRef.current,
        shell: gitShell,
        env: gitShell.env,
      });

      if (result.completedTaskId) {
        const taskId = result.completedTaskId;
        actions.completeTask(cur.id, taskId);
        latest.current = {
          ...latest.current,
          progress: { ...p, completed: { ...p.completed, [cur.id]: [...completed, taskId] } },
        };
        const task = cur.tasks.find((t) => t.id === taskId)!;
        const remaining = cur.tasks.filter((t) => t.id !== taskId && !completed.includes(t.id));
        let msg = ansi.green(t('terminal.taskCompleted', { desc: plain(task.description) }));
        if (!remaining.length) msg += '\n' + ansi.green(t('terminal.lessonCompleted'));
        return msg;
      }

      if (result.wrongAttempt && result.activeTaskId) {
        const task = cur.tasks.find((t) => t.id === result.activeTaskId)!;
        const attempts = (p.attempts[taskKey(cur.id, task.id)] ?? 0) + 1;
        actions.addAttempt(cur.id, task.id);
        latest.current = {
          ...latest.current,
          progress: { ...p, attempts: { ...p.attempts, [taskKey(cur.id, task.id)]: attempts } },
        };
        const hint = task.hints[Math.min(attempts, task.hints.length) - 1];
        let msg = hint ? ansi.yellow(t('terminal.hintPrefix', { hint: plain(hint) })) : '';
        if (attempts >= 3) msg += (msg ? '\n' : '') + ansi.dim(t('terminal.stuckHint'));
        return msg || undefined;
      }
    },
    [actions, gitShell, t],
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
    requestAnimationFrame(() => {
      termRef.current?.setLine(cmd);
      termRef.current?.focus();
    });
  }, []);

  const handleTreeSelectPath = useCallback(
    (path: string, node: { type: 'file' | 'dir' }) => {
      const pretty = gitShell.fs.prettyPath(path);
      const target = quotePath(pretty);
      const cmd = node.type === 'dir' ? `cd ${target}` : `cat ${target}`;
      setMobileTab('terminal');
      requestAnimationFrame(() => {
        termRef.current?.setLine(cmd);
        termRef.current?.focus();
      });
    },
    [gitShell],
  );

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

  const completedLessonsCount = GIT_ALL_LESSONS.filter((l) => isLessonDone(l.id)).length;
  const progressPercent = Math.round((completedLessonsCount / GIT_ALL_LESSONS.length) * 100);

  return (
    <div className={`git-workspace-root ${showFileTree ? 'with-tree' : ''}`}>
      {/* Top Bar */}
      <header className="git-workspace-header">
        <div className="git-ws-left">
          <button
            type="button"
            className="btn btn-small btn-ghost git-back-btn"
            onClick={onBackToIntro}
            title={t('gitWorkspace.backToIntroTitle')}
          >
            {t('gitWorkspace.backToIntro')}
          </button>
          <div className="git-level-pills" role="tablist" aria-label={t('gitWorkspace.levelsAria')}>
            {localizedGitLevels.map((lvl) => {
              const isActive = lvl.id === level.id;
              const lvlDone = lvl.lessons.every((l) => isLessonDone(l.id));
              return (
                <button
                  key={lvl.id}
                  type="button"
                  className={`git-level-pill ${isActive ? 'active' : ''} ${lvlDone ? 'done' : ''}`}
                  onClick={() => goToLesson(lvl.lessons[0].id)}
                  title={t('gitWorkspace.levelTitle', { title: lvl.title, count: lvl.lessons.length })}
                >
                  {lvlDone && <span className="git-pill-check">✓</span>}
                  <span>Git {lvl.number}</span>
                </button>
              );
            })}
          </div>

          <div className="git-lesson-segments" aria-label={t('gitWorkspace.lessonsAria', { title: level.title })}>
            {level.lessons.map((l, i) => {
              const isCurrent = l.id === lesson.id;
              const isDone = isLessonDone(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  className={`git-lesson-segment ${isCurrent ? 'active' : ''} ${isDone ? 'done' : ''}`}
                  onClick={() => goToLesson(l.id)}
                  title={`${t('gitWorkspace.lessonTitle', { num: i + 1, title: l.title })}${isDone ? t('gitWorkspace.lessonCompletedSuffix') : ''}`}
                >
                  {isDone && !isCurrent ? '✓' : i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <div className="git-ws-right">
          <div className="git-ws-progress">
            <span className="git-ws-progress-text">
              {t('gitWorkspace.progressText', { done: completedLessonsCount, total: GIT_ALL_LESSONS.length, percent: progressPercent })}
            </span>
            <div className="git-ws-progress-bar">
              <div className="git-ws-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <button
            type="button"
            className={`btn btn-small ${showFileTree ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowFileTree((prev) => !prev)}
            title={t('gitWorkspace.treeToggleTitle')}
          >
            {t('gitWorkspace.treeBtn')}
          </button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="mobile-tabs" role="tablist">
        <button className={mobileTab === 'lesson' ? 'active' : ''} onClick={() => setMobileTab('lesson')}>
          {t('mobileTabs.lesson')}
        </button>
        <button
          className={mobileTab === 'terminal' ? 'active' : ''}
          onClick={() => {
            setMobileTab('terminal');
            requestAnimationFrame(() => termRef.current?.focus());
          }}
        >
          {t('mobileTabs.terminal')}
        </button>
        {showFileTree && (
          <button className={mobileTab === 'tree' ? 'active' : ''} onClick={() => setMobileTab('tree')}>
            {t('mobileTabs.fileTree')}
          </button>
        )}
      </div>

      {/* Panels */}
      <main className={`panels show-${mobileTab} layout-lessons ${showFileTree ? 'has-tree' : 'no-tree'}`}>
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
              startLessonSession(t('terminal.sessionRestartLesson'));
            }}
            onResetTerminal={() => startLessonSession(t('terminal.sessionResetFs'))}
          />
        </section>

        <section className="panel panel-terminal">
          <div className="terminal-chrome">
            <span className="dots" aria-hidden>
              <i /> <i /> <i />
            </span>
            <span className="terminal-title">{t('terminal.titleGit')}</span>
          </div>
          <TerminalView
            ref={termRef}
            shell={gitShell}
            onExecuted={onExecuted}
            terminalTheme={terminalTheme}
          />
          <div className="key-bar" aria-label={t('terminal.keysAria')}>
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

        {showFileTree && (
          <aside className="panel panel-tree">
            <FileTree
              fs={gitShell.fs}
              cwd={currentCwd}
              onSelectPath={handleTreeSelectPath}
              onResetFs={() => startLessonSession(t('terminal.sessionFsReset'))}
            />
          </aside>
        )}
      </main>
    </div>
  );
}
