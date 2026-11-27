import type { CommandDefinition } from '../shell/types';
import { color } from './_utils';
import { getCommandDoc } from '../../i18n/localize';

export const help: CommandDefinition = {
  name: 'help',
  summary: 'Kullanılabilir komutları listeler.',
  usage: 'help [KOMUT]',
  completion: 'commands',
  manPage: `AD
    help - kullanılabilir komutları listeler

KULLANIM
    help [KOMUT]

AÇIKLAMA
    Argümansız çalıştırıldığında tüm komutları kısa açıklamalarıyla
    listeler. KOMUT verilirse o komutun kullanımını gösterir.
    Ayrıntılı bilgi için: man KOMUT`,
  run(args, ctx) {
    const lang = ctx.shell.lang;
    const paint = (s: string, fn: (x: string) => string) => (ctx.isTTY ? fn(s) : s);
    if (args.length) {
      let exitCode = 0;
      for (const name of args) {
        const def = ctx.shell.registry.get(name);
        if (!def) {
          ctx.stderr(`bash: help: no help topics match \`${name}'.\n`);
          exitCode = 1;
          continue;
        }
        const doc = getCommandDoc(def, lang);
        ctx.stdout(`${paint(doc.usage, color.bold)}\n    ${doc.summary}\n`);
      }
      return exitCode;
    }
    const defs = ctx.shell.registry.list();
    const width = Math.max(...defs.map((d) => d.name.length));
    const title = lang === 'en' ? 'KLU Shell — available commands' : 'KLU kabuğu — kullanılabilir komutlar';
    let out = paint(title, color.bold) + '\n\n';
    for (const d of defs) {
      const doc = getCommandDoc(d, lang);
      out += `  ${paint(d.name.padEnd(width), color.green)}  ${doc.summary}\n`;
    }
    if (lang === 'en') {
      out += `\nFor details on a command: ${paint('man COMMAND', color.cyan)}  (e.g. man ls)\n`;
      out += `Shortcuts: Tab = complete, ↑/↓ = history, Ctrl+C = cancel, Ctrl+L = clear\n`;
    } else {
      out += `\nBir komut hakkında ayrıntı için: ${paint('man KOMUT', color.cyan)}  (örn. man ls)\n`;
      out += `Kısayollar: Tab = tamamla, ↑/↓ = geçmiş, Ctrl+C = iptal, Ctrl+L = temizle\n`;
    }
    ctx.stdout(out);
    return 0;
  },
};
