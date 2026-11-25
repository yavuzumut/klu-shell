import { describe, expect, it } from 'vitest';
import { globToRegExp } from './glob';
import { parse, ParseError, tokenize } from './parser';

const env = { vars: { HOME: '/home/kullanici', USER: 'kullanici', '?': '0', EMPTY: '' }, home: '/home/kullanici' };
const words = (input: string) =>
  tokenize(input, env)
    .filter((t) => t.kind === 'word')
    .map((t) => (t.kind === 'word' ? t.word.value : ''));

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(words('ls   -la  /etc')).toEqual(['ls', '-la', '/etc']);
  });

  it('handles quotes and escapes', () => {
    expect(words(`echo "a  b" 'c d' e\\ f`)).toEqual(['echo', 'a  b', 'c d', 'e f']);
    expect(words(`echo "say \\"hi\\""`)).toEqual(['echo', 'say "hi"']);
    expect(words(`echo ab"cd"'ef'`)).toEqual(['echo', 'abcdef']);
  });

  it('expands variables except in single quotes', () => {
    expect(words('echo $HOME "$USER" \'$USER\' ${USER}x')).toEqual([
      'echo',
      '/home/kullanici',
      'kullanici',
      '$USER',
      'kullanicix',
    ]);
    expect(words('echo $?')).toEqual(['echo', '0']);
  });

  it('drops unquoted empty expansions but keeps quoted ones', () => {
    expect(words('echo $EMPTY $NOPE x')).toEqual(['echo', 'x']);
    expect(words('echo "$EMPTY"')).toEqual(['echo', '']);
  });

  it('expands tilde only at word start', () => {
    expect(words('cd ~ ~/a a~ "~"')).toEqual(['cd', '/home/kullanici', '/home/kullanici/a', 'a~', '~']);
  });

  it('flags unquoted globs', () => {
    const toks = tokenize(`ls *.txt "*.md"`, env);
    const globs = toks.map((t) => (t.kind === 'word' ? t.word.glob : null));
    expect(globs).toEqual([false, true, false]);
  });

  it('ignores comments', () => {
    expect(words('ls # yorum')).toEqual(['ls']);
  });

  it('throws on unterminated quotes', () => {
    expect(() => tokenize('echo "abc', env)).toThrow(ParseError);
    expect(() => tokenize("echo 'abc", env)).toThrow(ParseError);
  });
});

describe('parse', () => {
  it('parses pipelines, lists and redirects', () => {
    const ast = parse('ls -l | cat > out.txt && echo ok; pwd', env);
    expect(ast.items).toHaveLength(3);
    expect(ast.items[0].next).toBe('&&');
    expect(ast.items[0].pipeline.commands).toHaveLength(2);
    expect(ast.items[0].pipeline.commands[1].redirects[0]).toMatchObject({ op: '>', target: { value: 'out.txt' } });
    expect(ast.items[1].next).toBe(';');
    expect(ast.items[2].pipeline.commands[0].words[0].value).toBe('pwd');
  });

  it('parses append and stderr redirects', () => {
    const cmd = parse('echo a >> f 2> e', env).items[0].pipeline.commands[0];
    expect(cmd.redirects.map((r) => r.op)).toEqual(['>>', '2>']);
  });

  it('parses logical AND (&&) and OR (||) operators in pipelines and lists', () => {
    const ast = parse('cat in.txt | grep foo > out.txt && echo found || echo missing', env);
    expect(ast.items).toHaveLength(3);
    expect(ast.items[0].next).toBe('&&');
    expect(ast.items[0].pipeline.commands).toHaveLength(2);
    expect(ast.items[1].next).toBe('||');
    expect(ast.items[1].pipeline.commands[0].words[0].value).toBe('echo');
    expect(ast.items[2].next).toBeNull();
    expect(ast.items[2].pipeline.commands[0].words[1].value).toBe('missing');
  });

  it('allows trailing semicolon', () => {
    expect(parse('ls;', env).items).toHaveLength(1);
  });

  it('reports syntax errors like bash', () => {
    expect(() => parse('| ls', env)).toThrow("syntax error near unexpected token `|'");
    expect(() => parse('ls |', env)).toThrow("syntax error near unexpected token `newline'");
    expect(() => parse('echo >', env)).toThrow("syntax error near unexpected token `newline'");
    expect(() => parse('ls && && pwd', env)).toThrow(ParseError);
    expect(() => parse('ls &&', env)).toThrow("syntax error near unexpected token `newline'");
    expect(() => parse('ls ||', env)).toThrow("syntax error near unexpected token `newline'");
    expect(() => parse('&& ls', env)).toThrow("syntax error near unexpected token `&&'");
    expect(() => parse('|| ls', env)).toThrow("syntax error near unexpected token `||'");
    expect(() => parse('echo a && || echo b', env)).toThrow("syntax error near unexpected token `||'");
  });
});

describe('globToRegExp', () => {
  it('collapses consecutive stars and finishes in under 100ms on non-matching text', () => {
    const pattern = '*'.repeat(30) + 'x';
    const re = globToRegExp(pattern);
    const start = performance.now();
    const matched = re.test('a'.repeat(50));
    const elapsed = performance.now() - start;
    expect(matched).toBe(false);
    expect(elapsed).toBeLessThan(100);
  });
});
