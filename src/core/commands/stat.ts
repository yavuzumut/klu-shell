import { modeString, nodeSize, type FsNode } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  const Y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const H = pad(d.getHours());
  const M = pad(d.getMinutes());
  const S = pad(d.getSeconds());
  return `${Y}-${m}-${day} ${H}:${M}:${S}.000000000 +0000`;
}

function octalMode(mode: number): string {
  return '0' + (mode & 0o777).toString(8).padStart(3, '0');
}

function linkCount(node: FsNode): number {
  if (node.type === 'file') return 1;
  return 2 + Object.values(node.children).filter((c) => c.type === 'dir').length;
}

export const stat: CommandDefinition = {
  name: 'stat',
  summary: 'Dosya veya dizin durumunu ve meta verilerini görüntüler.',
  usage: 'stat [-c BİÇİM] DOSYA...',
  completion: 'files',
  manPage: `AD
    stat - dosya veya dosya sistemi durumunu görüntüler

KULLANIM
    stat [SEÇENEK]... DOSYA...

AÇIKLAMA
    Belirtilen DOSYA'ların boyut, tür, erişim izinleri, sahibi ve son değiştirilme
    zamanı gibi ayrıntılı meta verilerini görüntüler.

SEÇENEKLER
    -c, --format=BİÇİM    belirtilen biçimi kullan (%s boyut, %a sekizlik izin, %A harfsel izin, %n ad, %F tür)

ÖRNEKLER
    stat notlar.txt
    stat -c %s notlar.txt
    stat ~/proje`,
  run(args, ctx) {
    if (args.length === 0) {
      ctx.stderr("stat: missing operand\nTry 'stat --help' for more information.\n");
      return 1;
    }

    let format: string | null = null;
    const targets: string[] = [];

    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-c' || a === '--format') {
        if (i + 1 >= args.length) {
          ctx.stderr("stat: option requires an argument -- 'c'\n");
          return 1;
        }
        format = args[++i];
      } else if (a.startsWith('-c')) {
        format = a.slice(2);
      } else if (a.startsWith('--format=')) {
        format = a.slice('--format='.length);
      } else if (a === '--') {
        targets.push(...args.slice(i + 1));
        break;
      } else if (a.startsWith('-') && a !== '-') {
        ctx.stderr(`stat: invalid option -- '${a.slice(1)}'\nTry 'stat --help' for more information.\n`);
        return 1;
      } else {
        targets.push(a);
      }
    }

    if (targets.length === 0) {
      ctx.stderr("stat: missing operand\nTry 'stat --help' for more information.\n");
      return 1;
    }

    let exitCode = 0;
    for (const target of targets) {
      const abs = ctx.resolve(target);
      const node = ctx.fs.tryLookup(abs);
      if (!node) {
        ctx.stderr(`stat: cannot statx '${ctx.shell.displayPath(target)}': No such file or directory\n`);
        exitCode = 1;
        continue;
      }

      const size = nodeSize(node);
      const mode = octalMode(node.mode);
      const modeHuman = modeString(node);
      const typeDesc = node.type === 'dir' ? 'directory' : (size === 0 ? 'regular empty file' : 'regular file');
      const links = linkCount(node);
      const timeStr = formatTimestamp(node.mtime);

      if (format !== null) {
        let out = format;
        out = out.replace(/%n/g, ctx.shell.displayPath(target));
        out = out.replace(/%N/g, `'${ctx.shell.displayPath(target)}'`);
        out = out.replace(/%s/g, String(size));
        out = out.replace(/%a/g, (node.mode & 0o777).toString(8));
        out = out.replace(/%A/g, modeHuman);
        out = out.replace(/%F/g, typeDesc);
        out = out.replace(/%U/g, ctx.shell.displayName(node.owner));
        out = out.replace(/%G/g, ctx.shell.displayName(node.group));
        ctx.stdout(`${out}\n`);
      } else {
        const blocks = Math.ceil(size / 4096) * 8;
        const text =
          `  File: ${ctx.shell.displayPath(target)}\n` +
          `  Size: ${String(size).padEnd(10)} Blocks: ${String(blocks).padEnd(10)} IO Block: 4096   ${typeDesc}\n` +
          `Device: 0/0       \tInode: 1001        Links: ${links}\n` +
          `Access: (${mode}/${modeHuman})  Uid: ( 1000/${ctx.shell.displayName(node.owner)})   Gid: ( 1000/${ctx.shell.displayName(node.group)})\n` +
          `Modify: ${timeStr}\n`;
        ctx.stdout(text);
      }
    }

    return exitCode;
  },
};
