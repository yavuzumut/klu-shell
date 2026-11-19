import type { Shell } from './Shell';

export interface CompletionResult {
  /** The new text before the cursor (unchanged if nothing could be completed). */
  line: string;
  /** Candidates to display when completion is ambiguous. */
  options: string[];
}

function longestCommonPrefix(items: string[]): string {
  if (!items.length) return '';
  let prefix = items[0];
  for (const s of items.slice(1)) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

const escape = (s: string) => s.replace(/([ \\'"])/g, '\\$1');

/**
 * Tab completion for the text before the cursor.
 *  - first word of a command → command names
 *  - other words → file/directory paths (only directories for `cd`)
 */
export function complete(before: string, shell: Shell): CompletionResult {
  const match = /[^\s|;&<>]*$/.exec(before);
  const word = match ? match[0] : '';
  const head = before.slice(0, before.length - word.length);
  const segment = head.split(/\|\||&&|[|;&]/).pop() ?? '';
  const segmentWords = segment.trim().split(/\s+/).filter(Boolean);
  const isCommandPosition = segmentWords.length === 0;

  const none: CompletionResult = { line: before, options: [] };

  const finish = (candidates: string[], prefixLen: number, build: (c: string) => string, isFinal: (c: string) => boolean) => {
    if (!candidates.length) return none;
    if (candidates.length === 1) {
      const c = candidates[0];
      return { line: head + build(c) + (isFinal(c) ? ' ' : ''), options: [] };
    }
    const lcp = longestCommonPrefix(candidates);
    if (lcp.length > prefixLen) return { line: head + build(lcp), options: [] };
    return { line: before, options: candidates };
  };

  if (isCommandPosition) {
    const names = shell.registry.names().filter((n) => n.startsWith(word));
    return finish(names, word.length, (c) => c, () => true);
  }

  const def = shell.registry.get(segmentWords[0]);
  const mode = def?.completion ?? 'files';
  if (mode === 'none') return none;
  if (mode === 'commands') {
    const names = shell.registry.names().filter((n) => n.startsWith(word));
    return finish(names, word.length, (c) => c, () => true);
  }

  const unescaped = word.replace(/\\(.)/g, '$1');
  const slash = unescaped.lastIndexOf('/');
  const dirPart = slash >= 0 ? unescaped.slice(0, slash + 1) : '';
  const basePrefix = slash >= 0 ? unescaped.slice(slash + 1) : unescaped;
  if (unescaped === '~') return { line: head + '~/', options: [] };

  const dirAbs = shell.fs.resolve(dirPart || '.', shell.cwd);
  if (!shell.fs.isDir(dirAbs)) return none;

  const candidates = shell.fs
    .readdir(dirAbs)
    .filter((n) => n.name.startsWith(basePrefix))
    .filter((n) => basePrefix.startsWith('.') || !n.name.startsWith('.'))
    .filter((n) => mode !== 'dirs' || n.type === 'dir')
    .map((n) => (n.type === 'dir' ? n.name + '/' : n.name));

  return finish(
    candidates,
    basePrefix.length,
    (c) => escape(dirPart + c),
    (c) => !c.endsWith('/'),
  );
}
