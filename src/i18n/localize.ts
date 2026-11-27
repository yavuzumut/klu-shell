import type { Lang, LessonTranslation, LevelTranslation, CommandDocTranslation } from './types';
import type { Lesson, Level } from '../lessons/types';
import type { CheatCategory } from '../cheatsheet/data';
import type { ExploreTool } from '../explore/data';
import type { GitIntroData } from '../git/intro';
import type { CommandDefinition } from '../core/shell/types';

import { EN_LESSONS, EN_LEVELS } from './content/en/lessons';
import { EN_GIT_LESSONS, EN_GIT_LEVELS } from './content/en/gitLessons';
import { EN_CHEAT_SHEET } from './content/en/cheatsheet';
import { EN_EXPLORE_TOOLS } from './content/en/explore';
import { EN_GIT_INTRO } from './content/en/gitIntro';
import { EN_COMMAND_DOCS } from './content/en/commandDocs';

export function localizeLesson(lesson: Lesson, lang: Lang, isGit = false): Lesson {
  if (lang === 'tr') return lesson;

  const overlayMap = isGit ? EN_GIT_LESSONS : EN_LESSONS;
  const overlay: LessonTranslation | undefined = overlayMap[lesson.id];

  const localizedTasks = lesson.tasks.map((task) => {
    const taskOverlay = overlay?.tasks?.[task.id];
    if (!taskOverlay) {
      const solution = task.solution.trim();
      return {
        ...task,
        description: solution
          ? `Run \`${solution}\` to complete this task.`
          : 'Complete the task using the commands covered in this lesson.',
        hints: solution ? [`Try running \`${solution}\`.`] : ['Review the lesson examples and try the relevant command.'],
      };
    }
    return {
      ...task,
      description: taskOverlay.description ?? task.description,
      hints: taskOverlay.hints ?? task.hints,
    };
  });

  return {
    ...lesson,
    title: overlay?.title ?? lesson.title,
    summary: overlay?.summary ?? lesson.summary,
    content: overlay?.content ?? lesson.content,
    tasks: localizedTasks,
  };
}

export function localizeLevel(level: Level, lang: Lang, isGit = false): Level {
  if (lang === 'tr') return level;

  const levelOverlayMap = isGit ? EN_GIT_LEVELS : EN_LEVELS;
  const overlay: LevelTranslation | undefined = levelOverlayMap[level.id];

  return {
    ...level,
    title: overlay?.title ?? level.title,
    description: overlay?.description ?? level.description,
    lessons: level.lessons.map((lesson) => localizeLesson(lesson, lang, isGit)),
  };
}

export function localizeLevels(levels: Level[], lang: Lang, isGit = false): Level[] {
  if (lang === 'tr') return levels;
  return levels.map((lvl) => localizeLevel(lvl, lang, isGit));
}

export function localizeCheatSheet(categories: CheatCategory[], lang: Lang): CheatCategory[] {
  if (lang === 'tr') return categories;

  return categories.map((cat) => {
    const catOverlay = EN_CHEAT_SHEET.find((c) => c.titleTr === cat.title);
    if (!catOverlay) return cat;

    return {
      title: catOverlay.title ?? cat.title,
      items: cat.items.map((item) => {
        const itemOverlay = catOverlay.items?.[item.command];
        return {
          ...item,
          description: itemOverlay?.description ?? item.description,
        };
      }),
    };
  });
}

export function localizeExplore(tools: ExploreTool[], lang: Lang): ExploreTool[] {
  if (lang === 'tr') return tools;

  return tools.map((tool) => {
    const overlay = EN_EXPLORE_TOOLS[tool.id];
    if (!overlay) return tool;

    return {
      ...tool,
      description: overlay.description ?? tool.description,
      warning: overlay.warning ?? tool.warning,
      tips: overlay.tips ?? tool.tips,
      summary: overlay.summary ?? tool.summary,
      install: {
        ...tool.install,
        note: overlay.installNote ?? tool.install.note,
      },
    };
  });
}

