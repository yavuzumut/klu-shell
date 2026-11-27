import { describe, expect, it } from 'vitest';
import { ALL_COMMANDS } from '../core/commands';
import { CHEAT_SHEET_DATA } from '../cheatsheet/data';
import { EXPLORE_TOOLS } from '../explore/data';
import { GIT_INTRO_DATA } from '../git/intro';
import { GIT_ALL_LESSONS, GIT_LEVELS } from '../git/lessons';
import { ALL_LESSONS, LEVELS } from '../lessons/content';
import { THEME_LIST } from '../themes/themes';
import { localizeCheatSheet, localizeExplore, localizeGitIntro, localizeLesson } from './localize';
import { tr } from './dictionaries/tr';
import { en } from './dictionaries/en';
import { EN_CHEAT_SHEET } from './content/en/cheatsheet';
import { EN_COMMAND_DOCS } from './content/en/commandDocs';
import { EN_EXPLORE_TOOLS } from './content/en/explore';
import { EN_GIT_INTRO } from './content/en/gitIntro';
import { EN_GIT_LESSONS, EN_GIT_LEVELS } from './content/en/gitLessons';
import { EN_LESSONS, EN_LEVELS, EN_LESSON_EXAMPLES, EN_LESSON_EXTENSIONS } from './content/en/lessons';
import { localizeFixtureText, localizeTaskCheck } from './fixtureLocale';

const keys = (items: string[]) => [...items].sort();

