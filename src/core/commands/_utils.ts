import { fsErrorMessage } from '../fs/VirtualFS';
import type { CommandContext } from '../shell/types';

export interface ParsedArgs {
  flags: Set<string>;
  operands: string[];
}

export class UsageError extends Error {}

/**
 * Minimal getopt-like parser for short flags.
 *  - `-la` == `-l -a`
 *  - `--` ends option parsing
 *  - long options are mapped through `longMap` (e.g. { all: 'a' })
 *  - a lone `-` is treated as an operand
 * Throws UsageError for unknown options.
 */
export function parseArgs(
  args: string[],
  allowed: string,
  longMap: Record<string, string> = {},
): ParsedArgs {
  const flags = new Set<string>();
  const operands: string[] = [];
  let endOfOptions = false;
  for (const arg of args) {
    if (endOfOptions || arg === '-' || !arg.startsWith('-')) {
      operands.push(arg);
    } else if (arg === '--') {
      endOfOptions = true;
    } else if (arg.startsWith('--')) {
      const long = arg.slice(2);
      if (!(long in longMap)) throw new UsageError(`unrecognized option '${arg}'`);
      flags.add(longMap[long]);
    } else {
      for (const ch of arg.slice(1)) {
        if (!allowed.includes(ch)) throw new UsageError(`invalid option -- '${ch}'`);
        flags.add(ch);
      }
    }
  }
  return { flags, operands };
}

/** Print a GNU style usage error and return exit code 2 (or `code`). */
export function usageError(ctx: CommandContext, message: string, code = 1): number {
  ctx.stderr(`${ctx.name}: ${message}\nTry '${ctx.name} --help' for more information.\n`);
  return code;
}

/** Parse args or report a usage error. Returns null when an error was printed. */
export function tryParseArgs(
  ctx: CommandContext,
  args: string[],
  allowed: string,
  longMap: Record<string, string> = {},
  errorCode = 1,
): ParsedArgs | null {
  try {
    return parseArgs(args, allowed, longMap);
  } catch (err) {
    if (err instanceof UsageError) {
      usageError(ctx, err.message, errorCode);
      return null;
    }
    throw err;
  }
}

export interface NumericOption {
  /** Raw value given by the user (e.g. "5", "+3"), or null if absent. */
  value: string | null;
  /** Remaining args with the option removed. */
  rest: string[];
}

/**
 * Pull a numeric option such as `-n 5`, `-n5`, `-5`, `--lines=5` or
 * `--lines 5` out of `args` (used by head/tail). Throws UsageError when the
 * option is given without a value.
 */
export function extractNumericOption(args: string[], short: string, long: string): NumericOption {
  const rest: string[] = [];
  let value: string | null = null;
  let endOfOptions = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (endOfOptions || arg === '-' || !arg.startsWith('-')) {
      rest.push(arg);
    } else if (arg === '--') {
      endOfOptions = true;
      rest.push(arg);
    } else if (arg === `-${short}` || arg === `--${long}`) {
      if (i + 1 >= args.length) throw new UsageError(`option requires an argument -- '${short}'`);
      value = args[++i];
    } else if (arg.startsWith(`--${long}=`)) {
      value = arg.slice(long.length + 3);
    } else if (arg.startsWith(`-${short}`)) {
      value = arg.slice(2);
    } else if (/^-\d+$/.test(arg)) {
      value = arg.slice(1);
    } else {
      rest.push(arg);
    }
  }
  return { value, rest };
}

export interface InputSource {
  /** Name to show in messages/headers ("-" style stdin is "(standard input)"). */
  name: string;
  text: string;
  isStdin: boolean;
}

/**
 * Read every operand as a file (or stdin for `-` / when there are no
 * operands). Errors are printed as `cmd: NAME: message` and reported through
 * the returned `failed` flag.
 */
export function readInputs(ctx: CommandContext, operands: string[]): { inputs: InputSource[]; failed: boolean } {
  const inputs: InputSource[] = [];
  let failed = false;
  const targets = operands.length ? operands : ['-'];
  for (const target of targets) {
    if (target === '-') {
      inputs.push({ name: '(standard input)', text: ctx.stdin ?? '', isStdin: true });
      continue;
    }
    try {
      inputs.push({ name: target, text: ctx.fs.readFile(ctx.resolve(target)), isStdin: false });
    } catch (err) {
      ctx.stderr(`${ctx.name}: ${target}: ${fsErrorMessage(err)}\n`);
      failed = true;
    }
  }
  return { inputs, failed };
}

/** Split text into lines, dropping the empty string after a final newline. */
export function splitLines(text: string): string[] {
  if (!text) return [];
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  return lines;
}

/** Join lines back into text with a trailing newline (empty for no lines). */
export function joinLines(lines: string[]): string {
  return lines.length ? lines.join('\n') + '\n' : '';
}

/** ANSI helpers (only applied when output goes to the terminal). */
export const color = {
  dir: (s: string) => `\x1b[1;34m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
};
