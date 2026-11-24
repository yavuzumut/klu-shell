import { basename, type VirtualFS } from '../fs/VirtualFS';

/** Convert a shell glob segment (`*.txt`, `a?c`, `[ab]*`) into a RegExp. */
export function globToRegExp(pattern: string): RegExp {
  const normalized = pattern.replace(/\*+/g, '*');
  let re = '^';
  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];
    if (c === '*') re += '.*';
    else if (c === '?') re += '.';
    else if (c === '[') {
      const end = normalized.indexOf(']', i + 1);
      if (end === -1) re += '\\[';
      else {
        let cls = normalized.slice(i + 1, end);
        if (cls.startsWith('!')) cls = '^' + cls.slice(1);
        re += '[' + cls.replace(/\\/g, '\\\\') + ']';
        i = end;
      }
    } else re += c.replace(/[.+^${}()|\\/]/g, '\\$&');
  }
  return new RegExp(re + '$');
}

export function hasGlob(segment: string): boolean {
  return /[*?[]/.test(segment);
}

/**
 * Expand a glob pattern against the virtual file system.
 * Returns matches in the same (relative/absolute) form as the pattern,
 * or `[pattern]` unchanged when nothing matches (bash default behaviour).
 */
export function expandGlob(pattern: string, fs: VirtualFS, cwd: string): string[] {
  const absolute = pattern.startsWith('/');
  const segments = pattern.split('/').filter((s, i) => s !== '' || i === 0);
  if (absolute) segments.shift();

  let candidates: { display: string; abs: string }[] = [
    { display: absolute ? '/' : '', abs: absolute ? '/' : cwd },
  ];

  for (let idx = 0; idx < segments.length; idx++) {
    const seg = segments[idx];
    const next: typeof candidates = [];
    for (const cand of candidates) {
      const join = (name: string) => ({
        display: cand.display === '' || cand.display.endsWith('/') ? cand.display + name : `${cand.display}/${name}`,
        abs: fs.resolve(name, cand.abs),
      });
      if (!hasGlob(seg)) {
        next.push(join(seg));
        continue;
      }
      if (!fs.isDir(cand.abs)) continue;
      const re = globToRegExp(seg);
      for (const node of fs.readdir(cand.abs)) {
        if (node.name.startsWith('.') && !seg.startsWith('.')) continue;
        if (re.test(node.name)) next.push(join(node.name));
      }
    }
    candidates = next;
  }

  const matches = candidates
    .filter((c) => fs.exists(c.abs))
    .map((c) => c.display)
    .sort((a, b) => basename(a).localeCompare(basename(b)) || a.localeCompare(b));
  return matches.length ? matches : [pattern];
}
