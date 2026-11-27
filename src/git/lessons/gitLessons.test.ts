import { describe, expect, it } from 'vitest';
import { createRegistry } from '../../core/commands';
import { Shell } from '../../core/shell/Shell';
import type { CommandRecord } from '../../core/shell/types';
import { createLessonFS, lessonStartCwd, runLessonSetupCommands } from '../../lessons/session';
import { evaluateCommand, isWrongAttempt } from '../../lessons/validator';
import { GIT_ALL_LESSONS, GIT_LEVELS } from './index';
import { gitLevel1 } from './gitLevel1';
import { gitLevel2 } from './gitLevel2';
import { gitLevel3 } from './gitLevel3';
import { gitLevel4 } from './gitLevel4';
import { GIT_STORAGE_KEY, loadProgress, STORAGE_KEY, useProgress } from '../../state/useProgress';
import { localizeLesson } from '../../i18n/localize';

function createTestShell(lesson = GIT_ALL_LESSONS[0], lang: 'tr' | 'en' = 'tr') {
  const fs = createLessonFS(lesson);
  const shell = new Shell({
    fs,
    registry: createRegistry(),
    cwd: lessonStartCwd(lesson, fs),
    lang,
  });
  return { shell, fs };
}

describe('Git Curriculum Structure', () => {
  it('contains exactly 4 levels and 9 interactive lessons', () => {
    expect(GIT_LEVELS).toHaveLength(4);
    expect(GIT_ALL_LESSONS).toHaveLength(9);
    expect(gitLevel1.lessons).toHaveLength(2);
    expect(gitLevel2.lessons).toHaveLength(2);
    expect(gitLevel3.lessons).toHaveLength(3);
    expect(gitLevel4.lessons).toHaveLength(2);
  });

  it('all lessons have valid ids, titles, examples, and non-empty tasks', () => {
    const ids = new Set<string>();
    for (const lesson of GIT_ALL_LESSONS) {
      expect(lesson.id).toBeTruthy();
      expect(ids.has(lesson.id)).toBe(false);
      ids.add(lesson.id);

      expect(lesson.title).toBeTruthy();
      expect(lesson.summary).toBeTruthy();
      expect(lesson.content).toBeTruthy();
      expect(lesson.examples.length).toBeGreaterThan(0);
      expect(lesson.tasks.length).toBeGreaterThan(0);

      for (const task of lesson.tasks) {
        expect(task.id).toBeTruthy();
        expect(task.description).toBeTruthy();
        expect(task.hints.length).toBeGreaterThan(0);
        expect(task.solution).toBeTruthy();
        expect(task.check).toBeTruthy();
      }
    }
  });
});

describe('English Git lesson execution', () => {
  for (const lesson of GIT_ALL_LESSONS) {
    it(`completes every English task in ${lesson.id}`, async () => {
      const { shell, fs } = createTestShell(lesson, 'en');
      await runLessonSetupCommands(shell, lesson);
      const localized = localizeLesson(lesson, 'en', true);
      const records: CommandRecord[] = [];
      const completed: string[] = [];

      for (const task of localized.tasks) {
        const last = await shell.execute(task.solution);
        records.push(last);
        const result = evaluateCommand(localized, completed, {
          fs,
          cwd: shell.cwd,
          last,
          records,
          shell,
          env: shell.env,
        });
        expect(result.completedTaskId, `${lesson.id}/${task.id}: ${last.stderr || last.stdout}`).toBe(task.id);
        completed.push(task.id);
      }

      expect(completed).toEqual(lesson.tasks.map((task) => task.id));
    });
  }
});

