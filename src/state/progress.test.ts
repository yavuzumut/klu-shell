import { describe, expect, it } from 'vitest';
import { loadProgress, STORAGE_KEY } from './useProgress';
import { ALL_LESSONS } from '../lessons/content';

class MockStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe('progress persistence and initial lesson', () => {
  const firstLessonId = ALL_LESSONS[0].id;

  it('first lesson of the curriculum is Level 0 first lesson', () => {
    expect(firstLessonId).toBe('l0-intro');
  });

  it('new user starts at Level 0 first lesson when no saved progress exists', () => {
    const storage = new MockStorage();
    const progress = loadProgress(firstLessonId, storage);
    expect(progress.currentLessonId).toBe('l0-intro');
  });

  it('returning user continues from their saved currentLessonId', () => {
    const storage = new MockStorage();
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        currentLessonId: 'l1-listing',
        completed: { 'l1-welcome': ['pwd'] },
        attempts: {},
        revealed: {},
        history: ['pwd'],
      }),
    );

    const progress = loadProgress(firstLessonId, storage);
    expect(progress.currentLessonId).toBe('l1-listing');
    expect(progress.completed['l1-welcome']).toEqual(['pwd']);
  });

  it('corrupted storage safely falls back to Level 0 first lesson', () => {
    const storage = new MockStorage();
    storage.setItem(STORAGE_KEY, 'not-valid-json');

    const progress = loadProgress(firstLessonId, storage);
    expect(progress.currentLessonId).toBe('l0-intro');
  });

  describe('Level 0 callout banner visibility', () => {
    const isBannerVisible = (hasCompletedAnyLevel0: boolean, isDismissed: boolean) => {
      return !hasCompletedAnyLevel0 && !isDismissed;
    };

    it('shows banner when user has not completed any Level 0 lesson and not dismissed', () => {
      expect(isBannerVisible(false, false)).toBe(true);
    });

    it('hides banner once dismissed', () => {
      expect(isBannerVisible(false, true)).toBe(false);
    });

    it('hides banner once user completes at least one Level 0 lesson', () => {
      expect(isBannerVisible(true, false)).toBe(false);
      expect(isBannerVisible(true, true)).toBe(false);
    });
  });
});
