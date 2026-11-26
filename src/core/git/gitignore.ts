/**
 * Minimal `.gitignore` matcher.
 *
 * Supported syntax:
 *   - blank lines and `#` comments are skipped
 *   - `*`, `?` and `**` globs
 *   - trailing `/` matches directories only (`node_modules/`)
 *   - a `/` at the start or in the middle anchors the pattern to the repo root
 *   - `!pattern` re-includes a previously ignored path (last match wins)
 */

interface IgnoreRule {
  regex: RegExp;
  negate: boolean;
  dirOnly: boolean;
  anchored: boolean;
}

function globToRegex(glob: string): RegExp {
  const clean = glob
    .replace(/\/{2,}/g, '/')
    .replace(/(?:\*\*\/)+/g, '**/')
    .replace(/\*{3,}/g, '**');

  let re = '';
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === '*') {
      if (clean[i + 1] === '*') {
        // `**/` matches zero or more directories, bare `**` matches anything
        if (clean[i + 2] === '/') {
          re += '(?:.*/)?';
          i += 2;
        } else {
          re += '.*';
          i += 1;
        }
      } else {
        re += '[^/]*';
      }
    } else if (ch === '?') {
      re += '[^/]';
    } else if ('\\^$.|+()[]{}'.includes(ch)) {
      re += '\\' + ch;
    } else {
      re += ch;
    }
  }
  try {
    return new RegExp(`^${re}$`);
  } catch {
    return new RegExp('^' + clean.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '$');
  }
}

export class GitIgnore {
  private readonly rules: IgnoreRule[];

  constructor(content: string) {
    this.rules = [];
    for (const raw of content.split('\n')) {
      let line = raw.trim();
      if (!line || line.startsWith('#')) continue;

      let negate = false;
      if (line.startsWith('!')) {
        negate = true;
        line = line.slice(1);
      }
      let dirOnly = false;
      if (line.endsWith('/')) {
        dirOnly = true;
        line = line.replace(/\/+$/, '');
      }
      const anchored = line.includes('/');
      if (line.startsWith('/')) line = line.slice(1);
      if (!line) continue;

      this.rules.push({ regex: globToRegex(line), negate, dirOnly, anchored });
    }
  }

  get isEmpty(): boolean {
    return this.rules.length === 0;
  }

  /** Is the given repo-relative file path ignored? */
  isIgnored(relPath: string): boolean {
    const segments = relPath.split('/').filter(Boolean);
    let ignored = false;
    for (const rule of this.rules) {
      if (this.ruleMatches(rule, segments)) {
        ignored = !rule.negate;
      }
    }
    return ignored;
  }

  private ruleMatches(rule: IgnoreRule, segments: string[]): boolean {
    // Directory-only rules may never match the final (file) segment.
    const lastCandidate = rule.dirOnly ? segments.length - 1 : segments.length;
    for (let i = 0; i < lastCandidate; i++) {
      const candidate = rule.anchored ? segments.slice(0, i + 1).join('/') : segments[i];
      if (rule.regex.test(candidate)) return true;
    }
    return false;
  }
}
