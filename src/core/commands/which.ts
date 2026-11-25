import type { CommandDefinition } from '../shell/types';

const ROOT_BIN_COMMANDS = new Set(['ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'pwd', 'echo', 'date', 'sh', 'bash']);

export const which: CommandDefinition = {
  name: 'which',
  summary: 'Bir komutun çalıştırılabilir dosya yolunu gösterir.',
  usage: 'which KOMUT...',
  completion: 'commands',
  manPage: `AD
    which - bir komutun tam dosya yolunu bulur

KULLANIM
    which KOMUT...

AÇIKLAMA
    PATH ortam değişkenindeki dizinleri tarayarak verilen KOMUT'un
    çalıştırılabilir dosyasının nerede bulunduğunu ekrana yazar.

ÖRNEKLER
    which ls
    which grep
    which bash`,
  run(args, ctx) {
    if (args.length === 0) {
      return 1;
    }

    let exitCode = 0;
    const pathVar = ctx.env.PATH || '/usr/local/bin:/usr/bin:/bin';

    for (const name of args) {
      if (ctx.shell.registry.has(name)) {
        const binDir = ROOT_BIN_COMMANDS.has(name) ? '/bin' : '/usr/bin';
        ctx.stdout(`${binDir}/${name}\n`);
      } else {
        ctx.stderr(`which: no ${name} in (${pathVar})\n`);
        exitCode = 1;
      }
    }

    return exitCode;
  },
};
