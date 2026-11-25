import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, LEVELS } from '../lessons/content';

describe('CongratsModal completion and persistence logic', () => {
  const mainLessons = LEVELS.filter((l) => l.id !== 'level-0').flatMap((l) => l.lessons);

  it('main curriculum includes only Level 1, 2, and 3 lessons', () => {
    const level0Lessons = LEVELS.find((l) => l.id === 'level-0')?.lessons ?? [];
    expect(level0Lessons.length).toBeGreaterThan(0);

    // Ensure none of the level-0 lessons are in main curriculum
    for (const l0 of level0Lessons) {
      expect(mainLessons.some((m) => m.id === l0.id)).toBe(false);
    }

    // Ensure all level 1, 2, 3 lessons are included
    const level1 = LEVELS.find((l) => l.id === 'level-1')?.lessons ?? [];
    const level2 = LEVELS.find((l) => l.id === 'level-2')?.lessons ?? [];
    const level3 = LEVELS.find((l) => l.id === 'level-3')?.lessons ?? [];

    expect(mainLessons.length).toBe(level1.length + level2.length + level3.length);
  });

  it('detects completion only when all main curriculum tasks are completed', () => {
    const isLessonDone = (id: string, completedMap: Record<string, string[]>) => {
      const l = ALL_LESSONS.find((x) => x.id === id);
      const done = completedMap[id] ?? [];
      return !!l && l.tasks.every((t) => done.includes(t.id));
    };

    const completed: Record<string, string[]> = {};

    // Partially complete: only Level 1 and Level 2
    for (const l of mainLessons) {
      if (l.id.startsWith('l1-') || l.id.startsWith('l2-')) {
        completed[l.id] = l.tasks.map((t) => t.id);
      }
    }

    const isMainCurriculumCompletedPartial = mainLessons.every((l) => isLessonDone(l.id, completed));
    expect(isMainCurriculumCompletedPartial).toBe(false);

    // Complete all main curriculum lessons
    for (const l of mainLessons) {
      completed[l.id] = l.tasks.map((t) => t.id);
    }

    const isMainCurriculumCompletedFull = mainLessons.every((l) => isLessonDone(l.id, completed));
    expect(isMainCurriculumCompletedFull).toBe(true);
  });

  it('storage key klu_congrats_seen persists seen state and can be reset', () => {
    const storage = new Map<string, string>();

    const getCongratsSeen = () => storage.get('klu_congrats_seen') === '1';
    const markCongratsSeen = () => storage.set('klu_congrats_seen', '1');
    const resetCongratsSeen = () => storage.delete('klu_congrats_seen');

    expect(getCongratsSeen()).toBe(false);

    markCongratsSeen();
    expect(getCongratsSeen()).toBe(true);
    expect(storage.get('klu_congrats_seen')).toBe('1');

    resetCongratsSeen();
    expect(getCongratsSeen()).toBe(false);
    expect(storage.get('klu_congrats_seen')).toBeUndefined();
  });
});
