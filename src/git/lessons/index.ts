import type { Level, Lesson } from '../../lessons/types';
import { gitLevel1 } from './gitLevel1';
import { gitLevel2 } from './gitLevel2';
import { gitLevel3 } from './gitLevel3';
import { gitLevel4 } from './gitLevel4';

export { gitLevel1, gitLevel2, gitLevel3, gitLevel4 };

export const GIT_LEVELS: Level[] = [gitLevel1, gitLevel2, gitLevel3, gitLevel4];

export const GIT_ALL_LESSONS: Lesson[] = GIT_LEVELS.flatMap((l) => l.lessons);

export function findGitLesson(lessonId: string): { level: Level; lesson: Lesson; index: number } | null {
  for (const level of GIT_LEVELS) {
    const index = level.lessons.findIndex((l) => l.id === lessonId);
    if (index >= 0) return { level, lesson: level.lessons[index], index };
  }
  return null;
}
