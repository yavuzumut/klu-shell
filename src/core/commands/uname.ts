import type { CommandDefinition } from '../shell/types';
import { tryParseArgs } from './_utils';

export const uname: CommandDefinition = {
  name: 'uname',
  summary: 'Sistem ve çekirdek bilgilerini yazdırır.',
  usage: 'uname [-asnrvmo]',
  completion: 'none',
  manPage: `AD
    uname - sistem bilgilerini yazdırır (unix name)

KULLANIM
    uname [SEÇENEK]...

AÇIKLAMA
    İşletim sistemi, çekirdek sürümü ve donanım mimarisi bilgilerini ekrana yazar.
    Seçenek verilmezse sadece çekirdek adını (-s, yani Linux) gösterir.

SEÇENEKLER
    -a, --all               tüm bilgileri sırasıyla yazdır
    -s, --kernel-name       çekirdek adını yazdır (Linux)
    -n, --nodename          ağ düğüm adını (hostname) yazdır
    -r, --kernel-release    çekirdek yayın sürümünü yazdır
    -v, --kernel-version    çekirdek derleme sürümünü yazdır
    -m, --machine           donanım mimarisini yazdır (örn. x86_64)
    -o, --operating-system  işletim sistemini yazdır (GNU/Linux)

ÖRNEKLER
    uname
    uname -a
    uname -r`,
  run(args, ctx) {
    const longMap: Record<string, string> = {
      all: 'a',
      'kernel-name': 's',
      nodename: 'n',
      'kernel-release': 'r',
      'kernel-version': 'v',
      machine: 'm',
      'operating-system': 'o',
    };
    const parsed = tryParseArgs(ctx, args, 'asnrvmo', longMap);
    if (!parsed) return 1;

    if (parsed.operands.length > 0) {
      ctx.stderr(`uname: extra operand '${parsed.operands[0]}'\n`);
      return 1;
    }

    const { flags } = parsed;
    const all = flags.has('a');

    const kernelName = 'Linux';
    const nodename = ctx.shell.hostname || 'klu';
    const kernelRelease = '6.8.0-klu';
    const kernelVersion = '#1 SMP PREEMPT_DYNAMIC KLU 2026';
    const machine = 'x86_64';
    const os = 'GNU/Linux';

    if (all) {
      ctx.stdout(`${kernelName} ${nodename} ${kernelRelease} ${kernelVersion} ${machine} ${os}\n`);
      return 0;
    }

    const fields: string[] = [];
    if (flags.has('s')) fields.push(kernelName);
    if (flags.has('n')) fields.push(nodename);
    if (flags.has('r')) fields.push(kernelRelease);
    if (flags.has('v')) fields.push(kernelVersion);
    if (flags.has('m')) fields.push(machine);
    if (flags.has('o')) fields.push(os);

    if (fields.length === 0) {
      fields.push(kernelName);
    }

    ctx.stdout(`${fields.join(' ')}\n`);
    return 0;
  },
};
