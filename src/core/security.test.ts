import { describe, expect, it } from 'vitest';
import { getInitialThemeId, THEME_STORAGE_KEY } from '../themes/themeManager';
import { loadProgress, STORAGE_KEY } from '../state/useProgress';
import { createTestShell } from './test/helpers';
import { VirtualFS, FsError } from './fs/VirtualFS';
import { GitRepo, urlToRemotePath } from './git/GitRepo';
import { globToRegExp } from './shell/glob';
import { diffLines } from './git/diff';
import { GitIgnore } from './git/gitignore';
import { sanitizeHtml } from '../components/LessonPanel';
import { marked } from 'marked';

describe('Security & Resilience Audit Tests', () => {
  describe('1. Theme Manager & Prototype Crash Prevention', () => {
    it('falls back to default theme when localStorage contains Object prototype property names', () => {
      const mockStorage = {
        getItem(key: string) {
          if (key === THEME_STORAGE_KEY) return 'toString';
          return null;
        },
      } as Storage;

      // Without Object.hasOwn, this used to return 'toString' and crash applyTheme
      const themeId = getInitialThemeId(mockStorage);
      expect(themeId).toBe('dark');
    });

    it('falls back to default theme when localStorage has constructor or __proto__', () => {
      const mockStorage = {
        getItem(key: string) {
          if (key === THEME_STORAGE_KEY) return 'constructor';
          return null;
        },
      } as Storage;

      expect(getInitialThemeId(mockStorage)).toBe('dark');
    });
  });

  describe('2. localStorage Deep Validation (useProgress)', () => {
    it('handles malformed completed/attempts/revealed without crashing', () => {
      const malformed = JSON.stringify({
        version: 1,
        currentLessonId: 'intro',
        completed: {
          lesson1: 'not-an-array',
          lesson2: [123, null, 'valid-task'],
          __proto__: ['polluted'],
        },
        attempts: {
          'lesson1/task1': 'not-a-number',
          'lesson2/task2': 5,
        },
        revealed: {
          'lesson1/task1': 'true', // string instead of boolean
          'lesson2/task2': true,
        },
        history: ['ls', 123, null, 'pwd'],
      });

      const mockStorage = {
        getItem: (k: string) => (k === STORAGE_KEY ? malformed : null),
      };

      const progress = loadProgress('first-lesson', mockStorage);
      expect(progress.version).toBe(1);
      // 'not-an-array' should be discarded
      expect(progress.completed.lesson1).toBeUndefined();
      // only string tasks retained
      expect(progress.completed.lesson2).toEqual(['valid-task']);
      // non-number attempt discarded
      expect(progress.attempts['lesson1/task1']).toBeUndefined();
      expect(progress.attempts['lesson2/task2']).toBe(5);
      // non-boolean revealed discarded
      expect(progress.revealed['lesson1/task1']).toBeUndefined();
      expect(progress.revealed['lesson2/task2']).toBe(true);
      // history filtered to strings
      expect(progress.history).toEqual(['ls', 'pwd']);
    });
  });

  describe('3. Shell & Env Prototype Hardening', () => {
    it('blocks exporting __proto__, constructor, and prototype', async () => {
      const { run } = createTestShell();

      const r1 = await run('export __proto__=malicious');
      expect(r1.exitCode).toBe(1);
      expect(r1.err).toContain('not a valid identifier');

      const r2 = await run('export constructor=evil');
      expect(r2.exitCode).toBe(1);
      expect(r2.err).toContain('not a valid identifier');

      const r3 = await run('export prototype=evil');
      expect(r3.exitCode).toBe(1);
      expect(r3.err).toContain('not a valid identifier');

      // Verify Object.prototype was not polluted
      expect(({} as any).malicious).toBeUndefined();
    });

    it('returns empty string when expanding undefined prototype properties ($constructor, $toString)', async () => {
      const { run } = createTestShell();

      const r1 = await run('echo "$constructor"');
      expect(r1.out.trim()).toBe('');

      const r2 = await run('echo "$toString"');
      expect(r2.out.trim()).toBe('');

      const r3 = await run('echo "$__proto__"');
      expect(r3.out.trim()).toBe('');
    });
  });

  describe('4. VirtualFS & File Size Limits (EFBIG)', () => {
    it('refuses to write files exceeding MAX_FILE_SIZE with EFBIG', () => {
      const fs = new VirtualFS();
      // 6MB content
      const hugeContent = 'x'.repeat(6 * 1024 * 1024);

      expect(() => {
        fs.writeFile('/huge.txt', hugeContent);
      }).toThrowError(FsError);

      try {
        fs.writeFile('/huge.txt', hugeContent);
      } catch (err: any) {
        expect(err.code).toBe('EFBIG');
        expect(err.description).toBe('File too large');
      }
    });

    it('safely handles files named __proto__ and constructor without polluting prototype', () => {
      const fs = new VirtualFS();
      fs.writeFile('/__proto__', 'hello proto');
      expect(fs.readFile('/__proto__')).toBe('hello proto');
      expect(({} as any)['hello proto']).toBeUndefined();
      expect(({} as any).content).toBeUndefined();

      fs.writeFile('/constructor', 'hello constructor');
      expect(fs.readFile('/constructor')).toBe('hello constructor');
    });

    it('rejects filesystem growth beyond total node and byte limits', () => {
      const nodes = new VirtualFS();
      expect(() => {
        for (let i = 0; i < 2100; i++) nodes.writeFile(`/f${i}`, '');
      }).toThrowError(FsError);
      try { for (let i = 0; i < 2100; i++) nodes.writeFile(`/g${i}`, ''); } catch (err: any) {
        expect(err.code).toBe('ENOSPC');
      }

      const bytes = new VirtualFS();
      bytes.writeFile('/a', 'x'.repeat(5 * 1024 * 1024));
      bytes.writeFile('/b', 'x'.repeat(5 * 1024 * 1024));
      bytes.writeFile('/c', 'x'.repeat(5 * 1024 * 1024));
      bytes.writeFile('/d', 'x'.repeat(5 * 1024 * 1024));
      expect(() => bytes.writeFile('/e', 'x')).toThrowError(FsError);
    });
  });

  describe('5. GitRepo Prototype Resistance', () => {
    it('keeps same-named remotes on different hosts separate', () => {
      expect(urlToRemotePath('https://gitlab.com/org/project.git')).not.toBe(
        urlToRemotePath('https://github.com/org/project.git'),
      );
    });
    it('returns an empty commit list for malformed commits.json data', () => {
      const fs = new VirtualFS();
      const repo = GitRepo.init(fs, '/repo').repo;
      fs.writeFile('/repo/.git/commits.json', '{"broken":true}');
      expect(() => repo.getCommits()).not.toThrow();
      expect(repo.getCommits()).toEqual([]);
    });
    it('handles files named __proto__ or toString in git index safely', () => {
      const fs = new VirtualFS();
      fs.mkdir('/repo');
      const repo = new GitRepo(fs, '/repo');
      fs.mkdir('/repo/.git', { parents: true });
      repo.setHeadRef('main');

      const index = repo.getIndex();
      index['__proto__'] = 'content-hash';
      index['toString'] = 'hash-2';
      repo.saveIndex(index);

      const loadedIndex = repo.getIndex();
      // Dangerous keys should not be loaded or pollute
      expect(loadedIndex['toString']).toBe('hash-2');
      expect(Object.getPrototypeOf(loadedIndex)).toBeNull();
    });

    it('rejects adding remotes named __proto__ or constructor', () => {
      const fs = new VirtualFS();
      fs.mkdir('/repo/.git', { parents: true });
      const repo = new GitRepo(fs, '/repo');

      expect(() => {
        repo.addRemote('__proto__', 'https://github.com/org/repo.git');
      }).toThrow(/not a valid remote name/);

      expect(() => {
        repo.addRemote('constructor', 'https://github.com/org/repo.git');
      }).toThrow(/not a valid remote name/);
    });
  });

  describe('6. Regex & DoS Protection (glob, find, gitignore, diff)', () => {
    it('safely handles invalid character classes in globToRegExp without throwing uncaught SyntaxError', () => {
      expect(() => globToRegExp('[z-a]')).not.toThrow();
      const re = globToRegExp('[z-a]');
      expect(re).toBeInstanceOf(RegExp);
    });

    it('find and grep handle invalid regex without crashing the shell', async () => {
      const { run } = createTestShell();

      // find gracefully treats malformed glob as literal and executes without crashing
      const rFind = await run('find . -name "[z-a]"');
      expect(rFind.exitCode).toBe(0);

      // grep catches invalid regex syntax and reports error with code 2
      const rGrep = await run('echo hello | grep -E "[z-a]"');
      expect(rGrep.exitCode).toBe(2);
      expect(rGrep.err).toContain('Invalid regular expression');
    });

    it('gitignore collapses redundant ** patterns to avoid catastrophic backtracking', () => {
      const gi = new GitIgnore('**/**/**/**/**.txt\n');
      expect(gi.isIgnored('a/b/c/file.txt')).toBe(true);
      expect(gi.isIgnored('file.log')).toBe(false);
    });

    it('diffLines falls back safely on massive inputs without allocating millions of cells', () => {
      const linesA = Array.from({ length: 2000 }, (_, i) => `line ${i}`).join('\n');
      const linesB = Array.from({ length: 2000 }, (_, i) => `modified line ${i}`).join('\n');

      // 2000 * 2000 = 4,000,000 > MAX_DIFF_CELLS (2,500,000)
      const start = Date.now();
      const ops = diffLines(linesA, linesB);
      const elapsed = Date.now() - start;

      // Should complete in milliseconds via fallback
      expect(elapsed).toBeLessThan(100);
      expect(ops.length).toBe(4000); // 2000 removes + 2000 adds
      expect(ops[0].type).toBe('remove');
      expect(ops[2000].type).toBe('add');
    });
  });

  describe('7. XSS & Link Safety (LessonPanel & marked)', () => {
    it('sanitizes dangerous HTML tags and event handlers', () => {
      const dirty = '<div class="alert"><script>alert("XSS")</script><img src=x onerror=alert(1)>Content</div>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).not.toContain('onerror');
      expect(clean).toContain('<div class="alert">');
      expect(clean).toContain('Content</div>');
    });

    it('disallows javascript: URLs in markdown links', () => {
      const dirty = '<a href="javascript:alert(1)">Click</a>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('javascript:');
      expect(clean).not.toContain('href="javascript:');
    });

    it('adds target="_blank" and rel="noopener noreferrer" to external links in marked', () => {
      const parsed = marked.parse('[Visit Google](https://google.com)', { async: false }) as string;
      expect(parsed).toContain('target="_blank"');
      expect(parsed).toContain('rel="noopener noreferrer"');
    });

    it('preserves safe external link target and rel attributes through sanitization', () => {
      const clean = sanitizeHtml('<a href="https://example.com" target="_blank" rel="noopener noreferrer">link</a>');
      expect(clean).toContain('target="_blank"');
      expect(clean).toContain('rel="noopener noreferrer"');
    });
  });
});
