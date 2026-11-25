import type { CommandDefinition } from '../shell/types';
import { joinLines, readInputs, splitLines, tryParseArgs } from './_utils';

export const uniq: CommandDefinition = {
  name: 'uniq',
  summary: 'Art arda tekrar eden satırları teke indirir.',
  usage: 'uniq [-cdu] [DOSYA]',
  completion: 'files',
  manPage: `AD
    uniq - art arda tekrarlanan satırları ayıklar

KULLANIM
    uniq [SEÇENEK]... [DOSYA]

AÇIKLAMA
    Yan yana duran aynı satırlardan yalnızca birini yazar. Yalnızca
    ARDIŞIK tekrarları görür; bu yüzden genellikle önce sort ile
    sıralanır:  sort liste.txt | uniq

SEÇENEKLER
    -c, --count      her satırın başına kaç kez tekrarlandığını yaz
    -d, --repeated   yalnızca tekrar eden satırları yaz
    -u, --unique     yalnızca hiç tekrar etmeyen satırları yaz

ÖRNEKLER
    sort renkler.txt | uniq
    sort renkler.txt | uniq -c
    sort renkler.txt | uniq -c | sort -rn     en sık geçenler üstte`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'cdu', { count: 'c', repeated: 'd', unique: 'u' });
    if (!parsed) return 1;
    const { flags, operands } = parsed;
    if (operands.length > 1) {
      // Real uniq treats a second operand as an output file; keep it simple.
      ctx.stderr(`uniq: extra operand '${operands[1]}'\nTry 'uniq --help' for more information.\n`);
      return 1;
    }
    const { inputs, failed } = readInputs(ctx, operands);
    if (failed) return 1;

    const groups: { line: string; count: number }[] = [];
    for (const line of splitLines(inputs[0]?.text ?? '')) {
      const last = groups[groups.length - 1];
      if (last && last.line === line) last.count++;
      else groups.push({ line, count: 1 });
    }
    const out = groups
      .filter((g) => (!flags.has('d') || g.count > 1) && (!flags.has('u') || g.count === 1))
      .map((g) => (flags.has('c') ? `${String(g.count).padStart(7)} ${g.line}` : g.line));
    ctx.stdout(joinLines(out));
    return 0;
  },
};
