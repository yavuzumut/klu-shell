import type { CommandDefinition } from '../shell/types';

export const realpath: CommandDefinition = {
  name: 'realpath',
  summary: 'Verilen yolun çözümlenmiş mutlak yolunu yazdırır.',
  usage: 'realpath [-m | -q] DOSYA...',
  completion: 'files',
  manPage: `AD
    realpath - çözümlenmiş mutlak dosya yolunu yazdırır

KULLANIM
    realpath [SEÇENEK]... DOSYA...

AÇIKLAMA
    Verilen göreli yollardaki '.', '..' ve '~' bileşenlerini çözümleyerek
    dosya sistemindeki tam mutlak yolu ekrana yazar.

SEÇENEKLER
    -m, --canonicalize-missing   dosya veya dizin mevcut olmasa bile yolu çözümle
    -q, --quiet                  hata mesajlarını sessize al

ÖRNEKLER
    realpath .
    realpath ..
    realpath ~/Belgeler/../notlar.txt`,
  run(args, ctx) {
    if (args.length === 0) {
      ctx.stderr("realpath: missing operand\nTry 'realpath --help' for more information.\n");
      return 1;
    }

    let missingAllowed = false;
    let quiet = false;
    const targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-m' || a === '--canonicalize-missing') {
        missingAllowed = true;
      } else if (a === '-q' || a === '--quiet') {
        quiet = true;
      } else if (a === '--') {
        targets.push(...args.slice(i + 1));
        break;
      } else if (a.startsWith('-') && a !== '-') {
        if (!quiet) {
          ctx.stderr(`realpath: unrecognized option '${a}'\nTry 'realpath --help' for more information.\n`);
        }
        return 1;
      } else {
        targets.push(a);
      }
    }

    if (targets.length === 0) {
      if (!quiet) {
        ctx.stderr("realpath: missing operand\nTry 'realpath --help' for more information.\n");
      }
      return 1;
    }

    let exitCode = 0;
    for (const target of targets) {
      const abs = ctx.resolve(target);
      if (!missingAllowed && !ctx.fs.exists(abs)) {
        if (!quiet) {
          ctx.stderr(`realpath: '${target}': No such file or directory\n`);
        }
        exitCode = 1;
        continue;
      }
      ctx.stdout(`${abs}\n`);
    }

    return exitCode;
  },
};
