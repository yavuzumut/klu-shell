import type { Level } from '../types';
import { level0 } from './level0';
import { level1 } from './level1';

export const level2: Level = {
  id: 'level-2',
  number: 2,
  title: 'Orta',
  description: 'Pipe (|), yönlendirme (>, >>), grep, find ve dosya izinleri (chmod).',
  lessons: [],
  comingSoon: true,
};

export const level3: Level = {
  id: 'level-3',
  number: 3,
  title: 'İleri',
  description: 'Süreçler, bash scripting, ağ komutları ve paket yönetimi.',
  lessons: [],
  comingSoon: true,
};

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
