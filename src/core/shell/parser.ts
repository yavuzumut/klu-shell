/**
 * Shell command-line parser.
 *
 * Produces a small AST:
 *   CommandList  := Pipeline (( ';' | '&&' | '||' ) Pipeline)*
 *   Pipeline     := SimpleCommand ('|' SimpleCommand)*
 *   SimpleCommand:= (word | redirect)+
 *
 * Variable expansion ($VAR, ${VAR}, $?) and tilde expansion happen here.
 * Glob characters are kept but flagged so the executor can expand them
 * against the virtual file system.
 */

export type ListOperator = ';' | '&&' | '||';
export type RedirectOp = '>' | '>>' | '<' | '2>' | '2>>';

export interface Word {
  value: string;
  /** True if the word contains unquoted `*`, `?` or `[` that should be globbed. */
  glob: boolean;
}

export interface Redirect {
  op: RedirectOp;
  target: Word;
}

export interface SimpleCommand {
  words: Word[];
  redirects: Redirect[];
}

export interface Pipeline {
  commands: SimpleCommand[];
}

export interface ListItem {
  pipeline: Pipeline;
  /** Operator that connects this item to the NEXT one. */
  next: ListOperator | null;
}

export interface CommandList {
  items: ListItem[];
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

type Token = { kind: 'word'; word: Word } | { kind: 'op'; op: string };

export interface ParseEnv {
  vars: Record<string, string>;
  home: string;
}

const OPERATORS = ['&&', '||', '2>>', '>>', '2>', '|', ';', '>', '<', '&'];

export function tokenize(input: string, env: ParseEnv): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;

  const readVar = (): string => {
    // assumes input[i] === '$'
    i++;
    if (input[i] === '?') {
      i++;
      return env.vars['?'] ?? '0';
    }
    if (input[i] === '{') {
      const end = input.indexOf('}', i);
      if (end === -1) throw new ParseError('bad substitution');
      const name = input.slice(i + 1, end);
      i = end + 1;
      return env.vars[name] ?? '';
    }
    const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(input.slice(i));
    if (!m) return '$';
    i += m[0].length;
    return env.vars[m[0]] ?? '';
  };

  while (i < n) {
    const ch = input[i];
    if (ch === ' ' || ch === '\t' || ch === '\n') {
      i++;
      continue;
    }
    if (ch === '#') break; // comment until end of line

    // Operators. `2>` is only an operator at the start of a word.
    const op = OPERATORS.find((o) => input.startsWith(o, i));
    if (op) {
      tokens.push({ kind: 'op', op });
      i += op.length;
      continue;
    }

    // Word
    let value = '';
    let glob = false;
    let quotedAny = false;
    const wordStart = i;
    while (i < n) {
      const c = input[i];
      if (c === ' ' || c === '\t' || c === '\n') break;
      if ('|;&<>'.includes(c)) break;
      if (c === '\\') {
        if (i + 1 < n) value += input[i + 1];
        i += 2;
        quotedAny = true;
      } else if (c === "'") {
        const end = input.indexOf("'", i + 1);
        if (end === -1) throw new ParseError("unexpected EOF while looking for matching `''");
        value += input.slice(i + 1, end);
        i = end + 1;
        quotedAny = true;
      } else if (c === '"') {
        i++;
        quotedAny = true;
        let closed = false;
        while (i < n) {
          const d = input[i];
          if (d === '"') {
            closed = true;
            i++;
            break;
          }
          if (d === '\\' && i + 1 < n && '"\\$`'.includes(input[i + 1])) {
            value += input[i + 1];
            i += 2;
          } else if (d === '$') {
            value += readVar();
          } else {
            value += d;
            i++;
          }
        }
        if (!closed) throw new ParseError('unexpected EOF while looking for matching `"\'');
      } else if (c === '$') {
        value += readVar();
      } else if (c === '~' && i === wordStart && (i + 1 >= n || '/ \t|;&<>'.includes(input[i + 1]))) {
        value += env.home;
        i++;
      } else {
        if (c === '*' || c === '?' || c === '[') glob = true;
        value += c;
        i++;
      }
    }
    // Skip words that expanded to nothing and were never quoted (e.g. $UNSET)
    if (value === '' && !quotedAny) continue;
    tokens.push({ kind: 'word', word: { value, glob } });
  }
  return tokens;
}

export function parse(input: string, env: ParseEnv): CommandList {
  const tokens = tokenize(input, env);
  const items: ListItem[] = [];
  let pipeline: Pipeline = { commands: [] };
  let current: SimpleCommand = { words: [], redirects: [] };
  let pos = 0;

  const unexpected = (tok: string) => new ParseError(`syntax error near unexpected token \`${tok}'`);

  const finishCommand = (opTok: string) => {
    if (!current.words.length && !current.redirects.length) throw unexpected(opTok);
    pipeline.commands.push(current);
    current = { words: [], redirects: [] };
  };

  while (pos < tokens.length) {
    const tok = tokens[pos++];
    if (tok.kind === 'word') {
      current.words.push(tok.word);
      continue;
    }
    switch (tok.op) {
      case '>':
      case '>>':
      case '<':
      case '2>':
      case '2>>': {
        const target = tokens[pos++];
        if (!target) throw unexpected('newline');
        if (target.kind !== 'word') throw unexpected(target.op);
        current.redirects.push({ op: tok.op, target: target.word });
        break;
      }
      case '|':
        finishCommand('|');
        break;
      case ';':
      case '&&':
      case '||':
        finishCommand(tok.op);
        items.push({ pipeline, next: tok.op as ListOperator });
        pipeline = { commands: [] };
        break;
      case '&':
        throw new ParseError('background jobs (&) are not supported yet');
      default:
        throw unexpected(tok.op);
    }
  }

  if (current.words.length || current.redirects.length) {
    pipeline.commands.push(current);
  } else if (pipeline.commands.length) {
    // Trailing pipe, e.g. "ls |"
    throw unexpected('newline');
  }
  if (pipeline.commands.length) {
    items.push({ pipeline, next: null });
  } else if (items.length) {
    const last = items[items.length - 1];
    if (last.next === ';') last.next = null; // "ls;" is fine
    else throw unexpected('newline');
  }
  return { items };
}

/** Quote path for shell insertion if it contains characters outside [A-Za-z0-9_./~-]. */
export function quotePath(path: string): string {
  if (/[^A-Za-z0-9_./~-]/.test(path)) {
    return `'${path.replace(/'/g, "'\\''")}'`;
  }
  return path;
}

