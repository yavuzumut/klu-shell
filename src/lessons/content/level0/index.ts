import type { Level } from '../../types';
import { introLesson } from './01-intro';
import { howKluWorksLesson } from './02-how-klu-works';
import { modesAndToolsLesson } from './03-modes-and-tools';
import { habitsLesson } from './04-habits';
import { realLinuxLesson } from './05-real-linux';

export const level0: Level = {
  id: 'level-0',
  number: 0,
  title: 'Başlamadan Önce',
  description: 'Terminal, kabuk ve Linux temelleri; KLU çalışma mantığı ve ipuçları.',
  lessons: [
    introLesson,
    howKluWorksLesson,
    modesAndToolsLesson,
    habitsLesson,
    realLinuxLesson,
  ],
};
