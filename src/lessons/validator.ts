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
  // Read-only / inspection Level 3 commands
  'whoami',
  'uname',
  'date',
  'env',
  'which',
  'ps',
  'stat',
  'realpath',
  'basename',
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
      const content = node?.type === 'file'
        ? state.shell?.lang === 'en'
          ? state.shell.displayText(node.content)
          : node.content
        : '';
      return node?.type === 'file' && content.includes(check.text);
    }
    case 'cwdIs':
      return state.cwd === state.fs.resolve(check.path, '/');
    case 'fileMode': {
      const node = state.fs.tryLookup(resolve(check.path));
      return !!node && (node.mode & 0o777) === (check.mode & 0o777);
    }
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
export function expectedCommands(check: TaskCheck): string[] {
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

/** Check if a command is a read-only git inspection command (status, log, diff, branch without create/delete arguments, or remote list/verbose). */
export function isReadOnlyGitCommand(cmd: string[]): boolean {
  if (cmd[0] !== 'git') return false;
  const sub = cmd[1];
  if (sub === 'status' || sub === 'log' || sub === 'diff') return true;
  if (sub === 'branch') {
    const subargs = cmd.slice(2);
    return subargs.length === 0 || subargs.every((a) => a === '--list' || a === '-l');
  }
  if (sub === 'remote') {
    const subargs = cmd.slice(2);
    return subargs.length === 0 || subargs.every((a) => a === '-v' || a === '--verbose');
  }
  return false;
}

/** Check if a task check specifically expects a given git subcommand. */
export function taskSpecificallyExpectsGitSubcommand(check: TaskCheck, subcommand: string): boolean {
  switch (check.type) {
    case 'commandUsed':
      return check.command === 'git' && (check.args ? check.args.includes(subcommand) : false);
    case 'all':
    case 'any':
      return check.checks.some((c) => taskSpecificallyExpectsGitSubcommand(c, subcommand));
    case 'not':
      return taskSpecificallyExpectsGitSubcommand(check.check, subcommand);
    default:
      return false;
  }
}

/** Check if the executed command matches the command expected by the task check. */
export function isUsingExpectedCommand(cmd: string[], check: TaskCheck): boolean {
  switch (check.type) {
    case 'commandUsed': {
      if (cmd[0] !== check.command) return false;
      if (check.command === 'git' && check.args && check.args.length > 0) {
        const expectedSub = check.args[0];
        const actualSub = cmd[1];
        return actualSub === expectedSub;
      }
      return true;
    }
    case 'all':
    case 'any':
      return check.checks.some((c) => isUsingExpectedCommand(cmd, c));
    default:
      return false;
  }
}

/** True if the command line should count as a wrong attempt for `task`. */
export function isWrongAttempt(task: Task, record: CommandRecord): boolean {
  if (!record.commands.length) return record.exitCode !== 0; // e.g. syntax error
  // A failing command always counts.
  if (record.exitCode !== 0) return true;

  // Using the expected command without satisfying the task counts too.
  if (record.commands.some((cmd) => isUsingExpectedCommand(cmd, task.check))) {
    return true;
  }

  // Otherwise only non-exploration commands count.
  const neutral = new Set([...EXPLORATION_COMMANDS, ...(task.neutralCommands ?? [])]);
  return record.commands.some((cmd) => {
    const [name] = cmd;
    if (neutral.has(name)) return false;

    // Read-only Git inspection commands do not count as wrong attempts
    // unless the active task specifically expects that command.
    if (isReadOnlyGitCommand(cmd)) {
      const sub = cmd[1] ?? '';
      if (!taskSpecificallyExpectsGitSubcommand(task.check, sub)) {
        return false;
      }
    }

    return true;
  });
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
