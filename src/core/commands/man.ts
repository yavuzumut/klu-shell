import type { CommandDefinition } from '../shell/types';
import { color } from './_utils';

export const man: CommandDefinition = {
  name: 'man',
  summary: 'Bir komutun kılavuz sayfasını gösterir.',
  usage: 'man KOMUT',
  completion: 'commands',
  manPage: `AD
    man - komut kılavuzlarını gösterir (manual)

KULLANIM
    man KOMUT

AÇIKLAMA
    KOMUT'un kılavuz (manual) sayfasını gösterir: ne işe yaradığı,
    seçenekleri ve örnekleri. Bir komutu nasıl kullanacağını
    unuttuğunda ilk bakacağın yer burasıdır.

ÖRNEKLER
    man ls
    man man`,
  run(args, ctx) {
    if (!args.length) {
      ctx.stderr("What manual page do you want?\nFor example, try 'man man'.\n");
      return 1;
    }
    let exitCode = 0;
    args.forEach((name, i) => {
      const def = ctx.shell.registry.get(name);
      if (!def) {
        ctx.stderr(`No manual entry for ${name}\n`);
        exitCode = 16;
        return;
      }
      const title = `${name.toUpperCase()}(1)`;
      const header = `${title}${'KLU Kılavuzu'.padStart(30)}${title.padStart(20)}`;
      let body = def.manPage;
      if (ctx.isTTY) {
        // Bold section headings (lines in ALL CAPS)
        body = body.replace(/^([A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ ()]+)$/gm, (m) => color.bold(m));
      }
      ctx.stdout((i ? '\n' : '') + (ctx.isTTY ? color.dim(header) : header) + '\n\n' + body + '\n');
    });
    return exitCode;
  },
};
