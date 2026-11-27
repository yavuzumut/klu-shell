import { basename, FsError, isSubPath, joinPath } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';
import { tryParseArgs, usageError } from './_utils';

export const mv: CommandDefinition = {
  name: 'mv',
  summary: 'Dosya ve dizinleri taşır veya yeniden adlandırır.',
  usage: 'mv [-v] KAYNAK... HEDEF',
  completion: 'files',
  manPage: `AD
    mv - dosyaları taşır veya yeniden adlandırır (move)

KULLANIM
    mv [SEÇENEK]... KAYNAK HEDEF
    mv [SEÇENEK]... KAYNAK... DİZİN

AÇIKLAMA
    KAYNAK'ı HEDEF olarak yeniden adlandırır ya da KAYNAK'ları DİZİN'in
    içine taşır. cp'den farklı olarak orijinal dosya yerinde kalmaz.
    Dizinleri taşımak için -r gerekmez.

SEÇENEKLER
    -v, --verbose   yapılan her işlemi göster

ÖRNEKLER
    mv taslak.txt son.txt        dosyayı yeniden adlandır
    mv son.txt Belgeler/         dosyayı Belgeler dizinine taşı
    mv a.txt b.txt arsiv/        iki dosyayı birden taşı`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'vfi', { verbose: 'v', force: 'f' });
    if (!parsed) return 1;
    const { flags, operands } = parsed;

    if (!operands.length) return usageError(ctx, 'missing file operand');
    if (operands.length === 1) return usageError(ctx, `missing destination file operand after '${operands[0]}'`);

    const dest = operands[operands.length - 1];
    const sources = operands.slice(0, -1);
    const destAbs = ctx.resolve(dest);
    const destIsDir = ctx.fs.isDir(destAbs);

    if (sources.length > 1 && !destIsDir) {
      ctx.stderr(`mv: target '${ctx.shell.displayPath(dest)}' is not a directory\n`);
      return 1;
    }

    let exitCode = 0;
    const fail = (msg: string) => {
      ctx.stderr(`mv: ${msg}\n`);
      exitCode = 1;
    };

    for (const src of sources) {
      const srcAbs = ctx.resolve(src);
      const node = ctx.fs.tryLookup(srcAbs);
      if (!node) {
        fail(`cannot stat '${src}': No such file or directory`);
        continue;
      }
      const target = destIsDir ? joinPath(destAbs, basename(srcAbs)) : destAbs;
      const targetLabel = ctx.shell.displayPath(destIsDir ? joinPath(dest, basename(srcAbs)) : dest);
      const sourceLabel = ctx.shell.displayPath(src);
      if (target === srcAbs) {
        fail(`'${sourceLabel}' and '${targetLabel}' are the same file`);
        continue;
      }
      if (node.type === 'dir' && isSubPath(target, srcAbs)) {
        fail(`cannot move '${sourceLabel}' to a subdirectory of itself, '${targetLabel}'`);
        continue;
      }
      const existing = ctx.fs.tryLookup(target);
      if (existing?.type === 'dir' && node.type === 'file') {
        fail(`cannot overwrite directory '${targetLabel}' with non-directory`);
        continue;
      }
      if (existing?.type === 'file' && node.type === 'dir') {
        fail(`cannot overwrite non-directory '${targetLabel}' with directory '${sourceLabel}'`);
        continue;
      }
      try {
        ctx.fs.move(srcAbs, target);
        if (flags.has('v')) ctx.stdout(`renamed '${sourceLabel}' -> '${targetLabel}'\n`);
      } catch (err) {
        if (err instanceof FsError) fail(`cannot move '${sourceLabel}' to '${targetLabel}': ${err.description}`);
        else throw err;
      }
    }
    return exitCode;
  },
};
