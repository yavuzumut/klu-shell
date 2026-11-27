import { describe, expect, it } from 'vitest';
import { createRegistry } from '../core/commands';
import { createDefaultFS } from '../core/fs/defaultTree';
import { Shell } from '../core/shell/Shell';
import type { CommandRecord } from '../core/shell/types';
import { ALL_LESSONS, LEVELS } from './content';
import type { Lesson } from './types';
import type { Lang } from '../i18n/types';
import { localizeLesson } from '../i18n/localize';
import { runLessonSetupCommands } from './session';
import { evaluateCheck, evaluateCommand, isReadOnlyGitCommand, isWrongAttempt } from './validator';

function sessionFor(lesson: Lesson, lang: Lang = 'tr') {
  const { cwd, processes, ...seed } = lesson.setup ?? {};
  const fs = createDefaultFS(seed);
  const shell = new Shell({ fs, registry: createRegistry(), cwd, lang });
  const activeLesson = localizeLesson(lesson, lang);
  if (processes) {
    for (const p of processes) shell.addProcess(p);
  }
  const records: CommandRecord[] = [];
  const completed: string[] = [];
  const run = async (line: string) => {
    const last = await shell.execute(line);
    records.push(last);
    const result = evaluateCommand(activeLesson, completed, {
      fs: shell.fs,
      cwd: shell.cwd,
      last,
      records,
      shell,
      env: shell.env,
    });
    if (result.completedTaskId) completed.push(result.completedTaskId);
    return result;
  };
  return { shell, run, completed };
}

describe('lesson content', () => {
  it('has unique lesson and task ids', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of ALL_LESSONS) {
      const taskIds = l.tasks.map((t) => t.id);
      expect(new Set(taskIds).size).toBe(taskIds.length);
      expect(l.tasks.length).toBeGreaterThanOrEqual(1);
      expect(l.tasks.length).toBeLessThanOrEqual(3);
    }
    expect(LEVELS[0].lessons.length).toBeGreaterThan(0);
    expect(LEVELS[1].lessons.length).toBeGreaterThan(0);
    expect(LEVELS[2].lessons.length).toBeGreaterThan(0);
    expect(LEVELS[3].lessons.length).toBeGreaterThan(0);
  });

  // Every task must be solvable by its own published solution.
  for (const lesson of ALL_LESSONS) {
    it(`solutions complete all tasks of "${lesson.title}"`, async () => {
      const { run, completed } = sessionFor(lesson);
      for (const task of lesson.tasks) {
        const result = await run(task.solution);
        expect(result.completedTaskId, `task ${task.id}`).toBe(task.id);
      }
      expect(completed).toEqual(lesson.tasks.map((t) => t.id));
    });

    it(`English solutions complete all tasks of "${lesson.title}"`, async () => {
      const { shell, run, completed } = sessionFor(lesson, 'en');
      await runLessonSetupCommands(shell, lesson);
      for (const task of localizeLesson(lesson, 'en').tasks) {
        const result = await run(task.solution);
        expect(result.completedTaskId, `task ${task.id}`).toBe(task.id);
      }
      expect(completed).toEqual(lesson.tasks.map((task) => task.id));
    });
  }
});

describe('validator', () => {
  const lesson: Lesson = {
    id: 't',
    title: 't',
    summary: '',
    content: '',
    examples: [],
    tasks: [
      {
        id: 'mk',
        description: '',
        hints: [],
        solution: 'mkdir ornek',
        check: { type: 'pathExists', path: '~/ornek', kind: 'dir' },
      },
      {
        id: 'ls',
        description: '',
        hints: [],
        solution: 'ls -la',
        check: { type: 'commandUsed', command: 'ls', flags: ['a', 'l'] },
      },
    ],
  };

  it('completes tasks in order and counts wrong attempts', async () => {
    const { run } = sessionFor(lesson);
    expect(await run('ls')).toMatchObject({ completedTaskId: null, wrongAttempt: false });
    expect(await run('mkdir baska')).toMatchObject({ completedTaskId: null, wrongAttempt: true });
    expect(await run('cd yok')).toMatchObject({ wrongAttempt: true });
    expect(await run('mkdir ornek')).toMatchObject({ completedTaskId: 'mk' });
    expect(await run('ls -l')).toMatchObject({ completedTaskId: null, wrongAttempt: true });
    expect(await run('ls -l -a')).toMatchObject({ completedTaskId: 'ls' });
    expect(await run('pwd')).toMatchObject({ activeTaskId: null });
  });

  it('evaluates composite checks', async () => {
    const fs = createDefaultFS();
    const shell = new Shell({ fs, registry: createRegistry() });
    const last = await shell.execute('echo merhaba');
    const state = { fs, cwd: shell.cwd, last, records: [last] };
    expect(evaluateCheck({ type: 'outputContains', text: 'merhaba' }, state)).toBe(true);
    expect(evaluateCheck({ type: 'cwdIs', path: '~' }, state)).toBe(true);
    expect(evaluateCheck({ type: 'fileContains', path: '/etc/hostname', text: 'klu' }, state)).toBe(true);
    expect(
      evaluateCheck(
        {
          type: 'any',
          checks: [
            { type: 'pathExists', path: '/nope' },
            { type: 'not', check: { type: 'pathExists', path: '/nope' } },
          ],
        },
        state,
      ),
    ).toBe(true);
    expect(evaluateCheck({ type: 'custom', fn: (s) => s.records.length === 1 }, state)).toBe(true);
  });

  it('treats exploration commands as neutral', async () => {
    const fs = createDefaultFS();
    const shell = new Shell({ fs, registry: createRegistry() });
    const task = lesson.tasks[0];
    expect(isWrongAttempt(task, await shell.execute('ls -la'))).toBe(false);
    expect(isWrongAttempt(task, await shell.execute('cat merhaba.txt'))).toBe(false);
    expect(isWrongAttempt(task, await shell.execute('cat yok'))).toBe(true);
    expect(isWrongAttempt(task, await shell.execute('touch x'))).toBe(true);
    expect(isWrongAttempt({ ...task, neutralCommands: ['touch'] }, await shell.execute('touch y'))).toBe(false);
  });

  it('identifies read-only git inspection commands including remote', () => {
    expect(isReadOnlyGitCommand(['git', 'status'])).toBe(true);
    expect(isReadOnlyGitCommand(['git', 'log'])).toBe(true);
    expect(isReadOnlyGitCommand(['git', 'diff'])).toBe(true);
    expect(isReadOnlyGitCommand(['git', 'branch'])).toBe(true);
    expect(isReadOnlyGitCommand(['git', 'branch', '-l'])).toBe(true);
    expect(isReadOnlyGitCommand(['git', 'remote'])).toBe(true);
    expect(isReadOnlyGitCommand(['git', 'remote', '-v'])).toBe(true);
    expect(isReadOnlyGitCommand(['git', 'remote', '--verbose'])).toBe(true);

    expect(isReadOnlyGitCommand(['git', 'remote', 'add', 'origin', 'url'])).toBe(false);
    expect(isReadOnlyGitCommand(['git', 'remote', 'remove', 'origin'])).toBe(false);
    expect(isReadOnlyGitCommand(['git', 'commit', '-m', 'test'])).toBe(false);
    expect(isReadOnlyGitCommand(['git', 'push'])).toBe(false);
  });
});

