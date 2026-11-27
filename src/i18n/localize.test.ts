import { describe, it, expect } from 'vitest';
import { ALL_LESSONS, LEVELS } from '../lessons/content';
import { GIT_ALL_LESSONS } from '../git/lessons';
import { CHEAT_SHEET_DATA } from '../cheatsheet/data';
import { EXPLORE_TOOLS } from '../explore/data';
import { GIT_INTRO_DATA } from '../git/intro';
import { ALL_COMMANDS } from '../core/commands';
import { EN_GIT_LESSONS } from './content/en/gitLessons';
import { EN_LESSONS } from './content/en/lessons';
import { localizeFixtureText, localizeTaskCheck } from './fixtureLocale';
import {
  localizeLesson,
  localizeLevels,
  localizeCheatSheet,
  localizeExplore,
  localizeGitIntro,
  getCommandDoc,
} from './localize';

describe('i18n content localization & coverage', () => {
  it('leaves content intact when lang is tr', () => {
    const l1 = ALL_LESSONS[0];
    const localized = localizeLesson(l1, 'tr');
    expect(localized.title).toBe(l1.title);
    expect(localized.tasks[0].description).toBe(l1.tasks[0].description);
  });

  it('translates all Linux lessons to English without altering task IDs or validation checks', () => {
    for (const lesson of ALL_LESSONS) {
      const en = localizeLesson(lesson, 'en');
      expect(en.title).not.toBe('');
      expect(en.summary).not.toBe('');
      expect(en.content).not.toBe('');
      expect(en.tasks.length).toBe(lesson.tasks.length);

      for (let i = 0; i < lesson.tasks.length; i++) {
        expect(en.tasks[i].id).toBe(lesson.tasks[i].id);
        expect(en.tasks[i].solution).toBe(localizeFixtureText(EN_LESSONS[lesson.id]?.tasks?.[lesson.tasks[i].id]?.solution ?? lesson.tasks[i].solution, 'en'));
        expect(en.tasks[i].check).toEqual(localizeTaskCheck(lesson.tasks[i].check, 'en'));
        expect(en.tasks[i].description).not.toBe('');
      }
    }
  });

  it('translates all Git lessons to English without altering task IDs or validation checks', () => {
    for (const lesson of GIT_ALL_LESSONS) {
      const en = localizeLesson(lesson, 'en', true);
      expect(en.title).not.toBe('');
      expect(en.summary).not.toBe('');
      expect(en.content).not.toBe('');
      expect(en.tasks.length).toBe(lesson.tasks.length);

      for (let i = 0; i < lesson.tasks.length; i++) {
        expect(en.tasks[i].id).toBe(lesson.tasks[i].id);
        expect(en.tasks[i].solution).toBe(localizeFixtureText(EN_GIT_LESSONS[lesson.id]?.tasks?.[lesson.tasks[i].id]?.solution ?? lesson.tasks[i].solution, 'en'));
        expect(en.tasks[i].check).toEqual(localizeTaskCheck(lesson.tasks[i].check, 'en'));
      }
    }
  });

  it('translates Levels metadata', () => {
    const localizedLevels = localizeLevels(LEVELS, 'en');
    expect(localizedLevels[0].title).toBe('Before You Begin');
    expect(localizedLevels[1].title).toBe('Beginner');
  });

  it('translates Cheat Sheet categories and items', () => {
    const localized = localizeCheatSheet(CHEAT_SHEET_DATA, 'en');
    expect(localized[0].title).toBe('Navigation & Location');
    expect(localized[0].items[0].description).toContain('working directory');
  });

  it('translates Explore tools', () => {
    const localized = localizeExplore(EXPLORE_TOOLS, 'en');
    const ytdlp = localized.find((t) => t.id === 'yt-dlp');
    expect(ytdlp?.description).toContain('Download video or audio');
  });

  it('translates Git Intro data', () => {
    const localized = localizeGitIntro(GIT_INTRO_DATA, 'en');
    expect(localized.header.title).toContain('Why Git');
    expect(localized.threeAreas.areas[0].name).toBe('Working Directory');
  });

  it('provides localized command docs for core commands', () => {
    for (const cmd of ALL_COMMANDS) {
      const trDoc = getCommandDoc(cmd, 'tr');
      const enDoc = getCommandDoc(cmd, 'en');
      expect(trDoc.summary).toBe(cmd.summary);
      expect(enDoc.summary).not.toBe('');
      expect(enDoc.usage).not.toBe('');
    }
  });
});
