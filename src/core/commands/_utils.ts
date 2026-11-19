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

/** ANSI helpers (only applied when output goes to the terminal). */
export const color = {
  dir: (s: string) => `\x1b[1;34m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
};