export function localizeGitIntro(data: GitIntroData, lang: Lang): GitIntroData {
  if (lang === 'tr') return data;
  const overlay = EN_GIT_INTRO;

  return {
    header: {
      badge: overlay.header?.badge ?? data.header.badge,
      title: overlay.header?.title ?? data.header.title,
      subtitle: overlay.header?.subtitle ?? data.header.subtitle,
    },
    whatIsGit: {
      title: overlay.whatIsGit?.title ?? data.whatIsGit.title,
      summary: overlay.whatIsGit?.summary ?? data.whatIsGit.summary,
      exampleFilename: overlay.whatIsGit?.exampleFilename ?? data.whatIsGit.exampleFilename,
      description: overlay.whatIsGit?.description ?? data.whatIsGit.description,
    },
    origin: {
      title: overlay.origin?.title ?? data.origin.title,
      year: overlay.origin?.year ?? data.origin.year,
      creator: overlay.origin?.creator ?? data.origin.creator,
      body: overlay.origin?.body ?? data.origin.body,
    },
    gitVsGithub: {
      title: overlay.gitVsGithub?.title ?? data.gitVsGithub.title,
      git: {
        name: overlay.gitVsGithub?.git?.name ?? data.gitVsGithub.git.name,
        desc: overlay.gitVsGithub?.git?.desc ?? data.gitVsGithub.git.desc,
      },
      github: {
        name: overlay.gitVsGithub?.github?.name ?? data.gitVsGithub.github.name,
        desc: overlay.gitVsGithub?.github?.desc ?? data.gitVsGithub.github.desc,
      },
    },
    threeAreas: {
      title: overlay.threeAreas?.title ?? data.threeAreas.title,
      subtitle: overlay.threeAreas?.subtitle ?? data.threeAreas.subtitle,
      areas: data.threeAreas.areas.map((area) => {
        const areaOverlays = overlay.threeAreas?.areas as Record<string, { name?: string; badge?: string; desc?: string }> | undefined;
        const aOverlay = areaOverlays?.[area.id];
        return {
          ...area,
          name: aOverlay?.name ?? area.name,
          badge: aOverlay?.badge ?? area.badge,
          desc: aOverlay?.desc ?? area.desc,
        };
      }),
    },
    prerequisites: {
      title: overlay.prerequisites?.title ?? data.prerequisites.title,
      body: overlay.prerequisites?.body ?? data.prerequisites.body,
      tip: overlay.prerequisites?.tip ?? data.prerequisites.tip,
    },
    curriculum: {
      title: overlay.curriculum?.title ?? data.curriculum.title,
      subtitle: overlay.curriculum?.subtitle ?? data.curriculum.subtitle,
      topics: data.curriculum.topics.map((t) => {
        const topicOverlays = overlay.curriculum?.topics as Record<string, {
          level?: string;
          title?: string;
          description?: string;
          status?: GitIntroData['curriculum']['topics'][number]['status'];
        }> | undefined;
        const tOverlay = topicOverlays?.[t.id];
        return {
          ...t,
          level: tOverlay?.level ?? t.level,
          title: tOverlay?.title ?? t.title,
          description: tOverlay?.description ?? t.description,
          status: tOverlay?.status ?? t.status,
        };
      }),
    },
  };
}

export function getCommandDoc(cmd: CommandDefinition, lang: Lang): { summary: string; usage: string; manPage?: string } {
  if (lang === 'tr') {
    return { summary: cmd.summary, usage: cmd.usage, manPage: cmd.manPage };
  }
  const overlay: CommandDocTranslation | undefined = EN_COMMAND_DOCS[cmd.name];
  return {
    summary: overlay?.summary ?? cmd.summary,
    usage: overlay?.usage ?? cmd.usage,
    manPage: overlay?.manPage ?? cmd.manPage,
  };
}