function collectStringPaths(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return [prefix];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([key, child]) =>
    collectStringPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe('English translation catalog coverage', () => {
  it('matches all Linux and Git lesson, level, and task IDs', () => {
    expect(keys(Object.keys(EN_LESSONS))).toEqual(keys(ALL_LESSONS.map((lesson) => lesson.id)));
    expect(keys(Object.keys(EN_LEVELS))).toEqual(keys(LEVELS.map((level) => level.id)));
    expect(keys(Object.keys(EN_GIT_LESSONS))).toEqual(keys(GIT_ALL_LESSONS.map((lesson) => lesson.id)));
    expect(keys(Object.keys(EN_GIT_LEVELS))).toEqual(keys(GIT_LEVELS.map((level) => level.id)));
    expect(keys(Object.keys(EN_LESSON_EXAMPLES))).toEqual(keys(ALL_LESSONS.map((lesson) => lesson.id)));
    expect(keys(Object.keys(EN_LESSON_EXTENSIONS))).toEqual(keys(ALL_LESSONS.map((lesson) => lesson.id)));

    for (const [lessons, catalog] of [[ALL_LESSONS, EN_LESSONS], [GIT_ALL_LESSONS, EN_GIT_LESSONS]] as const) {
      for (const lesson of lessons) {
        const translated = catalog[lesson.id];
        expect(translated?.title, `${lesson.id} title`).toBeTruthy();
        expect(translated?.summary, `${lesson.id} summary`).toBeTruthy();
        expect(translated?.content, `${lesson.id} content`).toBeTruthy();
        expect(translated?.title).not.toBe(lesson.title);
        expect(translated?.summary).not.toBe(lesson.summary);
        expect(keys(Object.keys(translated?.tasks ?? {})), `${lesson.id} task IDs`).toEqual(
          keys(lesson.tasks.map((task) => task.id)),
        );
        const localized = localizeLesson(lesson, 'en', lessons === GIT_ALL_LESSONS);
        for (const task of lesson.tasks) {
          const localizedTask = localized.tasks.find((item) => item.id === task.id);
          expect(localizedTask?.description, `${lesson.id}/${task.id} description`).toBeTruthy();
          expect(localizedTask?.description).not.toBe(task.description);
          expect(localizedTask?.hints.length, `${lesson.id}/${task.id} hints`).toBeGreaterThan(0);
          expect(localizedTask?.hints.every(Boolean), `${lesson.id}/${task.id} hint text`).toBe(true);
          expect(localizedTask?.hints).not.toEqual(task.hints);
          const translatedSolution = catalog[lesson.id]?.tasks?.[task.id]?.solution;
          expect(localizedTask?.solution).toBe(localizeFixtureText(translatedSolution ?? task.solution, 'en'));
          expect(localizedTask?.check).toEqual(localizeTaskCheck(task.check, 'en'));
        }
        expect(localized.tasks.map((task) => task.id)).toEqual(lesson.tasks.map((task) => task.id));
        if (lessons === ALL_LESSONS) {
          expect(EN_LESSON_EXAMPLES[lesson.id], `${lesson.id} examples`).toHaveLength(lesson.examples.length);
          expect(localized.examples).toHaveLength(lesson.examples.length);
          expect(localized.examples?.every(Boolean), `${lesson.id} example text`).toBe(true);
        } else {
          expect(translated.examples, `${lesson.id} examples`).toHaveLength(lesson.examples.length);
          expect(localized.examples).toEqual((translated.examples ?? []).map((example) => localizeFixtureText(example, 'en')));
        }
      }
    }
  });

  it('matches every cheat sheet category and item by source ID', () => {
    expect(keys(EN_CHEAT_SHEET.map((category) => category.titleTr))).toEqual(
      keys(CHEAT_SHEET_DATA.map((category) => category.title)),
    );
    for (const category of CHEAT_SHEET_DATA) {
      const translated = EN_CHEAT_SHEET.find((item) => item.titleTr === category.title);
      expect(translated?.title, category.title).toBeTruthy();
      expect(keys(Object.keys(translated?.items ?? {})), `${category.title} items`).toEqual(
        keys(category.items.map((item) => item.command)),
      );
    }
    const localized = localizeCheatSheet(CHEAT_SHEET_DATA, 'en');
    for (let index = 0; index < CHEAT_SHEET_DATA.length; index++) {
      const translatedCategory = EN_CHEAT_SHEET.find((category) => category.titleTr === CHEAT_SHEET_DATA[index].title);
      expect(localized[index].title).not.toBe(CHEAT_SHEET_DATA[index].title);
      expect(localized[index].items.map((item) => item.command)).toEqual(CHEAT_SHEET_DATA[index].items.map((item) => item.command));
      expect(localized[index].items.every((item, itemIndex) => item.description !== CHEAT_SHEET_DATA[index].items[itemIndex].description)).toBe(true);
      expect(localized[index].items.map((item) => item.example)).toEqual(
        CHEAT_SHEET_DATA[index].items.map((item) =>
          translatedCategory?.items[item.command]?.example ?? localizeFixtureText(item.example, 'en'),
        ),
      );
    }
  });

  it('matches every Explore tool and Git intro field/topic/area ID', () => {
    expect(keys(Object.keys(EN_EXPLORE_TOOLS))).toEqual(keys(EXPLORE_TOOLS.map((tool) => tool.id)));
    for (const tool of EXPLORE_TOOLS) {
      const translated = EN_EXPLORE_TOOLS[tool.id];
      expect(translated?.description, `${tool.id} description`).toBeTruthy();
      if (tool.warning) expect(translated?.warning, `${tool.id} warning`).toBeTruthy();
      if (tool.summary) expect(translated?.summary, `${tool.id} summary`).toBeTruthy();
      if (tool.tips?.length) expect(translated?.tips, `${tool.id} tips`).toHaveLength(tool.tips.length);
      if (tool.install.note) expect(translated?.installNote, `${tool.id} install note`).toBeTruthy();
      expect(localizeExplore([tool], 'en')[0].description).not.toBe(tool.description);
      expect(localizeExplore([tool], 'en')[0].exampleCommand).toBe(localizeFixtureText(tool.exampleCommand, 'en'));
      expect(localizeExplore([tool], 'en')[0].exampleOutput).toBe(localizeFixtureText(tool.exampleOutput, 'en'));
    }
    expect(keys(Object.keys(EN_GIT_INTRO.curriculum.topics))).toEqual(
      keys(GIT_INTRO_DATA.curriculum.topics.map((topic) => topic.id)),
    );
    expect(keys(Object.keys(EN_GIT_INTRO.threeAreas.areas))).toEqual(
      keys(GIT_INTRO_DATA.threeAreas.areas.map((area) => area.id)),
    );
    const localizedIntro = localizeGitIntro(GIT_INTRO_DATA, 'en');
    expect(localizedIntro.whatIsGit.exampleFilename).not.toBe(GIT_INTRO_DATA.whatIsGit.exampleFilename);
    expect(localizedIntro.curriculum.topics.every((topic, index) => topic.title !== GIT_INTRO_DATA.curriculum.topics[index].title && topic.status === 'Ready')).toBe(true);
  });

  it('has English strings for every UI dictionary key and theme name', () => {
    expect(keys(collectStringPaths(en))).toEqual(keys(collectStringPaths(tr)));
    for (const path of collectStringPaths(tr)) {
      const value = path.split('.').reduce<any>((obj, key) => obj?.[key], en);
      expect(typeof value, path).toBe('string');
      expect(value.trim(), path).not.toBe('');
    }
    for (const theme of THEME_LIST) {
      expect(en.theme.names[theme.id], `theme ${theme.id}`).toBeTruthy();
    }
  });

  it('matches each shell command with an English summary, usage, and manual', () => {
    expect(keys(Object.keys(EN_COMMAND_DOCS))).toEqual(keys(ALL_COMMANDS.map((command) => command.name)));
    for (const command of ALL_COMMANDS) {
      const doc = EN_COMMAND_DOCS[command.name];
      expect(doc.summary, `${command.name} summary`).toBeTruthy();
      expect(doc.usage, `${command.name} usage`).toBeTruthy();
      expect(doc.manPage, `${command.name} man page`).toBeTruthy();
    }
  });
});
