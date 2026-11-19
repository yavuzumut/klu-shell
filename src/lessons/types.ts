import type { FsSeed, VirtualFS } from '../core/fs/VirtualFS';
import type { CommandRecord } from '../core/shell/types';

/** State a task check can look at after each command. */
export interface CheckState {
  fs: VirtualFS;
  cwd: string;
  /** The command line that was just executed. */
  last: CommandRecord;
  /** All command records since the lesson started (oldest first). */
  records: CommandRecord[];
}

/**
 * Declarative task checks. They are plain data so lessons can be written in
 * JSON as well as TypeScript. Paths may use `~`.
 */
export type TaskCheck =
  /** A path exists (optionally of a given kind). */
  | { type: 'pathExists'; path: string; kind?: 'file' | 'dir' }
  /** A path does not exist. */
  | { type: 'pathNotExists'; path: string }
  /** A file contains the given text. */
  | { type: 'fileContains'; path: string; text: string }
  /** The current working directory equals `path`. */
  | { type: 'cwdIs'; path: string }
  /**
   * The last command line ran `command` successfully.
   * `args`: each must appear as an argument; `flags`: each short flag
   * must be given (in any form: `-la`, `-a -l`, ...).
   */
  | { type: 'commandUsed'; command: string; args?: string[]; flags?: string[]; allowFailure?: boolean }
  /** The last command printed `text` (stdout). */
  | { type: 'outputContains'; text: string }
  | { type: 'all'; checks: TaskCheck[] }
  | { type: 'any'; checks: TaskCheck[] }
  | { type: 'not'; check: TaskCheck }
  /** Escape hatch for TS lessons. */
  | { type: 'custom'; fn: (state: CheckState) => boolean };

export interface Task {
  id: string;
  /** Markdown allowed (inline). */
  description: string;
  /** Shown progressively after wrong attempts. */
  hints: string[];
  /** Command(s) that solve the task; offered after 3 wrong attempts. */
  solution: string;
  check: TaskCheck;
  /**
   * Commands that should not count as wrong attempts for this task
   * (useful for multi-step tasks). Exploration commands like ls/pwd/cat
   * never count.
   */
  neutralCommands?: string[];
}

export interface LessonSetup extends FsSeed {
  /** Starting working directory (default: home). */
  cwd?: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** Short one-liner shown in lesson lists. */
  summary: string;
  /** Lesson body in Markdown. */
  content: string;
  /** Example commands shown as clickable chips. */
  examples: string[];
  setup?: LessonSetup;
  tasks: Task[];
}

export interface Level {
  id: string;
  number: number;
  title: string;
  description: string;
  lessons: Lesson[];
  /** Level is visible but locked until its content is written. */
  comingSoon?: boolean;
}
