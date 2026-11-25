import type { VirtualFS } from '../fs/VirtualFS';
import type { Shell } from './Shell';

/** Everything a command needs while it runs. */
export interface CommandContext {
  /** Name the command was invoked with (argv[0]). */
  name: string;
  fs: VirtualFS;
  shell: Shell;
  /** Current working directory (absolute). */
  cwd: string;
  env: Record<string, string>;
  /** Data piped/redirected into the command, or null when reading from the terminal. */
  stdin: string | null;
  /** True when stdout goes straight to the terminal (enables colors/columns). */
  isTTY: boolean;
  stdout(text: string): void;
  stderr(text: string): void;
  /** Resolve a user supplied path against the cwd. */
  resolve(path: string): string;
}

export interface CommandDefinition {
  name: string;
  /** One-line Turkish summary used by `help`. */
  summary: string;
  /** Usage line, e.g. "ls [-la] [DOSYA]...". */
  usage: string;
  /** Turkish manual page body used by `man`. */
  manPage: string;
  /** Run the command and return an exit code (0 = success). */
  run(args: string[], ctx: CommandContext): number | Promise<number>;
  /** Optional: restrict tab completion of arguments ("dirs" only for cd). */
  completion?: 'files' | 'dirs' | 'commands' | 'none';
}

export interface OutputChunk {
  stream: 'stdout' | 'stderr';
  text: string;
}

/** Record of one executed command line, used by the lesson validator. */
export interface CommandRecord {
  line: string;
  /** argv of every simple command in the line, after expansion. */
  commands: string[][];
  exitCode: number;
  /** Text printed to the terminal (stdout + stderr in order). */
  output: OutputChunk[];
  stdout: string;
  stderr: string;
  cwdBefore: string;
  cwdAfter: string;
}

export interface ShellProcess {
  pid: number;
  user: string;
  cpu: string;
  mem: string;
  vsz: number;
  rss: number;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}
