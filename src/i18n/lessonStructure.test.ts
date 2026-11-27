import { describe, expect, it } from 'vitest';
import { ALL_LESSONS } from '../lessons/content';
import { GIT_ALL_LESSONS } from '../git/lessons';
import { localizeLesson } from './localize';

function structure(markdown: string) {
  const headings = [...markdown.matchAll(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/gm)].map((m) => m[1].length);
  const tables = (markdown.match(/^\s*\|.*\|\s*$/gm) ?? []).length;
  const codeBlocks = (markdown.match(/^\s*```/gm) ?? []).length;
  const callouts = (markdown.match(/^\s*>/gm) ?? []).length;
  const welcomeCards = (markdown.match(/class=["']klu-welcome-card["']/g) ?? []).length;
  return { headings, tables, codeBlocks, callouts, welcomeCards };
}

describe('TR/EN lesson task and example parity', () => {
  it.each([
    ['Linux', ALL_LESSONS, false],
    ['Git', GIT_ALL_LESSONS, true],
  ] as const)('%s lessons preserve task ordering, task counts, and example counts', (_name, lessons, isGit) => {
    for (const lesson of lessons) {
      const english = localizeLesson(lesson, 'en', isGit);
      const trStructure = structure(lesson.content);
      const enStructure = structure(english.content);
      expect(english.tasks.map((task) => task.id), `${lesson.id} task IDs`).toEqual(lesson.tasks.map((task) => task.id));
      expect(english.tasks.length, `${lesson.id} task count`).toBe(lesson.tasks.length);
      expect(english.examples?.length, `${lesson.id} example count`).toBe(lesson.examples.length);
      expect(enStructure.headings.length, `${lesson.id} section count`).toBe(trStructure.headings.length);
      expect(enStructure.tables, `${lesson.id} table rows`).toBe(trStructure.tables);
      expect(enStructure.callouts, `${lesson.id} callout count`).toBe(trStructure.callouts);
      expect(enStructure.welcomeCards, `${lesson.id} visual card count`).toBe(trStructure.welcomeCards);
      expect(english.content.trim(), `${lesson.id} English content`).not.toBe('');
    }
  });

  it('keeps the Linux introduction welcome card and prompt teaching sequence in both languages', () => {
    const lesson = ALL_LESSONS.find((item) => item.id === 'l0-intro')!;
    const english = localizeLesson(lesson, 'en');
    const trStructure = structure(lesson.content);
    const enStructure = structure(english.content);
    expect(enStructure).toEqual(trStructure);
    expect(english.content.indexOf('What Is Linux?')).toBeLessThan(english.content.indexOf('What Are the Terminal and Shell?'));
    expect(english.content.indexOf('What Are the Terminal and Shell?')).toBeLessThan(english.content.indexOf('prompt'));
    expect(english.content).toContain('klu-welcome-card');
    expect(english.content).toContain('| Part | Meaning |');
  });
});
