import type { CommandDefinition } from '../shell/types';
import { readInputs, tryParseArgs } from './_utils';

interface Counts {
  lines: number;
  words: number;
  chars: number;
  bytes: number;
}

function count(text: string): Counts {
  return {
    lines: (text.match(/\n/g) ?? []).length,
    words: text.split(/\s+/).filter(Boolean).length,
    chars: [...text].length,
    bytes: new TextEncoder().encode(text).length,
  };
}

export const wc: CommandDefinition = {
  name: 'wc',
  summary: 'Satır, kelime ve bayt sayısını gösterir.',
  usage: 'wc [-lwcm] [DOSYA]...',
  completion: 'files',
  manPage: `AD
    wc - satır, kelime ve bayt sayar (word count)

KULLANIM
    wc [SEÇENEK]... [DOSYA]...

AÇIKLAMA
    Her DOSYA için satır, kelime ve bayt sayısını (bu sırayla) yazar.
    Birden fazla dosya verilirse en sona "total" (toplam) satırı eklenir.
    DOSYA verilmezse standart girdiyi (pipe) sayar.

SEÇENEKLER
    -l, --lines   yalnızca satır sayısı (aslında satır sonu karakterleri)
    -w, --words   yalnızca kelime sayısı
    -c, --bytes   yalnızca bayt sayısı (Türkçe harfler 2 bayttır)
    -m, --chars   yalnızca karakter sayısı

ÖRNEKLER
    wc merhaba.txt
    wc -l Belgeler/alisveris.txt
    ls | wc -l           dizinde kaç girdi var?`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'lwcm', { lines: 'l', words: 'w', bytes: 'c', chars: 'm' });
    if (!parsed) return 1;
    const { flags, operands } = parsed;
    const any = flags.size > 0;
    const columns: (keyof Counts)[] = [];
    if (!any || flags.has('l')) columns.push('lines');
    if (!any || flags.has('w')) columns.push('words');
    if (flags.has('m')) columns.push('chars');
    if (!any || flags.has('c')) columns.push('bytes');

    const { inputs, failed } = readInputs(ctx, operands);
    const rows = inputs.map((input) => ({ name: input.isStdin && !operands.length ? '' : input.name === '(standard input)' ? '-' : input.name, counts: count(input.text) }));
    if (rows.length > 1) {
      const total: Counts = { lines: 0, words: 0, chars: 0, bytes: 0 };
      for (const r of rows) for (const k of Object.keys(total) as (keyof Counts)[]) total[k] += r.counts[k];
      rows.push({ name: 'total', counts: total });
    }

    // GNU wc: a single column is not padded; otherwise columns share the width
    // of the largest byte count (7 when reading only from stdin).
    let width = 1;
    if (columns.length > 1 || rows.length > 1) {
      const onlyStdin = inputs.every((i) => i.isStdin);
      width = onlyStdin ? 7 : String(Math.max(...rows.map((r) => r.counts.bytes), 0)).length;
    }
    let out = '';
    for (const r of rows) {
      const nums = columns.map((c) => String(r.counts[c]).padStart(width)).join(' ');
      out += r.name ? `${nums} ${r.name}\n` : `${nums}\n`;
    }
    ctx.stdout(out);
    return failed ? 1 : 0;
  },
};
