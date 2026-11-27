import { joinPath } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';
import { splitLines, tryParseArgs } from './_utils';

const MATCH_COLOR = (s: string) => `\x1b[01;31m${s}\x1b[0m`;
const NAME_COLOR = (s: string) => `\x1b[35m${s}\x1b[0m`;
const SEP_COLOR = (s: string) => `\x1b[36m${s}\x1b[0m`;
const LINE_NO_COLOR = (s: string) => `\x1b[32m${s}\x1b[0m`;

/**
 * Translate a GNU basic regular expression (BRE) to a JS RegExp source.
 * In BRE `+ ? | ( ) { }` are literal and their backslashed forms are special;
 * `. * ^ $ [ ]` behave as usual.
 */
export function breToJs(pattern: string): string {
  let out = '';
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === '\\' && i + 1 < pattern.length) {
      const n = pattern[++i];
      out += '+?|(){}'.includes(n) ? n : '\\' + n;
    } else if ('+?|(){}'.includes(c)) {
      out += '\\' + c;
    } else if (c === '[') {
      const end = pattern.indexOf(']', i + (pattern[i + 1] === ']' ? 2 : 1));
      if (end === -1) {
        out += '\\[';
      } else {
        out += pattern.slice(i, end + 1);
        i = end;
      }
    } else {
      out += c;
    }
  }
  return out;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

export const grep: CommandDefinition = {
  name: 'grep',
  summary: 'Metin içinde desen arar, eşleşen satırları gösterir.',
  usage: 'grep [-invcrlwEF] DESEN [DOSYA]...',
  completion: 'files',
  manPage: `AD
    grep - desene uyan satırları yazdırır

KULLANIM
    grep [SEÇENEK]... DESEN [DOSYA]...

AÇIKLAMA
    Her DOSYA'yı satır satır okur ve DESEN'i içeren satırları yazar.
    DOSYA verilmezse standart girdiyi (pipe) okur: ls | grep txt
    Birden fazla dosyada arama yapılırsa her satırın başına dosya adı
    eklenir. Eşleşen kısımlar terminalde kırmızıyla vurgulanır.

    DESEN boşluk veya * gibi özel karakterler içeriyorsa tırnak içine al:
    grep "disk dolu" sunucu.log

SEÇENEKLER
    -i, --ignore-case     büyük/küçük harf ayrımı yapma
    -v, --invert-match    desene UYMAYAN satırları göster
    -n, --line-number     satır numaralarını göster
    -c, --count           satırlar yerine eşleşen satır SAYISINI yaz
    -l, --files-with-matches
                          yalnızca eşleşme içeren dosyaların adını yaz
    -w, --word-regexp     yalnızca tam kelime eşleşmeleri
    -r, -R, --recursive   dizinlerin içinde de (alt dizinler dahil) ara
    -E, --extended-regexp genişletilmiş düzenli ifade (+ ? | ( ) özel)
    -F, --fixed-strings   deseni düz metin olarak ara (özel karakter yok)

DESEN İPUÇLARI
    ^kelime    satır başında      kelime$   satır sonunda
    .          herhangi bir karakter
    a*         sıfır veya daha fazla "a"
    [0-9]      bir rakam

ÇIKIŞ DURUMU
    0 eşleşme bulundu, 1 eşleşme yok, 2 hata.

ÖRNEKLER
    grep süt Belgeler/alisveris.txt
    grep -i error /var/log/syslog
    grep -rn Linux Belgeler
    cat /etc/passwd | grep bash`,
  run(args, ctx) {
    const parsed = tryParseArgs(
      ctx,
      args,
      'ivnclwrREF',
      {
        'ignore-case': 'i',
        'invert-match': 'v',
        'line-number': 'n',
        count: 'c',
        'files-with-matches': 'l',
        'word-regexp': 'w',
        recursive: 'r',
        'extended-regexp': 'E',
        'fixed-strings': 'F',
      },
      2,
    );
    if (!parsed) return 2;
    const { flags } = parsed;
    const operands = [...parsed.operands];
    if (!operands.length) {
      ctx.stderr(`Usage: grep [OPTION]... PATTERNS [FILE]...\nTry 'grep --help' for more information.\n`);
      return 2;
    }
    const pattern = operands.shift()!;
    const recursive = flags.has('r') || flags.has('R');

    let source = flags.has('F') ? escapeRegExp(pattern) : flags.has('E') ? pattern : breToJs(pattern);
    if (flags.has('w')) source = `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`;
    let re: RegExp;
    try {
      re = new RegExp(source, `gu${flags.has('i') ? 'i' : ''}`);
    } catch {
      ctx.stderr('grep: Invalid regular expression\n');
      return 2;
    }

    // Collect inputs: files (expanded recursively with -r) or stdin.
    const inputs: { name: string; text: string }[] = [];
    let hadError = false;
    const addPath = (display: string, abs: string, top: boolean) => {
      const node = ctx.fs.tryLookup(abs);
      if (!node) {
        ctx.stderr(`grep: ${display}: No such file or directory\n`);
        hadError = true;
        return;
      }
      if (node.type === 'file') {
        inputs.push({ name: display, text: ctx.shell.displayText(node.content) });
        return;
      }
      if (!recursive) {
        ctx.stderr(`grep: ${display}: Is a directory\n`);
        hadError = true;
        return;
      }
      expandedDir = true;
      for (const child of ctx.fs.readdir(abs)) {
        const childDisplay = display === '.' && top && !operands.length ? child.name : joinPath(display, child.name);
        addPath(childDisplay, joinPath(abs, child.name), false);
      }
    };
    let expandedDir = false;

    if (!operands.length && recursive) {
      addPath('.', ctx.cwd, true);
    } else if (!operands.length) {
      inputs.push({ name: '(standard input)', text: ctx.stdin ?? '' });
    } else {
      for (const op of operands) {
        if (op === '-') inputs.push({ name: '(standard input)', text: ctx.stdin ?? '' });
        else addPath(op, ctx.resolve(op), true);
      }
    }

    const showNames = operands.length > 1 || expandedDir;
    const paint = (s: string, fn: (x: string) => string) => (ctx.isTTY ? fn(s) : s);
    const sep = paint(':', SEP_COLOR);
    let out = '';
    let matchedAny = false;

    for (const input of inputs) {
      let fileMatches = 0;
      splitLines(input.text).forEach((line, idx) => {
        re.lastIndex = 0;
        const hit = re.test(line);
        if (hit === flags.has('v')) return;
        fileMatches++;
        if (flags.has('c') || flags.has('l')) return;
        let text = line;
        if (ctx.isTTY && !flags.has('v')) {
          re.lastIndex = 0;
          text = line.replace(re, (m) => (m ? MATCH_COLOR(m) : m));
        }
        let prefix = '';
        if (showNames) prefix += paint(input.name, NAME_COLOR) + sep;
        if (flags.has('n')) prefix += paint(String(idx + 1), LINE_NO_COLOR) + sep;
        out += prefix + text + '\n';
      });
      if (fileMatches) matchedAny = true;
      if (flags.has('l')) {
        if (fileMatches) out += paint(input.name, NAME_COLOR) + '\n';
      } else if (flags.has('c')) {
        out += (showNames ? paint(input.name, NAME_COLOR) + sep : '') + fileMatches + '\n';
      }
    }

    ctx.stdout(ctx.shell.displayText(out));
    if (hadError) return 2;
    return matchedAny ? 0 : 1;
  },
};
