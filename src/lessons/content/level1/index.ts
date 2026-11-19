import type { Level } from '../../types';
import { welcome } from './01-welcome';
import { listing } from './02-listing';
import { navigation } from './03-navigation';
import { creating } from './04-creating';
import { reading } from './05-reading';
import { copyMove } from './06-copy-move';
import { removing } from './07-removing';

export const level1: Level = {
  id: 'level-1',
  number: 1,
  title: 'Başlangıç',
  description: 'Terminalde gezinme, dosya ve dizin işlemleri.',
  lessons: [welcome, listing, navigation, creating, reading, copyMove, removing],
};
