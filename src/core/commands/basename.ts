import type { CommandDefinition } from '../shell/types';

function extractBasename(path: string, suffix?: string): string {
  // Strip trailing slashes
  const trimmed = path.replace(/\/+$/, '');
  if (!trimmed) return '/';
  let name = trimmed.split('/').pop() || '/';
  if (suffix && name !== suffix && name.endsWith(suffix)) {
    name = name.slice(0, -suffix.length);
  }
  return name;
}

export const basename: CommandDefinition = {
  name: 'basename',
  summary: 'Yol bileşenlerinden dizin ve uzantıyı ayıklar.',
  usage: 'basename AD [SONEK] veya basename -s SONEK AD...',
  completion: 'files',
  manPage: `AD
    basename - bir dosya yolundan dizin ve son eki çıkarır

KULLANIM
    basename AD [SONEK]
    basename [SEÇENEK]... AD...

AÇIKLAMA
    AD dizesinden baştaki dizin bileşenlerini kaldırarak sadece dosya adını
    yazdırır. SONEK belirtilmişse ve dosya adının sonundaysa onu da kırpar.

SEÇENEKLER
    -s, --suffix=SONEK   belirtilen son eki kaldır
    -a, --multiple       birden fazla argüman desteği sağla

ÖRNEKLER
    basename /usr/bin/sort          # sort
    basename /home/kullanici/app.js # app.js
    basename ~/src/app.js .js       # app
    basename -s .txt notlar.txt     # notlar`,
  run(args, ctx) {
    if (args.length === 0) {
      ctx.stderr("basename: missing operand\nTry 'basename --help' for more information.\n");
      return 1;
    }

    let suffix: string | undefined = undefined;
    let multiple = false;
    const operands: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-s' || a === '--suffix') {
        if (i + 1 >= args.length) {
          ctx.stderr("basename: option requires an argument -- 's'\n");
          return 1;
        }
        suffix = args[++i];
        multiple = true;
      } else if (a.startsWith('-s')) {
        suffix = a.slice(2);
        multiple = true;
      } else if (a.startsWith('--suffix=')) {
        suffix = a.slice('--suffix='.length);
        multiple = true;
      } else if (a === '-a' || a === '--multiple') {
        multiple = true;
      } else if (a === '--') {
        operands.push(...args.slice(i + 1));
        break;
      } else if (a.startsWith('-') && a !== '-') {
        ctx.stderr(`basename: invalid option -- '${a.slice(1)}'\nTry 'basename --help' for more information.\n`);
        return 1;
      } else {
        operands.push(a);
      }
    }

    if (operands.length === 0) {
      ctx.stderr("basename: missing operand\nTry 'basename --help' for more information.\n");
      return 1;
    }

    if (!multiple) {
      if (operands.length > 2) {
        ctx.stderr(`basename: extra operand '${operands[2]}'\nTry 'basename --help' for more information.\n`);
        return 1;
      }
      const [path, explicitSuffix] = operands;
      ctx.stdout(`${extractBasename(path, explicitSuffix)}\n`);
      return 0;
    }

    for (const op of operands) {
      ctx.stdout(`${extractBasename(op, suffix)}\n`);
    }

    return 0;
  },
};
