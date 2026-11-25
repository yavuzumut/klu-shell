import type { Level } from '../../types';
import { redirection } from './01-redirection';
import { pipes } from './02-pipes';
import { headTail } from './03-head-tail';
import { wordCount } from './04-wc';
import { grepLesson } from './05-grep';
import { sortUniq } from './06-sort-uniq';
import { findLesson } from './07-find';

export const level2: Level = {
  id: 'level-2',
  number: 2,
  title: 'Orta',
  description: 'Yönlendirme (>, >>), boru hattı (|), metin işleme (grep, head, tail, wc, sort, uniq) ve dosya arama (find).',
  lessons: [redirection, pipes, headTail, wordCount, grepLesson, sortUniq, findLesson],
};
