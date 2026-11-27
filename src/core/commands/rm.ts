import type { CommandDefinition } from '../shell/types';
import { tryParseArgs, usageError } from './_utils';

export const rm: CommandDefinition = {
  name: 'rm',
  summary: 'Dosya ve dizinleri siler.',
  usage: 'rm [-rfdv] DOSYA...',
  completion: 'files',
  manPage: `AD
    rm - dosya veya dizinleri siler (remove)

KULLANIM
    rm [SEÇENEK]... DOSYA...

AÇIKLAMA
    Verilen dosyaları siler. Varsayılan olarak dizinleri silmez.
    DİKKAT: Terminalde çöp kutusu yoktur; silinen dosya geri gelmez!

SEÇENEKLER
    -r, -R, --recursive   dizinleri ve tüm içeriklerini sil
    -f, --force           olmayan dosyalar için hata verme, soru sorma
    -d, --dir             boş dizinleri sil
    -v, --verbose         silinen her öğeyi göster

ÖRNEKLER
    rm eski.txt
    rm a.txt b.txt
    rm -r eski_proje      dizini içindekilerle birlikte sil`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'rRfdvi', {
      recursive: 'r',
      force: 'f',
      dir: 'd',
      verbose: 'v',
    });
    if (!parsed) return 1;
    const { flags, operands } = parsed;
    const recursive = flags.has('r') || flags.has('R');
    const force = flags.has('f');

    if (!operands.length) return force ? 0 : usageError(ctx, 'missing operand');

    let exitCode = 0;
    const fail = (msg: string) => {
      ctx.stderr(`rm: ${msg}\n`);
      exitCode = 1;
    };

    for (const target of operands) {
      const last = target.replace(/\/+$/, '').split('/').pop();
      if (last === '.' || last === '..') {
        fail(`refusing to remove '.' or '..' directory: skipping '${ctx.shell.displayPath(target)}'`);
        continue;
      }
      const abs = ctx.resolve(target);
      if (abs === '/') {
        if (recursive) {
          fail(`it is dangerous to operate recursively on '/'`);
          ctx.stderr(`rm: use --no-preserve-root to override this failsafe\n`);
        } else fail(`cannot remove '/': Is a directory`);
        continue;
      }
      const node = ctx.fs.tryLookup(abs);
      if (!node) {
        if (!force) fail(`cannot remove '${ctx.shell.displayPath(target)}': No such file or directory`);
        continue;
      }
      if (node.type === 'dir' && !recursive) {
        if (flags.has('d')) {
          if (Object.keys(node.children).length) {
            fail(`cannot remove '${ctx.shell.displayPath(target)}': Directory not empty`);
            continue;
          }
        } else {
          fail(`cannot remove '${ctx.shell.displayPath(target)}': Is a directory`);
          continue;
        }
      }
      ctx.fs.remove(abs, { recursive: true });
      if (flags.has('v')) {
        const shownTarget = ctx.shell.displayPath(target);
        ctx.stdout(node.type === 'dir' ? `removed directory '${shownTarget}'\n` : `removed '${shownTarget}'\n`);
      }
    }
    return exitCode;
  },
};