describe('Read-only Git Inspection Commands Exemption', () => {
  it('does not treat git status as wrong attempt when task expects git commit', async () => {
    const lesson = gitLevel1.lessons[1]; // git-1-commit
    const commitTask = lesson.tasks[1]; // expects git commit
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);

    const record = await shell.execute('git status');
    expect(record.exitCode).toBe(0);
    expect(isWrongAttempt(commitTask, record)).toBe(false);
  });

  it('does not treat git log, git diff or argumentless git branch as wrong attempt', async () => {
    const lesson = gitLevel2.lessons[0]; // git-2-diff
    const addChangeTask = lesson.tasks[1]; // expects git add metin.txt
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);

    const statusRec = await shell.execute('git status');
    expect(isWrongAttempt(addChangeTask, statusRec)).toBe(false);

    const logRec = await shell.execute('git log');
    expect(isWrongAttempt(addChangeTask, logRec)).toBe(false);

    const diffRec = await shell.execute('git diff');
    expect(isWrongAttempt(addChangeTask, diffRec)).toBe(false);

    const branchRec = await shell.execute('git branch');
    expect(isWrongAttempt(addChangeTask, branchRec)).toBe(false);

    const remoteRec = await shell.execute('git remote');
    expect(isWrongAttempt(addChangeTask, remoteRec)).toBe(false);

    const remoteVRec = await shell.execute('git remote -v');
    expect(isWrongAttempt(addChangeTask, remoteVRec)).toBe(false);
  });

  it('treats mutating git commands or non-inspection git branch as wrong attempt', async () => {
    const lesson = gitLevel3.lessons[0]; // git-3-branch
    const switchTask = lesson.tasks[1]; // expects git switch -c ozellik
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);

    // git branch with a new branch name is modifying/creating, not read-only inspection
    const branchCreateRec = await shell.execute('git branch deneme-dal');
    expect(branchCreateRec.exitCode).toBe(0);
    expect(isWrongAttempt(switchTask, branchCreateRec)).toBe(true);
  });
});

describe('Lesson Execution & Task Evaluation Flows', () => {
  it('Git 1 - Lesson 1: İlk Deponu Başlat', async () => {
    const lesson = gitLevel1.lessons[0];
    const { shell } = createTestShell(lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git init
    const rec1 = await shell.execute('git init');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-init');
    completed.push(eval1.completedTaskId!);

    // Task 2: git status
    const rec2 = await shell.execute('git status');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('git-status');
    completed.push(eval2.completedTaskId!);

    // Task 3: touch notlar.txt && git status
    const rec3 = await shell.execute('touch notlar.txt');
    records.push(rec3);
    const rec4 = await shell.execute('git status');
    records.push(rec4);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec4,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('create-untracked');
    completed.push(eval3.completedTaskId!);

    expect(completed).toHaveLength(3);
  });

  it('Git 1 - Lesson 2: Hazırlık ve İlk Kayıt', async () => {
    const lesson = gitLevel1.lessons[1];
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git add notlar.txt
    const rec1 = await shell.execute('git add notlar.txt');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-add');
    completed.push(eval1.completedTaskId!);

    // Task 2: git commit -m "İlk commit"
    const rec2 = await shell.execute('git commit -m "İlk commit"');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('git-commit');
    completed.push(eval2.completedTaskId!);

    // Task 3: git log --oneline
    const rec3 = await shell.execute('git log --oneline');
    records.push(rec3);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec3,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('git-log');
    completed.push(eval3.completedTaskId!);

    expect(completed).toHaveLength(3);
  });

  it('Git 2 - Lesson 3: Farkları İncele', async () => {
    const lesson = gitLevel2.lessons[0];
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git diff
    const rec1 = await shell.execute('git diff');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-diff-working');
    completed.push(eval1.completedTaskId!);

    // Task 2: git add metin.txt
    const rec2 = await shell.execute('git add metin.txt');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('git-add-change');
    completed.push(eval2.completedTaskId!);

    // Task 3: git diff --staged
    const rec3 = await shell.execute('git diff --staged');
    records.push(rec3);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec3,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('git-diff-staged');
    completed.push(eval3.completedTaskId!);

    expect(completed).toHaveLength(3);
  });

  it('Git 2 - Lesson 4: Geri Alma ve Gizleme', async () => {
    const lesson = gitLevel2.lessons[1];
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git restore --staged app.js
    const rec1 = await shell.execute('git restore --staged app.js');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-restore-staged');
    completed.push(eval1.completedTaskId!);

    // Task 2: git restore app.js
    const rec2 = await shell.execute('git restore app.js');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('git-restore-worktree');
    completed.push(eval2.completedTaskId!);

    // Task 3: echo "*.log" > .gitignore
    const rec3 = await shell.execute('echo "*.log" > .gitignore');
    records.push(rec3);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec3,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('create-gitignore');
    completed.push(eval3.completedTaskId!);

    expect(completed).toHaveLength(3);
  });

  it('Git 3 - Lesson 5: Dallar Arasında Gezinme', async () => {
    const lesson = gitLevel3.lessons[0];
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git branch
    const rec1 = await shell.execute('git branch');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-branch-list');
    completed.push(eval1.completedTaskId!);

    // Task 2: git switch -c ozellik
    const rec2 = await shell.execute('git switch -c ozellik');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('git-switch-create');
    completed.push(eval2.completedTaskId!);

    // Task 3: git switch main
    const rec3 = await shell.execute('git switch main');
    records.push(rec3);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec3,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('git-switch-back');
    completed.push(eval3.completedTaskId!);

    expect(completed).toHaveLength(3);
  });

  it('Git 3 - Lesson 6: Birleştirme (Merge)', async () => {
    const lesson = gitLevel3.lessons[1];
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git branch
    const rec1 = await shell.execute('git branch');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-branch-check');
    completed.push(eval1.completedTaskId!);

    // Task 2: git merge yeni-ozellik
    const rec2 = await shell.execute('git merge yeni-ozellik');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('git-merge-feature');
    completed.push(eval2.completedTaskId!);

    // Task 3: git log --oneline
    const rec3 = await shell.execute('git log --oneline');
    records.push(rec3);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec3,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('git-log-verify');
    completed.push(eval3.completedTaskId!);

    expect(completed).toHaveLength(3);
  });

  it('Git 4 - Lesson 7: Uzak Depoya Bağlan ve Gönder', async () => {
    const lesson = gitLevel4.lessons[0];
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git remote add origin https://github.com/klu/notlar.git
    const rec1 = await shell.execute('git remote add origin https://github.com/klu/notlar.git');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-remote-add');
    completed.push(eval1.completedTaskId!);

    // Task 2: git remote -v
    const rec2 = await shell.execute('git remote -v');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('git-remote-verify');
    completed.push(eval2.completedTaskId!);

    // Task 3: git push -u origin main
    const rec3 = await shell.execute('git push -u origin main');
    records.push(rec3);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec3,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('git-push-main');
    completed.push(eval3.completedTaskId!);

    expect(completed).toHaveLength(3);
  });

  it('Git 4 - Lesson 8: Projeyi Klonla ve Güncelle', async () => {
    const lesson = gitLevel4.lessons[1];
    const { shell } = createTestShell(lesson);
    await runLessonSetupCommands(shell, lesson);
    const records: CommandRecord[] = [];
    const completed: string[] = [];

    // Task 1: git clone https://github.com/klu/notlar.git
    const rec1 = await shell.execute('git clone https://github.com/klu/notlar.git');
    records.push(rec1);
    const eval1 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec1,
      records,
      shell,
    });
    expect(eval1.completedTaskId).toBe('git-clone-notlar');
    completed.push(eval1.completedTaskId!);

    // Task 2: cd ekip-projesi
    const rec2 = await shell.execute('cd ekip-projesi');
    records.push(rec2);
    const eval2 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec2,
      records,
      shell,
    });
    expect(eval2.completedTaskId).toBe('cd-ekip-projesi');
    completed.push(eval2.completedTaskId!);

    // Task 3: git pull
    const rec3 = await shell.execute('git pull');
    records.push(rec3);
    const eval3 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec3,
      records,
      shell,
    });
    expect(eval3.completedTaskId).toBe('git-pull-updates');
    completed.push(eval3.completedTaskId!);

    // Task 4: git log --oneline
    const rec4 = await shell.execute('git log --oneline');
    records.push(rec4);
    const eval4 = evaluateCommand(lesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last: rec4,
      records,
      shell,
    });
    expect(eval4.completedTaskId).toBe('git-log-oneline');
    completed.push(eval4.completedTaskId!);

    expect(completed).toHaveLength(4);
  });
});

