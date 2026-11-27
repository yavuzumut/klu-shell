import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { FileTree } from '../components/FileTree';
import { createDefaultFS, DEFAULT_SEED } from '../core/fs/defaultTree';
import { createTestShell } from '../core/test/helpers';
import { complete } from '../core/shell/completion';
import { ALL_LESSONS } from '../lessons/content';
import { GIT_ALL_LESSONS } from '../git/lessons';
import { localizeFixturePath, localizeFixtureText } from './fixtureLocale';
import { LanguageProvider } from './I18nProvider';
import { LANG_STORAGE_KEY } from './storage';

const TURKISH_PATH_PART = /(?:^|[/.~-])(?:notlar|belgeler|rapor|gorev(?:ler)?|yedek|kod|dosya(?:lar)?|klasor|eski\w*|yeni\w*|merhaba\w*|gizli\w*|sunucu|uygulama|sehirler|alisveris|betik|ozellik|ekip|buton|kullanici|calisma|proje(?:ler)?|cop|arsiv|okul|matematik|siir|sarki|tatil|muzik|resimler|indirilenler|taslak|liste|ilk(?:_\w+)?|numarali|gunluk|ayarlar|dizin)(?=$|[/.~-])/i;
const FIXTURE_PATH_RE = /(?:~\/|\/)?(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.(?:txt|log|sh|py|js|pdf|mp3|jpg|html|c|md|png|webm|gitignore|git|json|conf)/gi;

function collectCheckPaths(check: unknown, paths: string[] = []): string[] {
  if (!check || typeof check !== 'object') return paths;
  const record = check as Record<string, unknown>;
  if (typeof record.path === 'string') paths.push(record.path);
  if (Array.isArray(record.checks)) record.checks.forEach((item) => collectCheckPaths(item, paths));
  if (record.check) collectCheckPaths(record.check, paths);
  return paths;
}

function lessonText(lesson: (typeof ALL_LESSONS)[number]): string[] {
  return [
    ...(lesson.examples ?? []),
    ...(lesson.setup?.setupCommands ?? []),
    ...lesson.tasks.flatMap((task) => [task.description, task.solution, ...task.hints]),
  ];
}

describe('English fixture path localization coverage', () => {
  it('localizes default seed and all Linux/Git lesson setup and task paths', () => {
    const paths = [
      ...(DEFAULT_SEED.dirs ?? []),
      ...Object.keys(DEFAULT_SEED.files ?? {}),
      ...[...ALL_LESSONS, ...GIT_ALL_LESSONS].flatMap((lesson) => [
        ...(lesson.setup?.dirs ?? []),
        ...Object.keys(lesson.setup?.files ?? {}),
        ...lesson.tasks.flatMap((task) => collectCheckPaths(task.check)),
      ]),
    ];

    for (const path of paths) {
      const localized = localizeFixturePath(path, 'en');
      expect(localized, `localized path: ${path}`).not.toMatch(/[şğışöüç]/i);
      expect(localized, `untranslated path token: ${path}`).not.toMatch(TURKISH_PATH_PART);
    }
  });

  it('translates the Turkish fixture text seeded by the default filesystem', () => {
    const seededText = Object.values(DEFAULT_SEED.files ?? {}).map((value) => localizeFixtureText(value, 'en')).join('\n');
    expect(seededText).toContain('Started the KLU learning environment.');
    expect(seededText).toContain('The Penguin has awakened.');
    expect(seededText).toContain('# Shell settings');
    expect(seededText).toContain('[binary image data]');
    expect(seededText).toContain('[binary audio data]');
    expect(seededText).toContain('Hello KLU!');
    expect(seededText).toContain("# root user's settings");
    expect(seededText).not.toMatch(/[şğışöüç]/i);
    expect(seededText).not.toMatch(/kullanici|penguen|ikili|verisi|ayarlari|uyandı/i);
  });

  it('localizes filename and directory examples used by lesson commands and tasks', () => {
    for (const lesson of [...ALL_LESSONS, ...GIT_ALL_LESSONS]) {
      for (const value of lessonText(lesson)) {
        for (const match of value.matchAll(FIXTURE_PATH_RE)) {
          const path = match[0];
          const localized = localizeFixturePath(path, 'en');
          expect(localized, `${lesson.id}: ${path}`).not.toMatch(/[şğışöüç]/i);
          expect(localized, `${lesson.id}: untranslated ${path}`).not.toMatch(TURKISH_PATH_PART);
        }
      }
    }
  });

  it('shows localized names in the File Tree and keeps clicked paths canonical', async () => {
    localStorage.setItem(LANG_STORAGE_KEY, 'en');
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const host = document.createElement('div');
    document.body.append(host);
    const fs = createDefaultFS();
    const selected: string[] = [];
    const root = createRoot(host);

    await act(async () => {
      root.render(
        createElement(LanguageProvider, {
          children: createElement(FileTree, {
            fs,
            cwd: fs.home,
            onSelectPath: (path) => selected.push(path),
          }),
        }),
      );
    });

    const documentsLabel = [...host.querySelectorAll('.tree-label')].find((item) => item.textContent === 'Documents');
    expect(documentsLabel).toBeDefined();
    expect(host.textContent).not.toContain('Belgeler');
    expect(documentsLabel?.closest('.tree-node')?.getAttribute('title')).toBe('/home/user/Documents');

    await act(async () => {
      documentsLabel?.closest('.tree-node')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(selected).toEqual(['/home/kullanici/Belgeler']);

    await act(async () => root.unmount());
    host.remove();
    localStorage.removeItem(LANG_STORAGE_KEY);
  });

  it('localizes pwd, ls, find, and tab completion while resolving the English alias', async () => {
    const { shell, run } = createTestShell();
    shell.lang = 'en';

    expect((await run('pwd')).out).toBe('/home/user\n');
    const listing = (await run('ls -1 ~')).out;
    expect(listing).toContain('Documents\n');
    expect(listing).toContain('hello.txt\n');
    expect(listing).not.toContain('Belgeler');
    expect(listing).not.toContain('notlar');

    const found = (await run('find ~ -maxdepth 1 -name hello.txt')).out;
    expect(found).toBe('/home/user/hello.txt\n');
    expect(complete('cat ~/he', shell).line).toBe('cat ~/hello.txt ');

    const read = await run('cat ~/hello.txt');
    expect(read.exitCode).toBe(0);
    expect(read.out).toContain('Welcome to KLU.');
    expect(shell.fs.exists('/home/kullanici/merhaba.txt')).toBe(true);
  });

  it('localizes paths printed by file commands and resolves localized aliases as input', async () => {
    const { shell, run } = createTestShell();
    shell.lang = 'en';
    const report = '~/Documents/report.txt';

    expect((await run(`stat ${report}`)).out).toContain('File: /home/user/Documents/report.txt');
    expect((await run(`realpath ${report}`)).out).toBe('/home/user/Documents/report.txt\n');
    expect((await run(`basename ${report}`)).out).toBe('report.txt\n');
    expect((await run(`grep Monthly ${report} /etc/hostname`)).out).toContain('/home/user/Documents/report.txt:Monthly Report');
    expect((await run(`wc -l ${report}`)).out).toContain('/home/user/Documents/report.txt');
    expect((await run(`cat ${report}`)).out).toContain('Monthly Report');
    expect((await run(`head -n 1 ${report}`)).out).toBe('Monthly Report\n');
    expect((await run(`tail -n 1 ${report}`)).out).toContain('12 new Linux commands');

    const copy = await run(`cp -v ${report} /tmp/rapor.txt`);
    expect(copy.out).toBe("'/home/user/Documents/report.txt' -> '/tmp/report.txt'\n");
    expect((await run('mv -v /tmp/report.txt /tmp/eski.txt')).out).toBe("renamed '/tmp/report.txt' -> '/tmp/old.txt'\n");
    expect((await run('rm -v /tmp/old.txt')).out).toBe("removed '/tmp/old.txt'\n");
    expect((await run('mkdir -v ~/dosya')).out).toBe("mkdir: created directory '/home/user/file'\n");
    const removed = await run('rm -r -v ~/file');
    expect(removed.out).toBe("removed directory '/home/user/file'\n");
  });

  it('localizes Git branch names and file paths in status and merge conflict output', async () => {
    const { shell, run } = createTestShell();
    shell.lang = 'en';
    await run('git init');
    await run('echo base > ~/notes.txt');
    await run('git add ~/notes.txt');
    await run('git commit -m "first"');
    await run('git switch -c new-feature');
    await run('echo feature > ~/notes.txt');
    await run('git add ~/notes.txt');
    await run('git commit -m "feature"');
    await run('git switch main');
    await run('echo main > ~/notes.txt');
    await run('git add ~/notes.txt');
    await run('git commit -m "main"');

    const branches = await run('git branch');
    expect(branches.out).toContain('new-feature');
    expect(branches.out).not.toContain('yeni-ozellik');
    const merge = await run('git merge new-feature');
    expect(merge.out).toContain('notes.txt');
    expect(merge.out).not.toContain('notlar.txt');
    const status = await run('git status');
    expect(status.out).toContain('notes.txt');
    expect(status.out).not.toContain('notlar.txt');
  });
});
