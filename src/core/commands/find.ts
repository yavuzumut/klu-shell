import { basename, joinPath } from '../fs/VirtualFS';
import { globToRegExp } from '../shell/glob';
import type { CommandDefinition } from '../shell/types';

interface FindTest {
  (name: string, type: 'file' | 'dir'): boolean;
}

export const find: CommandDefinition = {
  name: 'find',
  summary: 'Dizin ağacında ada veya türe göre dosya arar.',
  usage: 'find [YOL]... [-name DESEN] [-iname DESEN] [-type f|d] [-maxdepth N]',
  completion: 'files',
  manPage: `AD
    find - dizin hiyerarşisinde dosya arar

KULLANIM
    find [YOL]... [İFADE]

AÇIKLAMA
    YOL'dan (verilmezse bulunduğun dizinden, ".") başlayarak tüm alt
    dizinleri gezer ve İFADE'ye uyan her dosya ve dizinin yolunu yazar.
    İFADE verilmezse her şeyi listeler. Birden fazla koşul verilirse
    hepsinin sağlanması gerekir (VE).

İFADELER
    -name DESEN     dosya adı DESEN'e uyanlar (* ? [] kullanılabilir)
    -iname DESEN    -name gibi ama büyük/küçük harf ayrımı yapmaz
    -type f         yalnızca dosyalar
    -type d         yalnızca dizinler
    -maxdepth N     en fazla N seviye derine in (0 = yalnızca YOL)

    ÖNEMLİ: DESEN'i tırnak içine al: find . -name "*.txt"
    Tırnaksız yazarsan kabuk * işaretini find çalışmadan önce
    bulunduğun dizindeki dosya adlarıyla değiştirir.

ÖRNEKLER
    find
    find Belgeler -type f
    find ~ -name "*.txt"
    find / -maxdepth 1 -type d`,
  run(args, ctx) {
    const paths: string[] = [];
    let i = 0;
    while (i < args.length && !args[i].startsWith('-')) paths.push(args[i++]);
    if (!paths.length) paths.push('.');

    const tests: FindTest[] = [];
    let maxDepth = Infinity;
    while (i < args.length) {
      const pred = args[i++];
      const needArg = (): string | null => {
        if (i >= args.length) {
          ctx.stderr(`find: missing argument to '${pred}'\n`);
          return null;
        }
        return args[i++];
      };
      switch (pred) {
        case '-name':
        case '-iname': {
          const pattern = needArg();
          if (pattern === null) return 1;
          let matcher: RegExp;
          try {
            const re = globToRegExp(pattern);
            matcher = pred === '-iname' ? new RegExp(re.source, 'i') : re;
          } catch {
            ctx.stderr(`find: invalid pattern '${pattern}'\n`);
            return 1;
          }
          tests.push((name) => matcher.test(name));
          break;
        }
        case '-type': {
          const t = needArg();
          if (t === null) return 1;
          if (t !== 'f' && t !== 'd') {
            ctx.stderr(`find: Unknown argument to -type: ${t}\n`);
            return 1;
          }
          tests.push((_name, type) => (t === 'f' ? type === 'file' : type === 'dir'));
          break;
        }
        case '-maxdepth': {
          const n = needArg();
          if (n === null) return 1;
          if (!/^\d+$/.test(n)) {
            ctx.stderr(`find: Expected a positive decimal integer argument to -maxdepth, but got '${n}'\n`);
            return 1;
          }
          maxDepth = parseInt(n, 10);
          break;
        }
        case '-print':
          break;
        default:
          ctx.stderr(
            pred.startsWith('-')
              ? `find: unknown predicate '${pred}'\n`
              : `find: paths must precede expression: '${pred}'\n`,
          );
          return 1;
      }
    }

    const out: string[] = [];
    let exitCode = 0;
    const walk = (display: string, abs: string, depth: number) => {
      const node = ctx.fs.tryLookup(abs);
      if (!node) return;
      const name = ctx.shell.displayName(depth === 0 ? basename(display) : node.name);
      if (tests.every((t) => t(name, node.type))) out.push(ctx.shell.displayPath(display));
      if (node.type === 'dir' && depth < maxDepth) {
        for (const child of ctx.fs.readdir(abs)) {
          walk(joinPath(display, child.name), joinPath(abs, child.name), depth + 1);
        }
      }
    };

    for (const p of paths) {
      const abs = ctx.resolve(p);
      if (!ctx.fs.exists(abs)) {
        ctx.stderr(`find: '${ctx.shell.displayPath(p)}': No such file or directory\n`);
        exitCode = 1;
        continue;
      }
      walk(p, abs, 0);
    }
    ctx.stdout(out.length ? out.join('\n') + '\n' : '');
    return exitCode;
  },
};
