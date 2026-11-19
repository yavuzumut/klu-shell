import { basename, FsError, isSubPath, joinPath } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';
import { tryParseArgs, usageError } from './_utils';

export const cp: CommandDefinition = {
  name: 'cp',
  summary: 'Dosya ve dizinleri kopyalar.',
  usage: 'cp [-rv] KAYNAK... HEDEF',
  completion: 'files',
  manPage: `AD
    cp - dosya ve dizinleri kopyalar (copy)

KULLANIM
    cp [SEÇENEK]... KAYNAK HEDEF
    cp [SEÇENEK]... KAYNAK... DİZİN

AÇIKLAMA
    KAYNAK'ı HEDEF'e kopyalar. HEDEF var olan bir dizinse, kaynak o
    dizinin içine aynı adla kopyalanır. Birden fazla kaynak verilirse
    son argüman bir dizin olmalıdır. Orijinal dosya yerinde kalır.

SEÇENEKLER
    -r, -R, --recursive   dizinleri içerikleriyle birlikte kopyala
    -v, --verbose         yapılan her kopyalamayı göster

ÖRNEKLER
    cp notlar.txt notlar_yedek.txt     dosyanın kopyasını oluştur
    cp notlar.txt Belgeler/            dosyayı Belgeler'e kopyala
    cp -r Belgeler Belgeler_yedek      dizini tümüyle kopyala`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'rRvf', { recursive: 'r', verbose: 'v', force: 'f' });
    if (!parsed) return 1;
    const { flags, operands } = parsed;
    const recursive = flags.has('r') || flags.has('R');

    if (!operands.length) return usageError(ctx, 'missing file operand');
    if (operands.length === 1) return usageError(ctx, `missing destination file operand after '${operands[0]}'`);

    const dest = operands[operands.length - 1];
    const sources = operands.slice(0, -1);
    const destAbs = ctx.resolve(dest);
    const destIsDir = ctx.fs.isDir(destAbs);

    if (sources.length > 1 && !destIsDir) {
      ctx.stderr(`cp: target '${dest}' is not a directory\n`);
      return 1;
    }

    let exitCode = 0;
    const fail = (msg: string) => {
      ctx.stderr(`cp: ${msg}\n`);
      exitCode = 1;
    };

    for (const src of sources) {
      const srcAbs = ctx.resolve(src);
      const node = ctx.fs.tryLookup(srcAbs);
      if (!node) {
        fail(`cannot stat '${src}': No such file or directory`);
        continue;
      }
      if (node.type === 'dir' && !recursive) {
        fail(`-r not specified; omitting directory '${src}'`);
        continue;
      }
      const target = destIsDir ? joinPath(destAbs, basename(srcAbs)) : destAbs;
      const targetLabel = destIsDir ? joinPath(dest, basename(srcAbs)) : dest;
      if (target === srcAbs) {
        fail(`'${src}' and '${targetLabel}' are the same file`);
        continue;
      }
      if (node.type === 'dir' && isSubPath(target, srcAbs)) {
        fail(`cannot copy a directory, '${src}', into itself, '${targetLabel}'`);
        continue;
      }
      const existing = ctx.fs.tryLookup(target);
      if (existing?.type === 'dir' && node.type === 'file') {
        fail(`cannot overwrite directory '${targetLabel}' with non-directory`);
        continue;
      }
      if (existing?.type === 'file' && node.type === 'dir') {
        fail(`cannot overwrite non-directory '${targetLabel}' with directory '${src}'`);
        continue;
      }
      try {
        ctx.fs.copy(srcAbs, target, { recursive: true });
        if (flags.has('v')) ctx.stdout(`'${src}' -> '${targetLabel}'\n`);
      } catch (err) {
        if (err instanceof FsError) {
          const kind = node.type === 'dir' ? 'directory' : 'regular file';
          fail(`cannot create ${kind} '${targetLabel}': ${err.description}`);
        } else throw err;
      }
    }
    return exitCode;
  },
};
