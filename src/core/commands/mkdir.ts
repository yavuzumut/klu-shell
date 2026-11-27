import { fsErrorMessage } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';
import { tryParseArgs, usageError } from './_utils';

export const mkdir: CommandDefinition = {
  name: 'mkdir',
  summary: 'Yeni dizin (klasör) oluşturur.',
  usage: 'mkdir [-pv] DİZİN...',
  completion: 'dirs',
  manPage: `AD
    mkdir - dizin oluşturur (make directory)

KULLANIM
    mkdir [SEÇENEK]... DİZİN...

AÇIKLAMA
    Verilen DİZİN'leri (zaten yoksa) oluşturur.

SEÇENEKLER
    -p, --parents   gerekirse üst dizinleri de oluştur; dizin zaten
                    varsa hata verme
    -v, --verbose   oluşturulan her dizin için mesaj yaz

ÖRNEKLER
    mkdir projeler
    mkdir a b c               üç dizini birden oluştur
    mkdir -p okul/2024/notlar iç içe dizinleri tek seferde oluştur`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'pv', { parents: 'p', verbose: 'v' });
    if (!parsed) return 1;
    const { flags, operands } = parsed;
    if (!operands.length) return usageError(ctx, 'missing operand');

    let exitCode = 0;
    for (const target of operands) {
      const abs = ctx.resolve(target);
      try {
        if (flags.has('p')) {
          const existed = ctx.fs.exists(abs);
          ctx.fs.mkdir(abs, { parents: true });
          if (flags.has('v') && !existed) ctx.stdout(`mkdir: created directory '${ctx.shell.displayPath(target)}'\n`);
        } else {
          ctx.fs.mkdir(abs);
          if (flags.has('v')) ctx.stdout(`mkdir: created directory '${ctx.shell.displayPath(target)}'\n`);
        }
      } catch (err) {
        ctx.stderr(`mkdir: cannot create directory '${ctx.shell.displayPath(target)}': ${fsErrorMessage(err)}\n`);
        exitCode = 1;
      }
    }
    return exitCode;
  },
};
