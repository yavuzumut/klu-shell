import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header, type AppMode } from './components/Header';
import { LessonDrawer } from './components/LessonDrawer';
import { LessonPanel } from './components/LessonPanel';
import { FileTree } from './components/FileTree';
import { CongratsModal } from './components/CongratsModal';
import { CheatSheetView } from './cheatsheet/CheatSheetView';
import { ExploreView } from './explore/ExploreView';
import { GitIntroView } from './git/GitIntroView';
import { GitWorkspace } from './git/GitWorkspace';
import { createRegistry } from './core/commands';
import { createDefaultFS } from './core/fs/defaultTree';
import { Shell } from './core/shell/Shell';
import { quotePath } from './core/shell/parser';
import type { CommandRecord } from './core/shell/types';
import { ALL_LESSONS, findLesson, LEVELS } from './lessons/content';
import { createLessonFS, lessonStartCwd, runLessonSetupCommands } from './lessons/session';
import { evaluateCommand } from './lessons/validator';
import { taskKey, useProgress } from './state/useProgress';
import { TerminalView, type TerminalHandle } from './terminal/TerminalView';
import { useTheme } from './themes/useTheme';

const FIRST_LESSON_ID = ALL_LESSONS[0].id;
const MAIN_CURRICULUM_LESSONS = LEVELS.filter((l) => l.id !== 'level-0').flatMap((l) => l.lessons);

