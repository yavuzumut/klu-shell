import { fsErrorMessage } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';
import { tryParseArgs, usageError } from './_utils';

export const touch: CommandDefinition = {
  name: 'touch',
  summary: 'Boş dosya oluşturur veya dosyanın tarihini günceller.',
  usage: 'touch DOSYA...',
  completion: 'files',
  manPage: `AD
    touch - dosya zaman damgasını değiştirir

KULLANIM
    touch [SEÇENEK]... DOSYA...

AÇIKLAMA
    Her DOSYA'nın değiştirilme zamanını şimdiki zaman yapar. DOSYA
    yoksa boş bir dosya olarak oluşturulur. Pratikte en çok boş dosya
    oluşturmak için kullanılır.

SEÇENEKLER
    -c, --no-create   dosya yoksa oluşturma

ÖRNEKLER
    touch notlar.txt
    touch a.txt b.txt c.txt`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'c', { 'no-create': 'c' });
    if (!parsed) return 1;
    const { flags, operands } = parsed;
    if (!operands.length) return usageError(ctx, 'missing file operand');

    let exitCode = 0;
    for (const target of operands) {
      const abs = ctx.resolve(target);
      if (flags.has('c') && !ctx.fs.exists(abs)) continue;
      try {
        ctx.fs.touch(abs);
      } catch (err) {
        ctx.stderr(`touch: cannot touch '${target}': ${fsErrorMessage(err)}\n`);
        exitCode = 1;
      }
    }
    return exitCode;
  },
};
