import type { CommandDefinition } from '../shell/types';

/** ANSI sequence: clear screen + scrollback, move cursor home. */
export const CLEAR_SEQUENCE = '\x1b[2J\x1b[3J\x1b[H';

export const clear: CommandDefinition = {
  name: 'clear',
  summary: 'Terminal ekranını temizler.',
  usage: 'clear',
  completion: 'none',
  manPage: `AD
    clear - terminal ekranını temizler

KULLANIM
    clear

AÇIKLAMA
    Ekrandaki tüm yazıları siler ve imleci en üste taşır. Dosyalarına
    veya komut geçmişine dokunmaz.

İPUCU
    Ctrl+L kısayolu da aynı işi yapar.`,
  run(_args, ctx) {
    if (ctx.isTTY) ctx.stdout(CLEAR_SEQUENCE);
    return 0;
  },
};