const ansi = {
  green: (s: string) => `\x1b[1;32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[1;36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};
const plain = (md: string) => md.replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');

type MobileTab = 'lesson' | 'terminal' | 'tree';

export default function App() {
  const { progress, actions } = useProgress(FIRST_LESSON_ID);
  const found = findLesson(progress.currentLessonId) ?? findLesson(FIRST_LESSON_ID)!;
  const { level, lesson, index: lessonIndex } = found;

  const [mode, setMode] = useState<AppMode>('lessons');
  const [showFileTree, setShowFileTree] = useState(false);

  // Shell for Lessons
  const [lessonShell] = useState(() => {
    const fs = createLessonFS(lesson);
    return new Shell({ fs, registry: createRegistry(), cwd: lessonStartCwd(lesson, fs), history: progress.history });
  });

  // Dedicated Shell for Sandbox (Serbest Mod)
  const [sandboxShell] = useState(() => {
    const fs = createDefaultFS();
    return new Shell({ fs, registry: createRegistry(), cwd: fs.home });
  });

  const activeShell = mode === 'lessons' ? lessonShell : sandboxShell;

  const [currentCwd, setCurrentCwd] = useState(activeShell.cwd);
  const termRef = useRef<TerminalHandle>(null);
  const recordsRef = useRef<CommandRecord[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>('lesson');
  const [gitView, setGitView] = useState<'intro' | 'workspace'>('intro');
  const [selectedGitLessonId, setSelectedGitLessonId] = useState<string | undefined>(undefined);

  // Sync cwd state on execute
  useEffect(() => {
    setCurrentCwd(activeShell.cwd);
  }, [activeShell, activeShell.cwd]);

  // Default showFileTree: in sandbox mode defaults to true on desktop
  const handleModeChange = useCallback(
    (newMode: AppMode) => {
      setMode(newMode);
      if (newMode === 'sandbox') {
        setShowFileTree(true);
        setMobileTab('terminal');
        const banner =
          ansi.cyan('── KLU Serbest Mod (Sandbox) ──') +
          '\n' +
          ansi.dim('İstediğin komutları dene. Yan panelde dosya ağacını canlı izleyebilirsin.') +
          '\n';
        requestAnimationFrame(() => {
          termRef.current?.resetScreen(banner);
        });
      } else if (newMode === 'lessons') {
        setShowFileTree(false);
        setMobileTab('lesson');
        const banner =
          ansi.cyan(`── Ders ${lessonIndex + 1}: ${lesson.title} ──`) +
          '\n' +
          ansi.dim("Komutları yazıp Enter'a bas. Yardım için: help") +
          '\n';
        requestAnimationFrame(() => {
          termRef.current?.resetScreen(banner);
        });
      }
    },
    [lesson.title, lessonIndex],
  );

  // Latest values for the (stable) terminal callback.
  const latest = useRef({ lesson, progress, mode });
  latest.current = { lesson, progress, mode };

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

  const sessionIdRef = useRef(0);

  /** Reset the virtual file system to the lesson's starting state. */
  const startLessonSession = useCallback(
    async (message?: string) => {
      const sessionId = ++sessionIdRef.current;
      const fs = createLessonFS(lesson);
      lessonShell.reset(fs, lessonStartCwd(lesson, fs), lesson.setup?.processes);
      await runLessonSetupCommands(lessonShell, lesson, () => sessionIdRef.current !== sessionId);
      if (sessionIdRef.current !== sessionId) return;
      setCurrentCwd(lessonShell.cwd);
      recordsRef.current = [];
      const banner =
        ansi.cyan(`── Ders ${lessonIndex + 1}: ${lesson.title} ──`) +
        '\n' +
        ansi.dim(message ?? "Komutları yazıp Enter'a bas. Yardım için: help") +
        '\n';
      termRef.current?.resetScreen(banner);
    },
    [lesson, lessonIndex, lessonShell],
  );

  // Reset sandbox FS
  const resetSandboxFS = useCallback(() => {
    const fs = createDefaultFS();
    sandboxShell.reset(fs, fs.home);
    setCurrentCwd(sandboxShell.cwd);
    const banner =
      ansi.cyan('── KLU Serbest Mod ──') +
      '\n' +
      ansi.dim('Sanal dosya sistemi sıfırlandı.') +
      '\n';
    termRef.current?.resetScreen(banner);
  }, [sandboxShell]);

  // New lesson → fresh file system (if in lesson mode).
  useEffect(() => {
    if (mode === 'lessons') {
      startLessonSession();
    }
    return () => {
      sessionIdRef.current++;
    };
  }, [lesson.id, mode, startLessonSession]);

  const onExecuted = useCallback(
    (record: CommandRecord): string | void => {
      const { lesson: cur, progress: p, mode: curMode } = latest.current;
      actions.setHistory(activeShell.history);
      setCurrentCwd(activeShell.cwd);

      // Only evaluate tasks in lessons mode
      if (curMode !== 'lessons') {
        return undefined;
      }

      recordsRef.current.push(record);
      const completed = p.completed[cur.id] ?? [];
      const result = evaluateCommand(cur, completed, {
        fs: activeShell.fs,
        cwd: activeShell.cwd,
        last: record,
        records: recordsRef.current,
        shell: activeShell,
        env: activeShell.env,
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
        let msg = ansi.green(`✔ Görev tamamlandı: ${plain(task.description)}`);
        if (!remaining.length) msg += '\n' + ansi.green('🎉 Ders tamamlandı! Sol paneldeki "Sonraki →" ile devam et.');
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
        let msg = hint ? ansi.yellow(`💡 İpucu: ${plain(hint)}`) : '';
        if (attempts >= 3) msg += (msg ? '\n' : '') + ansi.dim('Takıldın mı? Sol panelde "Çözümü göster" düğmesi açıldı.');
        return msg || undefined;
      }
    },
    [actions, activeShell],
  );

  const goToLesson = useCallback(
    (id: string) => {
      actions.setCurrentLesson(id);
      setMode('lessons');
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

  const handleTreeSelectPath = useCallback((path: string, node: { type: 'file' | 'dir' }) => {
    const pretty = activeShell.fs.prettyPath(path);
    const target = quotePath(pretty);
    const cmd = node.type === 'dir' ? `cd ${target}` : `cat ${target}`;
    setMobileTab('terminal');
    requestAnimationFrame(() => {
      termRef.current?.setLine(cmd);
      termRef.current?.focus();
    });
  }, [activeShell]);

  const handleCheatSheetRun = useCallback((command: string) => {
    setMode('sandbox');
    setShowFileTree(true);
    setMobileTab('terminal');
    requestAnimationFrame(() => {
      termRef.current?.setLine(command);
      termRef.current?.focus();
    });
  }, []);

  const completedTaskIds = progress.completed[lesson.id] ?? [];

  const toggleFileTree = useCallback(() => {
    const next = !showFileTree;
    setShowFileTree(next);
    // Hiding the tree while its mobile tab is active would leave an empty view.
    if (!next && mobileTab === 'tree') setMobileTab(mode === 'lessons' ? 'lesson' : 'terminal');
  }, [showFileTree, mobileTab, mode]);
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

  const themeControls = useTheme();

  const level0 = LEVELS.find((l) => l.id === 'level-0');
  const level0FirstLessonId = level0?.lessons[0]?.id ?? FIRST_LESSON_ID;
  const hasCompletedAnyLevel0 = level0?.lessons.some((l) => isLessonDone(l.id)) ?? false;

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem('klu_dismiss_level0_banner') === '1';
    } catch {
      return false;
    }
  });

  const handleDismissBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem('klu_dismiss_level0_banner', '1');
    } catch {
      // ignore
    }
  }, []);

  const [congratsSeen, setCongratsSeen] = useState(() => {
    try {
      return localStorage.getItem('klu_congrats_seen') === '1';
    } catch {
      return false;
    }
  });
  const [congratsOpen, setCongratsOpen] = useState(false);

  const isMainCurriculumCompleted = useMemo(
    () => MAIN_CURRICULUM_LESSONS.every((l) => isLessonDone(l.id)),
    [isLessonDone],
  );

  useEffect(() => {
    if (isMainCurriculumCompleted && !congratsSeen) {
      setCongratsOpen(true);
    }
  }, [isMainCurriculumCompleted, congratsSeen]);

  const handleCloseCongrats = useCallback(() => {
    setCongratsOpen(false);
    setCongratsSeen(true);
    try {
      localStorage.setItem('klu_congrats_seen', '1');
    } catch {
      // ignore
    }
  }, []);

  const handleCongratsGoToSandbox = useCallback(() => {
    handleCloseCongrats();
    handleModeChange('sandbox');
  }, [handleCloseCongrats, handleModeChange]);

  const handleCongratsGoToGit = useCallback(() => {
    handleCloseCongrats();
    setGitView('intro');
    handleModeChange('git');
  }, [handleCloseCongrats, handleModeChange]);

  const handleResetAll = useCallback(() => {
    actions.resetAll();
    try {
      localStorage.removeItem('klu_congrats_seen');
    } catch {
      // ignore
    }
    setCongratsSeen(false);
    setCongratsOpen(false);
    activeShell.history.length = 0;
    startLessonSession('İlerleme sıfırlandı.');
  }, [actions, activeShell.history, startLessonSession]);

  const showLevel0Banner = mode === 'lessons' && !hasCompletedAnyLevel0 && !bannerDismissed;

  return (
    <div className={`app app-mode-${mode} ${showFileTree ? 'with-tree' : ''}`}>
      <Header
        levels={LEVELS}
        currentLevel={level}
        currentLessonId={lesson.id}
        isLessonDone={isLessonDone}
        onSelectLesson={goToLesson}
        onOpenMenu={() => setDrawerOpen(true)}
        mode={mode}
        onModeChange={handleModeChange}
        showFileTree={showFileTree}
        onToggleFileTree={toggleFileTree}
        themeControls={themeControls}
      />

      {showLevel0Banner && (
        <div className="level0-callout-bar" role="region" aria-label="Yeni başlayanlar için rehber">
          <button
            className="level0-callout-btn"
            onClick={() => goToLesson(level0FirstLessonId)}
          >
            🌱 Yeni misin? <strong>'Başlamadan Önce'</strong> ile başla →
          </button>
          <button
            className="level0-callout-close"
            onClick={handleDismissBanner}
            aria-label="Kapat"
            title="Kapat"
          >
            ✕
          </button>
        </div>
      )}

      {mode === 'git' ? (
        gitView === 'workspace' ? (
          <GitWorkspace
            onBackToIntro={() => {
              setSelectedGitLessonId(undefined);
              setGitView('intro');
            }}
            terminalTheme={themeControls.terminalTheme}
            initialLessonId={selectedGitLessonId}
          />
        ) : (
          <main className="page-container">
            <GitIntroView
              onStartLesson={(lessonId) => {
                setSelectedGitLessonId(lessonId);
                setGitView('workspace');
              }}
            />
          </main>
        )
      ) : mode === 'cheatsheet' ? (
        <main className="page-container">
          <CheatSheetView onRunInSandbox={handleCheatSheetRun} />
        </main>
      ) : mode === 'explore' ? (
        <main className="page-container">
          <ExploreView />
        </main>
      ) : (
        <>
          <div className="mobile-tabs" role="tablist">
            {mode === 'lessons' ? (
              <>
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
                {showFileTree && (
                  <button className={mobileTab === 'tree' ? 'active' : ''} onClick={() => setMobileTab('tree')}>
                    🗂️ Ağaç
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  className={mobileTab === 'terminal' ? 'active' : ''}
                  onClick={() => {
                    setMobileTab('terminal');
                    requestAnimationFrame(() => termRef.current?.focus());
                  }}
                >
                  ⌨️ Terminal
                </button>
                {showFileTree && (
                  <button className={mobileTab === 'tree' ? 'active' : ''} onClick={() => setMobileTab('tree')}>
                    🗂️ Dosya Ağacı
                  </button>
                )}
              </>
            )}
          </div>

          <main className={`panels show-${mobileTab} layout-${mode} ${showFileTree ? 'has-tree' : 'no-tree'}`}>
            {mode === 'lessons' && (
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
            )}

            <section className="panel panel-terminal">
              <div className="terminal-chrome">
                <span className="dots" aria-hidden>
                  <i /> <i /> <i />
                </span>
                <span className="terminal-title">
                  {mode === 'sandbox' ? 'kullanici@klu: bash (serbest mod)' : 'kullanici@klu: bash'}
                </span>
                {mode === 'sandbox' && (
                  <div className="sandbox-chrome-actions">
                    <button
                      className="btn btn-small btn-ghost"
                      onClick={resetSandboxFS}
                      title="Sanal dosya sistemini sıfırla"
                    >
                      ↺ Sıfırla
                    </button>
                  </div>
                )}
              </div>
              <TerminalView
                ref={termRef}
                shell={activeShell}
                onExecuted={onExecuted}
                terminalTheme={themeControls.terminalTheme}
              />
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

            {showFileTree && (
              <aside className="panel panel-tree">
                <FileTree
                  fs={activeShell.fs}
                  cwd={currentCwd}
                  onSelectPath={handleTreeSelectPath}
                  onResetFs={mode === 'sandbox' ? resetSandboxFS : () => startLessonSession('Dosya sistemi sıfırlandı.')}
                />
              </aside>
            )}
          </main>
        </>
      )}

      <LessonDrawer
        open={drawerOpen}
        levels={LEVELS}
        currentLessonId={lesson.id}
        isLessonDone={isLessonDone}
        onSelectLesson={goToLesson}
        onClose={() => setDrawerOpen(false)}
        onResetAll={handleResetAll}
        mode={mode}
        onModeChange={handleModeChange}
        showFileTree={showFileTree}
        onToggleFileTree={toggleFileTree}
      />

      <CongratsModal
        open={congratsOpen}
        onClose={handleCloseCongrats}
        onGoToSandbox={handleCongratsGoToSandbox}
        onGoToGit={handleCongratsGoToGit}
      />
    </div>
  );
}
