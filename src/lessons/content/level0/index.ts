import type { Level } from '../../types';
import { introLesson } from './01-intro';
import { howTermiWorksLesson } from './02-how-termi-works';
import { modesAndToolsLesson } from './03-modes-and-tools';
import { habitsLesson } from './04-habits';
import { realLinuxLesson } from './05-real-linux';

export const level0: Level = {
  id: 'level-0',
  number: 0,
  title: 'Başlamadan Önce',
  description: 'Terminal, kabuk ve Linux temelleri; Termi çalışma mantığı ve ipuçları.',
  lessons: [
    introLesson,
    howTermiWorksLesson,
    modesAndToolsLesson,
    habitsLesson,
    realLinuxLesson,
  ],
};
