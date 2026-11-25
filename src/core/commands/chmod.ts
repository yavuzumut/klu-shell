import { fsErrorMessage } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';

type ModeUpdater = (current: number) => number;

function parseMode(str: string): ModeUpdater | null {
  // Octal mode: e.g. 755, 644, 0755
  if (/^[0-7]{1,4}$/.test(str)) {
    const target = parseInt(str, 8);
    return () => target;
  }

  // Symbolic clauses: e.g. +x, u+x, go-w, a=rwx
  const clauses = str.split(',');
  const parsedClauses: Array<{ who: number; op: string; mask: number }> = [];

  for (const clause of clauses) {
    const match = /^([ugoa]*)([-+=])([rwx]*)$/.exec(clause);
    if (!match) return null;
    const [, whoStr, op, permStr] = match;

    let whoMask = 0;
    if (!whoStr || whoStr.includes('a')) {
      whoMask = 0o777;
    } else {
      if (whoStr.includes('u')) whoMask |= 0o700;
      if (whoStr.includes('g')) whoMask |= 0o070;
      if (whoStr.includes('o')) whoMask |= 0o007;
    }

    let permBits = 0;
    if (permStr.includes('r')) permBits |= 0o444;
    if (permStr.includes('w')) permBits |= 0o222;
    if (permStr.includes('x')) permBits |= 0o111;

    parsedClauses.push({ who: whoMask, op, mask: permBits & whoMask });
  }

  return (current: number) => {
    let mode = current;
    for (const { who, op, mask } of parsedClauses) {
      if (op === '+') {
        mode |= mask;
      } else if (op === '-') {
        mode &= ~mask;
      } else if (op === '=') {
        mode = (mode & ~who) | mask;
      }
    }
    return mode;
  };
}

export const chmod: CommandDefinition = {
  name: 'chmod',
  summary: 'Dosya veya dizin izinlerini değiştirir.',
  usage: 'chmod [-R] KİP DOSYA...',
  completion: 'files',
  manPage: `AD
    chmod - dosya erişim izinlerini değiştirir (change mode)

KULLANIM
    chmod [SEÇENEK]... KİP DOSYA...

AÇIKLAMA
    Belirtilen DOSYA'ların erişim izinlerini (okuma, yazma, çalıştırma) KİP'e
    göre değiştirir. KİP sayısal (sekizlik) veya harfsel (sembolik) olabilir.

SEÇENEKLER
    -R, --recursive    dizinleri ve içeriklerini özyinelemeli olarak değiştir

SAYISAL İZİNLER
    4 = Okuma (r), 2 = Yazma (w), 1 = Çalıştırma (x)
    755: Sahip (rwx = 7), Grup (r-x = 5), Diğerleri (r-x = 5)
    644: Sahip (rw- = 6), Grup (r-- = 4), Diğerleri (r-- = 4)
    700: Yalnızca sahip için tam yetki

HARFSEL (SEMBOLİK) İZİNLER
    +x: Herkes için çalıştırma izni ekler
    -w: Yazma iznini kaldırır
    u+x: Dosya sahibine çalıştırma izni verir
    g-w: Gruptan yazma iznini alır

ÖRNEKLER
    chmod 755 betik.sh
    chmod 644 rapor.txt
    chmod +x program.sh
    chmod -R 755 ~/proje`,
  run(args, ctx) {
    const flags = new Set<string>();
    const operands: string[] = [];
    let endOfOptions = false;

    for (const arg of args) {
      if (endOfOptions) {
        operands.push(arg);
      } else if (arg === '--') {
        endOfOptions = true;
      } else if (arg === '-R' || arg === '--recursive') {
        flags.add('R');
      } else if (arg.startsWith('--')) {
        ctx.stderr(`chmod: unrecognized option '${arg}'\nTry 'chmod --help' for more information.\n`);
        return 1;
      } else if (arg.startsWith('-') && /^[ugoa]*[-+=]/.test(arg)) {
        // e.g. -w, -x, -r, -rwx, -u+x
        operands.push(arg);
      } else if (arg.startsWith('-') && arg.length > 1 && !/^[0-7]/.test(arg.slice(1))) {
        // short options e.g. -R
        let hasOnlyOptions = true;
        for (const ch of arg.slice(1)) {
          if (ch === 'R') {
            flags.add('R');
          } else {
            hasOnlyOptions = false;
            break;
          }
        }
        if (hasOnlyOptions) continue;
        operands.push(arg);
      } else {
        operands.push(arg);
      }
    }

    const recursive = flags.has('R');

    if (operands.length === 0) {
      ctx.stderr('chmod: missing operand\n');
      return 1;
    }
    if (operands.length === 1) {
      ctx.stderr(`chmod: missing operand after '${operands[0]}'\n`);
      return 1;
    }

    const [modeStr, ...targets] = operands;
    const updater = parseMode(modeStr);
    if (!updater) {
      ctx.stderr(`chmod: invalid mode: '${modeStr}'\n`);
      return 1;
    }

    let exitCode = 0;
    for (const target of targets) {
      const abs = ctx.resolve(target);
      try {
        ctx.fs.chmod(abs, updater, { recursive });
      } catch (err) {
        ctx.stderr(`chmod: cannot access '${target}': ${fsErrorMessage(err)}\n`);
        exitCode = 1;
      }
    }

    return exitCode;
  },
};
