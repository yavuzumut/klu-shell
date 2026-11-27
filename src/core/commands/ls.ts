import { modeString, nodeSize, type FsNode } from '../fs/VirtualFS';
import type { CommandContext, CommandDefinition } from '../shell/types';
import { color, tryParseArgs } from './_utils';

function formatDate(ms: number, lang: 'tr' | 'en'): string {
  const d = new Date(ms);
  const day = String(d.getDate()).padStart(2, ' ');
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const locale = lang === 'en' ? 'en-US' : 'tr-TR';
  const month = new Intl.DateTimeFormat(locale, { month: 'short' }).format(d).replace(/\.$/, '');
  return `${month} ${day} ${time}`;
}

/** Sort like GNU ls in a UTF-8 locale: ignore leading dots, case-insensitive. */
function sortKey(name: string, locale: 'tr' | 'en'): string {
  return name.replace(/^\.+/, '').toLocaleLowerCase(locale);
}

interface Entry {
  name: string;
  node: FsNode;
}

function linkCount(node: FsNode): number {
  if (node.type === 'file') return 1;
  return 2 + Object.values(node.children).filter((c) => c.type === 'dir').length;
}

function formatName(entry: Entry, ctx: CommandContext): string {
  const name = ctx.shell.displayPath(entry.name).replace(/[\x00-\x1f\x7f-\x9f]/g, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`);
  return ctx.isTTY && entry.node.type === 'dir' ? color.dir(name) : name;
}

function formatEntries(entries: Entry[], long: boolean, ctx: CommandContext): string {
  if (!entries.length) return '';
  if (!long) return entries.map((e) => formatName(e, ctx)).join('  ') + '\n';

  const rows = entries.map((e) => ({
    mode: modeString(e.node),
    links: String(linkCount(e.node)),
    owner: ctx.shell.displayName(e.node.owner),
    group: ctx.shell.displayName(e.node.group),
    size: String(nodeSize(e.node)),
    date: formatDate(e.node.mtime, ctx.shell.lang),
    name: formatName(e, ctx),
  }));
  const w = (k: keyof (typeof rows)[number]) => Math.max(...rows.map((r) => r[k].length));
  const [wl, wo, wg, ws] = [w('links'), w('owner'), w('group'), w('size')];
  return (
    rows
      .map(
        (r) =>
          `${r.mode} ${r.links.padStart(wl)} ${r.owner.padEnd(wo)} ${r.group.padEnd(wg)} ${r.size.padStart(ws)} ${r.date} ${r.name}`,
      )
      .join('\n') + '\n'
  );
}

function totalBlocks(entries: Entry[]): number {
  return entries.reduce((sum, e) => sum + Math.ceil(nodeSize(e.node) / 4096) * 4, 0);
}

export const ls: CommandDefinition = {
  name: 'ls',
  summary: 'Dizin içeriğini listeler.',
  usage: 'ls [-alA1] [DOSYA]...',
  completion: 'files',
  manPage: `AD
    ls - dizin içeriğini listeler (list)

KULLANIM
    ls [SEÇENEK]... [DOSYA]...

AÇIKLAMA
    DOSYA'lar hakkında bilgi verir. Dosya verilmezse bulunduğun dizini
    listeler. Adı nokta (.) ile başlayan dosyalar gizlidir ve varsayılan
    olarak gösterilmez.

SEÇENEKLER
    -a, --all          gizli dosyalar dahil hepsini göster (. ve .. dahil)
    -A, --almost-all   . ve .. hariç gizli dosyaları da göster
    -l                 uzun liste biçimi (izinler, sahip, boyut, tarih)
    -1                 her satıra bir dosya

UZUN BİÇİM (ls -l)
    drwxr-xr-x 2 kullanici kullanici 4096 Nov 19 10:00 Belgeler
    │└─izinler─┘ │ └─sahip─┘ └─grup──┘ └boyut └─tarih─┘   └─ad
    └ tür: d = dizin, - = dosya

ÖRNEKLER
    ls            bulunduğun dizini listele
    ls -la        gizli dosyalarla birlikte, uzun biçimde listele
    ls /etc       /etc dizinini listele`,
  run(args, ctx) {
    const parsed = tryParseArgs(ctx, args, 'alA1', { all: 'a', 'almost-all': 'A' }, 2);
    if (!parsed) return 2;
    const { flags, operands } = parsed;
    const showAll = flags.has('a');
    const showHidden = showAll || flags.has('A');
    const long = flags.has('l');
    const onePerLine = flags.has('1');
    const targets = operands.length ? operands : ['.'];

    let exitCode = 0;
    const files: Entry[] = [];
    const dirs: { label: string; abs: string }[] = [];

    for (const target of targets) {
      const abs = ctx.resolve(target);
      const node = ctx.fs.tryLookup(abs);
      if (!node) {
        ctx.stderr(`ls: cannot access '${ctx.shell.displayPath(target)}': No such file or directory\n`);
        exitCode = 2;
      } else if (node.type === 'dir') {
        dirs.push({ label: ctx.shell.displayPath(target), abs });
      } else {
        files.push({ name: target, node });
      }
    }

    const render = (entries: Entry[]) => {
      if ((onePerLine || !ctx.isTTY) && !long) {
        return entries.map((e) => formatName(e, ctx) + '\n').join('');
      }
      return formatEntries(entries, long, ctx);
    };

    let out = render(files);
    const multiple = targets.length > 1;
    dirs.forEach((d, idx) => {
      let entries: Entry[] = ctx.fs
        .readdir(d.abs)
        .filter((n) => showHidden || !n.name.startsWith('.'))
        .map((n) => ({ name: n.name, node: n }));
      if (showAll) {
        entries.push({ name: '.', node: ctx.fs.lookup(d.abs) });
        entries.push({ name: '..', node: ctx.fs.lookup(ctx.fs.resolve('..', d.abs)) });
      }
      entries = entries.sort((a, b) => {
        if (a.name === '.' || a.name === '..') return b.name === '.' || b.name === '..' ? a.name.length - b.name.length : -1;
        if (b.name === '.' || b.name === '..') return 1;
        const locale = ctx.shell.lang === 'en' ? 'en' : 'tr';
        const nameA = ctx.shell.displayName(a.name);
        const nameB = ctx.shell.displayName(b.name);
        return sortKey(nameA, locale).localeCompare(sortKey(nameB, locale), locale) || nameA.localeCompare(nameB, locale);
      });
      if (out || idx > 0) out += '\n';
      if (multiple || files.length) out += `${d.label}:\n`;
      if (long) out += `total ${totalBlocks(entries)}\n`;
      out += render(entries);
    });

    ctx.stdout(out);
    return exitCode;
  },
};
