import type { CommandContext, CommandDefinition } from '../shell/types';
import { extractNumericOption, joinLines, readInputs, splitLines, tryParseArgs, usageError, UsageError } from './_utils';

/** Shared implementation of head/tail: pick lines from each input and print with GNU style headers. */
export function runHeadTail(
  args: string[],
  ctx: CommandContext,
  pick: (lines: string[], count: number, fromStart: boolean) => string[],
  allowPlus: boolean,
): number {
  let extracted;
  try {
    extracted = extractNumericOption(args, 'n', 'lines');
  } catch (err) {
    if (err instanceof UsageError) return usageError(ctx, err.message);
    throw err;
  }
  const parsed = tryParseArgs(ctx, extracted.rest, 'qv', { quiet: 'q', silent: 'q', verbose: 'v' });
  if (!parsed) return 1;

  let count = 10;
  let fromStart = false;
  if (extracted.value !== null) {
    const valid = allowPlus ? /^\+?\d+$/ : /^\d+$/;
    if (!valid.test(extracted.value)) {
      ctx.stderr(`${ctx.name}: invalid number of lines: '${extracted.value}'\n`);
      return 1;
    }
    fromStart = extracted.value.startsWith('+');
    count = parseInt(extracted.value.replace('+', ''), 10);
  }

  const { inputs, failed } = readInputs(ctx, parsed.operands);
  const showHeaders = parsed.flags.has('v') || (!parsed.flags.has('q') && inputs.length + (failed ? 1 : 0) > 1);
  let out = '';
  inputs.forEach((input, i) => {
    if (showHeaders) out += `${i ? '\n' : ''}==> ${input.name} <==\n`;
    out += joinLines(pick(splitLines(input.text), count, fromStart));
  });
  ctx.stdout(out);
  return failed ? 1 : 0;
}

export const head: CommandDefinition = {
  name: 'head',
  summary: 'Dosyanın ilk satırlarını gösterir (varsayılan 10).',
  usage: 'head [-n SAYI] [DOSYA]...',
  completion: 'files',
  manPage: `AD
    head - dosyaların başını gösterir

KULLANIM
    head [SEÇENEK]... [DOSYA]...

AÇIKLAMA
    Her DOSYA'nın ilk 10 satırını yazar. Birden fazla dosya verilirse
    her birinin önüne "==> DOSYA <==" başlığı eklenir. DOSYA verilmezse
    veya DOSYA "-" ise standart girdiyi (pipe) okur.

SEÇENEKLER
    -n, --lines=SAYI   ilk 10 yerine ilk SAYI satırı göster
    -SAYI              -n SAYI ile aynı (örn. head -3)
    -q, --quiet        dosya adı başlıklarını hiç yazma
    -v, --verbose      dosya adı başlığını her zaman yaz

ÖRNEKLER
    head Belgeler/alisveris.txt
    head -n 3 /etc/passwd
    ls | head -n 2       ilk iki girdiyi göster`,
  run(args, ctx) {
    return runHeadTail(args, ctx, (lines, count) => lines.slice(0, count), false);
  },
};