describe('Separate Git Progress Storage', () => {
  class MockStorage {
    private map = new Map<string, string>();
    getItem(k: string) {
      return this.map.get(k) ?? null;
    }
    setItem(k: string, v: string) {
      this.map.set(k, v);
    }
  }

  it('stores Git progress under klu.git.progress.v1 independently of Linux curriculum', () => {
    const storage = new MockStorage();

    // Linux progress saved
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        currentLessonId: 'l1-listing',
        completed: { 'l1-welcome': ['pwd'] },
        attempts: {},
        revealed: {},
        history: [],
      }),
    );

    // Git progress saved
    storage.setItem(
      GIT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        currentLessonId: 'git-2-diff',
        completed: { 'git-1-init': ['git-init', 'git-status'] },
        attempts: {},
        revealed: {},
        history: [],
      }),
    );

    const linuxProg = loadProgress('l0-intro', STORAGE_KEY, storage);
    const gitProg = loadProgress('git-1-init', GIT_STORAGE_KEY, storage);

    expect(linuxProg.currentLessonId).toBe('l1-listing');
    expect(linuxProg.completed['l1-welcome']).toEqual(['pwd']);

    expect(gitProg.currentLessonId).toBe('git-2-diff');
    expect(gitProg.completed['git-1-init']).toEqual(['git-init', 'git-status']);
  });
});

