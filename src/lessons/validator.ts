import type { CommandRecord } from '../core/shell/types';
import type { CheckState, Lesson, Task, TaskCheck } from './types';

/** Commands used to look around; they never count as a wrong attempt. */
export const EXPLORATION_COMMANDS = new Set([
  'ls',
  'pwd',
  'cat',
  'help',
  'man',
  'clear',
  'history',
  'echo',
  // Read-only Level 2 commands
  'head',
  'tail',
  'wc',
  'grep',
  'sort',
  'uniq',
  'find',
]);

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1b\[[0-9;]*[A-Za-z]/g;

function hasFlag(args: string[], flag: string): boolean {
  return args.some((a) => (a.startsWith('-') && !a.startsWith('--') && a.slice(1).includes(flag)) || a === `--${flag}`);
}

export function evaluateCheck(check: TaskCheck, state: CheckState): boolean {
  const resolve = (p: string) => state.fs.resolve(p, state.cwd);
  switch (check.type) {
    case 'pathExists': {
      const node = state.fs.tryLookup(resolve(check.path));
      return !!node && (!check.kind || node.type === check.kind);
    }
    case 'pathNotExists':
      return !state.fs.exists(resolve(check.path));
    case 'fileContains': {
      const node = state.fs.tryLookup(resolve(check.path));
      return node?.type === 'file' && node.content.includes(check.text);
    }
    case 'cwdIs':
      return state.cwd === state.fs.resolve(check.path, '/');
    case 'commandUsed': {
      if (!check.allowFailure && state.last.exitCode !== 0) return false;
      return state.last.commands.some(([name, ...args]) => {
        if (name !== check.command) return false;
        if (check.args && !check.args.every((a) => args.includes(a))) return false;
        if (check.flags && !check.flags.every((f) => hasFlag(args, f))) return false;
        return true;
      });
    }
    case 'outputContains':
      return state.last.stdout.replace(ANSI_RE, '').includes(check.text);
    case 'all':
      return check.checks.every((c) => evaluateCheck(c, state));
    case 'any':
      return check.checks.some((c) => evaluateCheck(c, state));
    case 'not':
      return !evaluateCheck(check.check, state);
    case 'custom':
      return check.fn(state);
  }
}

/** Commands referenced by `commandUsed` checks inside `check`. */
function expectedCommands(check: TaskCheck): string[] {
  switch (check.type) {
    case 'commandUsed':
      return [check.command];
    case 'all':
    case 'any':
      return check.checks.flatMap(expectedCommands);
    default:
      return [];
  }
}

/** True if the command line should count as a wrong attempt for `task`. */
export function isWrongAttempt(task: Task, record: CommandRecord): boolean {
  if (!record.commands.length) return record.exitCode !== 0; // e.g. syntax error
  // A failing command always counts.
  if (record.exitCode !== 0) return true;
  // Using the expected command without satisfying the task counts too.
  const expected = new Set(expectedCommands(task.check));
  if (record.commands.some(([name]) => expected.has(name))) return true;
  // Otherwise only non-exploration commands count.
  const neutral = new Set([...EXPLORATION_COMMANDS, ...(task.neutralCommands ?? [])]);
  return record.commands.some(([name]) => !neutral.has(name));
}

export interface TaskEvaluation {
  /** Id of the task that was completed by this command, if any. */
  completedTaskId: string | null;
  /** True if the command counts as a wrong attempt for the active task. */
  wrongAttempt: boolean;
  /** Id of the task that was active when the command ran. */
  activeTaskId: string | null;
}

/** First task of the lesson that is not completed yet. */
export function activeTask(lesson: Lesson, completed: Iterable<string>): Task | null {
  const done = new Set(completed);
  return lesson.tasks.find((t) => !done.has(t.id)) ?? null;
}

/**
 * Evaluate the lesson's active task after a command ran.
 * Tasks are completed in order, one per command.
 */
export function evaluateCommand(lesson: Lesson, completed: Iterable<string>, state: CheckState): TaskEvaluation {
  const task = activeTask(lesson, completed);
  if (!task) return { completedTaskId: null, wrongAttempt: false, activeTaskId: null };
  if (evaluateCheck(task.check, state)) {
    return { completedTaskId: task.id, wrongAttempt: false, activeTaskId: task.id };
  }
  return { completedTaskId: null, wrongAttempt: isWrongAttempt(task, state.last), activeTaskId: task.id };
}
