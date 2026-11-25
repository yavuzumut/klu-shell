import type { Level } from '../../types';
import { systemInfo } from './01-system-info';
import { environment } from './02-environment';
import { whichPath } from './03-which-path';
import { chmodNumeric } from './04-chmod-numeric';
import { chmodSymbolic } from './05-chmod-symbolic';
import { processesPs } from './06-processes-ps';
import { killProcess } from './07-kill-process';

export const level3: Level = {
  id: 'level-3',
  number: 3,
  title: 'İleri',
  description: 'Sistem bilgisi, ortam değişkenleri ($VAR, env, export), dosya izinleri (chmod), betik çalıştırma ve süreç yönetimi (ps, kill).',
  lessons: [
    systemInfo,
    environment,
    whichPath,
    chmodNumeric,
    chmodSymbolic,
    processesPs,
    killProcess,
  ],
};
