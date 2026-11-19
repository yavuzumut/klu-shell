import type { CommandDefinition } from '../shell/types';

export const history: CommandDefinition = {
  name: 'history',
  summary: 'Daha önce çalıştırılan komutları listeler.',
  usage: 'history [-c]',
  completion: 'none',
  manPage: `AD
    history - komut geçmişini gösterir

KULLANIM
    history [-c]

AÇIKLAMA
    Daha önce yazdığın komutları numaralı olarak listeler.
    Yukarı/aşağı ok tuşlarıyla da geçmişte gezinebilirsin.

SEÇENEKLER
    -c    geçmişi temizle`,
  run(args, ctx) {
    if (args[0] === '-c') {
      ctx.shell.history.length = 0;
      return 0;
    }
    const lines = ctx.shell.history.map((cmd, i) => `${String(i + 1).padStart(5)}  ${cmd}`);
    ctx.stdout(lines.length ? lines.join('\n') + '\n' : '');
    return 0;
  },
};
