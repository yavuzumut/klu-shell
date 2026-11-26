import { createDefaultFS } from '../core/fs/defaultTree';
import type { VirtualFS } from '../core/fs/VirtualFS';
import type { Lesson } from './types';

/** Fresh file system for a lesson: default tree + the lesson's setup. */
export function createLessonFS(lesson: Lesson): VirtualFS {
  const { cwd: _cwd, ...seed } = lesson.setup ?? {};
  void _cwd;
  return createDefaultFS(seed);
}

export function lessonStartCwd(lesson: Lesson, fs: VirtualFS): string {
  return lesson.setup?.cwd ? fs.resolve(lesson.setup.cwd) : fs.home;
}

/** Execute setup commands silently if defined on the lesson. */
export async function runLessonSetupCommands(
  shell: { execute(cmd: string, options?: { recordHistory?: boolean }): Promise<unknown> },
  lesson: Lesson,
): Promise<void> {
  if (!lesson.setup?.setupCommands?.length) return;
  for (const cmd of lesson.setup.setupCommands) {
    await shell.execute(cmd, { recordHistory: false });
  }
}

