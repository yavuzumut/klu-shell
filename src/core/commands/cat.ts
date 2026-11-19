import { fsErrorMessage } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';
import { tryParseArgs } from './_utils';

export const cat: CommandDefinition = {
  name: 'cat',
  summary: 'Dosya içeriğini ekrana yazdırır (birleştirir).',
  usage: 'cat [-n] [DOSYA]...',
  completion: 'files',
  manPage: `AD
    cat - dosyaları birleştirir ve ekrana yazdırır (concatenate)

KULLANIM
    cat [SEÇENEK]... [DOSYA]...

AÇIKLAMA
    DOSYA'ların içeriğini sırayla standart çıktıya yazar. Birden fazla
    dosya verilirse içerikler arka arkaya eklenir.

SEÇENEKLER
    -n, --number   satır numaralarını göster

ÖRNEKLER
    cat merhaba.txt
    cat -n Belgeler/alisveris.txt
    cat a.txt b.txt          iki dosyayı arka arkaya yazdır`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'n', { number: 'n' });
    if (!parsed) return 1;
    const { flags, operands } = parsed;

    const chunks: string[] = [];
    let exitCode = 0;
    if (!operands.length) {
      chunks.push(ctx.stdin ?? '');
    }
    for (const target of operands) {
      if (target === '-') {
        chunks.push(ctx.stdin ?? '');
        continue;
      }
      try {
        chunks.push(ctx.fs.readFile(ctx.resolve(target)));
      } catch (err) {
        ctx.stderr(`cat: ${target}: ${fsErrorMessage(err)}\n`);
        exitCode = 1;
      }
    }

    let text = chunks.join('');
    if (flags.has('n') && text) {
      const endsWithNewline = text.endsWith('\n');
      const lines = (endsWithNewline ? text.slice(0, -1) : text).split('\n');
      text = lines.map((l, i) => `${String(i + 1).padStart(6)}\t${l}`).join('\n') + (endsWithNewline ? '\n' : '');
    }
    ctx.stdout(text);
    return exitCode;
  },
};
