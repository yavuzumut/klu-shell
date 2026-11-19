import type { CommandDefinition } from '../shell/types';

export const pwd: CommandDefinition = {
  name: 'pwd',
  summary: 'Bulunduğun dizinin tam yolunu yazdırır.',
  usage: 'pwd',
  completion: 'none',
  manPage: `AD
    pwd - çalışma dizininin adını yazdırır (print working directory)

KULLANIM
    pwd

AÇIKLAMA
    Şu anda içinde bulunduğun dizinin kök dizinden (/) başlayan tam
    yolunu (mutlak yol) ekrana yazar.

ÖRNEK
    $ pwd
    /home/kullanici`,
  run(_args, ctx) {
    ctx.stdout(ctx.shell.cwd + '\n');
    return 0;
  },
};