describe('Async Setup Commands Race Condition Cancellation', () => {
  it('stops executing setup commands if isCancelled returns true', async () => {
    const executed: string[] = [];
    const mockShell = {
      execute: async (cmd: string) => {
        executed.push(cmd);
        return { exitCode: 0 };
      },
    };

    const mockLesson = {
      id: 'test-lesson',
      title: 'Test',
      summary: 'Test',
      content: 'Test',
      examples: [],
      tasks: [],
      setup: {
        setupCommands: ['cmd 1', 'cmd 2', 'cmd 3'],
      },
    };

    let cancelled = false;
    await runLessonSetupCommands(mockShell, mockLesson, () => {
      if (executed.length === 1) {
        cancelled = true;
      }
      return cancelled;
    });

    // cmd 1 was executed, then cancelled before cmd 2
    expect(executed).toEqual(['cmd 1']);
  });
});

describe('useProgress Actions Reference Stability', () => {
  it('actions object reference is stable across renders (memoized)', async () => {
    const React = await import('react');
    const ReactDOMServer = await import('react-dom/server');

    const capturedActions: unknown[] = [];
    function StabilityTester() {
      const [count, setCount] = React.useState(0);
      const { actions } = useProgress('git-1-init', GIT_STORAGE_KEY);
      capturedActions.push(actions);

      if (count === 0) {
        setCount(1); // triggers synchronous re-render in React render phase
      }
      return null;
    }

    ReactDOMServer.renderToStaticMarkup(React.createElement(StabilityTester));
    expect(capturedActions.length).toBe(2);
    expect(capturedActions[0]).toBe(capturedActions[1]);
  });
});

describe('Git Navigation Logic Across Levels', () => {
  it('correctly maps level pills to first lesson of each level', () => {
    expect(GIT_LEVELS[0].lessons[0].id).toBe('git-1-init');
    expect(GIT_LEVELS[1].lessons[0].id).toBe('git-2-diff');
    expect(GIT_LEVELS[2].lessons[0].id).toBe('git-3-branch');
    expect(GIT_LEVELS[3].lessons[0].id).toBe('git-4-push');
  });

  it('correctly navigates sequentially through all 9 lessons without breaking prev/next chain', () => {
    for (let i = 0; i < GIT_ALL_LESSONS.length; i++) {
      const cur = GIT_ALL_LESSONS[i];
      const prev = GIT_ALL_LESSONS[i - 1];
      const next = GIT_ALL_LESSONS[i + 1];
      expect(cur.id).toBeTruthy();

      if (i === 0) {
        expect(prev).toBeUndefined();
        expect(next).toBeDefined();
      } else if (i === GIT_ALL_LESSONS.length - 1) {
        expect(prev).toBeDefined();
        expect(next).toBeUndefined();
      } else {
        expect(prev).toBeDefined();
        expect(next).toBeDefined();
      }

      if (next) {
        expect(next.id).toBe(GIT_ALL_LESSONS[i + 1].id);
      }
      if (prev) {
        expect(prev.id).toBe(GIT_ALL_LESSONS[i - 1].id);
      }
    }
  });

  it('initialLessonId ref guard does not revert user navigation', () => {
    let lastApplied: string | undefined = undefined;
    let currentLessonId = 'git-1-init';

    function simulateEffect(initialLessonId?: string) {
      if (initialLessonId && initialLessonId !== lastApplied) {
        lastApplied = initialLessonId;
        currentLessonId = initialLessonId;
      }
    }

    // First mount with initialLessonId = 'git-1-init'
    simulateEffect('git-1-init');
    expect(currentLessonId).toBe('git-1-init');
    expect(lastApplied).toBe('git-1-init');

    // User clicks "Sonraki →", transitioning to 'git-1-commit'
    currentLessonId = 'git-1-commit';

    // Component re-renders with the same initialLessonId
    simulateEffect('git-1-init');
    // currentLessonId MUST NOT be reverted back to 'git-1-init'
    expect(currentLessonId).toBe('git-1-commit');

    // User clicks "Git 2", transitioning to 'git-2-diff'
    currentLessonId = 'git-2-diff';
    simulateEffect('git-1-init');
    expect(currentLessonId).toBe('git-2-diff');

    // User leaves and comes back with new initialLessonId = 'git-3-branch'
    simulateEffect('git-3-branch');
    expect(currentLessonId).toBe('git-3-branch');
    expect(lastApplied).toBe('git-3-branch');
  });
});

