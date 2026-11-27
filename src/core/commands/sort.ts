import type { CommandDefinition } from '../shell/types';
import { joinLines, readInputs, splitLines, tryParseArgs } from './_utils';

/** Leading number of a line for `sort -n` (non-numeric lines count as 0). */
function numericKey(line: string): number {
  const m = line.match(/^\s*(-?\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

export const sort: CommandDefinition = {
  name: 'sort',
  summary: 'Satırları alfabetik veya sayısal olarak sıralar.',
  usage: 'sort [-rnuf] [DOSYA]...',
  completion: 'files',
  manPage: `AD
    sort - metin satırlarını sıralar

KULLANIM
    sort [SEÇENEK]... [DOSYA]...

AÇIKLAMA
    DOSYA'ların (veya standart girdinin) satırlarını sıralayıp yazar.
    Dosyanın kendisi değişmez; sonucu kaydetmek için yönlendirme kullan:
    sort liste.txt > sirali.txt

SEÇENEKLER
    -r, --reverse            ters sırala (Z'den A'ya, büyükten küçüğe)
    -n, --numeric-sort       sayısal sırala (2, 10'dan önce gelir)
    -u, --unique             aynı satırlardan yalnızca birini yaz
    -f, --ignore-case        büyük/küçük harf ayrımı yapma

ÖRNEKLER
    sort Belgeler/alisveris.txt
    sort -n puanlar.txt
    sort -rn puanlar.txt | head -n 3     en yüksek üç puan`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'rnuf', {
      reverse: 'r',
      'numeric-sort': 'n',
      unique: 'u',
      'ignore-case': 'f',
    });
    if (!parsed) return 2;
    const { flags, operands } = parsed;
    const { inputs, failed } = readInputs(ctx, operands);
    if (failed) return 2;

    const lines = inputs.flatMap((i) => splitLines(ctx.shell.displayText(i.text)));
    const locale = ctx.shell.lang === 'en' ? 'en' : 'tr';
    const textKey = (s: string) => (flags.has('f') ? s.toLocaleLowerCase(locale) : s);
    const compare = (a: string, b: string): number => {
      if (flags.has('n')) {
        const diff = numericKey(a) - numericKey(b);
        if (diff !== 0) return diff;
      }
      return textKey(a).localeCompare(textKey(b), ctx.shell.lang === 'en' ? 'en' : 'tr');
    };
    lines.sort(compare);
    if (flags.has('r')) lines.reverse();

    let result = lines;
    if (flags.has('u')) {
      result = lines.filter((l, i) => i === 0 || compare(lines[i - 1], l) !== 0);
    }
    ctx.stdout(joinLines(result));
    return 0;
  },
};
