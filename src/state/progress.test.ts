import { describe, expect, it } from 'vitest';
import { exportProgressPayload, importProgressPayload, loadProgress, STORAGE_KEY } from './useProgress';
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

  it('exports and imports Linux and Git progress together', () => {
    const linux = loadProgress('l0-intro', {
      getItem: () => JSON.stringify({ version: 1, currentLessonId: 'l1-listing', completed: { 'l0-intro': ['echo'] }, attempts: {}, revealed: {}, history: ['ls'] }),
    });
    const git = loadProgress('git-1-init', {
      getItem: () => JSON.stringify({ version: 1, currentLessonId: 'git-1-init', completed: { 'git-1-init': ['init'] }, attempts: {}, revealed: {}, history: ['git status'] }),
    });
    const imported = importProgressPayload(exportProgressPayload(linux, git));
    expect(imported?.linux.currentLessonId).toBe('l1-listing');
    expect(imported?.linux.completed['l0-intro']).toEqual(['echo']);
    expect(imported?.git.completed['git-1-init']).toEqual(['init']);
  });

  it('rejects malformed JSON and invalid payload envelopes', () => {
    expect(importProgressPayload('{broken')).toBeNull();
    expect(importProgressPayload(JSON.stringify({ format: 'wrong', linux: {}, git: {} }))).toBeNull();
  });

  it('drops prototype-pollution keys and malformed values during import', () => {
    const malicious = '{"format":"klu.progress.export.v1","linux":{"version":1,"currentLessonId":"l0-intro","completed":{"__proto__":["polluted"],"constructor":["bad"],"l0-intro":["ok",2]},"attempts":{"prototype":9,"l0-intro/task":3},"revealed":{"__proto__":true,"l0-intro/task":false},"history":["pwd",4]},"git":{"version":1,"completed":{},"attempts":{},"revealed":{},"history":[]}}';
    const imported = importProgressPayload(malicious);
    expect(imported?.linux.completed).toEqual({ 'l0-intro': ['ok'] });
    expect(imported?.linux.attempts).toEqual({ 'l0-intro/task': 3 });
    expect(imported?.linux.revealed).toEqual({ 'l0-intro/task': false });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
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
