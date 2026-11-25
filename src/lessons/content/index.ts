import type { Level } from '../types';
import { level0 } from './level0';
import { level1 } from './level1';
import { level2 } from './level2';
import { level3 } from './level3';

export { level3 };

export const LEVELS: Level[] = [level0, level1, level2, level3];

export function findLesson(lessonId: string) {
  for (const level of LEVELS) {
    const index = level.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { level, lesson: level.lessons[index], index };
  }
  return null;
}

/** All lessons in order across levels. */
export const ALL_LESSONS = LEVELS.flatMap((l) => l.lessons);
