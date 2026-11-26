import { describe, expect, it } from 'vitest';
import { createTestShell } from '../test/helpers';
import { GitIgnore } from './gitignore';

describe('virtual git engine (phase 1)', () => {
  it('fails with fatal error when not in a git repository', async () => {
    const { run } = createTestShell();
    const r1 = await run('git status');
    expect(r1.err).toContain('fatal: not a git repository');
    expect(r1.exitCode).toBe(128);

    const r2 = await run('git add .');
    expect(r2.err).toContain('fatal: not a git repository');
    expect(r2.exitCode).toBe(128);

    const r3 = await run('git commit -m "test"');
    expect(r3.err).toContain('fatal: not a git repository');
    expect(r3.exitCode).toBe(128);

    const r4 = await run('git log');
    expect(r4.err).toContain('fatal: not a git repository');
    expect(r4.exitCode).toBe(128);
  });

  it('initializes a git repository with git init', async () => {
    const { run, fs } = createTestShell();
    const r = await run('git init');
    expect(r.out).toContain('Initialized empty Git repository in /home/kullanici/.git/');
    expect(r.exitCode).toBe(0);

    expect(fs.exists('/home/kullanici/.git')).toBe(true);
    expect(fs.readFile('/home/kullanici/.git/HEAD')).toBe('ref: refs/heads/main\n');

    // Reinitialization
    const r2 = await run('git init');
    expect(r2.out).toContain('Reinitialized existing Git repository in /home/kullanici/.git/');
    expect(r2.exitCode).toBe(0);
  });

  it('initializes a repository in a specified directory', async () => {
    const { run, fs } = createTestShell();
    const r = await run('git init /home/kullanici/yeniproje');
    expect(r.out).toContain('Initialized empty Git repository in /home/kullanici/yeniproje/.git/');
    expect(r.exitCode).toBe(0);
    expect(fs.exists('/home/kullanici/yeniproje/.git')).toBe(true);
  });

  it('discovers repository root from nested subdirectories', async () => {
    const { run } = createTestShell();
    await run('mkdir -p /home/kullanici/proje/src/lib/utils');
    await run('cd /home/kullanici/proje');
    await run('git init');
    await run('cd /home/kullanici/proje/src/lib/utils');

    const r = await run('git status');
    expect(r.exitCode).toBe(0);
    expect(r.out).toContain('On branch main');
    expect(r.out).toContain('No commits yet');
  });

  it('reports untracked files in git status', async () => {
    const { run } = createTestShell();
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');
    await run('touch readme.txt');
    await run('echo "kod" > app.js');

    const r = await run('git status');
    expect(r.out).toContain('On branch main');
    expect(r.out).toContain('No commits yet');
    expect(r.out).toContain('Untracked files:');
    expect(r.out).toContain('readme.txt');
    expect(r.out).toContain('app.js');
  });

  it('stages files with git add and shows them in git status', async () => {
    const { run } = createTestShell();
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');
    await run('touch dosya1.txt dosya2.txt');

    // Stage one file
    await run('git add dosya1.txt');
    let st = await run('git status');
    expect(st.out).toContain('Changes to be committed:');
    expect(st.out).toContain('new file:   dosya1.txt');
    expect(st.out).toContain('Untracked files:');
    expect(st.out).toContain('dosya2.txt');

    // Stage all with '.'
    await run('git add .');
    st = await run('git status');
    expect(st.out).toContain('new file:   dosya1.txt');
    expect(st.out).toContain('new file:   dosya2.txt');
    expect(st.out).not.toContain('Untracked files:');
  });

  it('fails git add on non-existent file', async () => {
    const { run } = createTestShell();
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');

    const r = await run('git add yok.txt');
    expect(r.err).toContain("fatal: pathspec 'yok.txt' did not match any files");
    expect(r.exitCode).toBe(1);
  });

  it('validates git commit requirements (-m and staged changes)', async () => {
    const { run } = createTestShell();
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');

    // Missing -m
    const r1 = await run('git commit');
    expect(r1.err).toContain("error: switch 'm' requires a value");
    expect(r1.exitCode).toBe(1);

    // Empty message
    const r2 = await run('git commit -m ""');
    expect(r2.err).toContain('Aborting commit due to empty commit message');
    expect(r2.exitCode).toBe(1);

    // No changes staged (working tree clean)
    const r3 = await run('git commit -m "ilk commit"');
    expect(r3.out).toContain('nothing to commit (create/copy files and use "git add" to track)');
    expect(r3.exitCode).toBe(1);

    // Untracked file exists, but not staged
    await run('touch test.txt');
    const r4 = await run('git commit -m "ilk commit"');
    expect(r4.out).toContain('no changes added to commit (use "git add" to track)');
    expect(r4.exitCode).toBe(1);
  });

  it('executes full workflow: init -> add -> commit -> log', async () => {
    const { run, fs } = createTestShell();
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');
    await run('echo "hello git" > hello.txt');
    await run('git add hello.txt');

    // First commit (root-commit)
    const c1 = await run('git commit -m "İlk commit"');
    expect(c1.exitCode).toBe(0);
    expect(c1.out).toContain('[main (root-commit)');
    expect(c1.out).toContain('İlk commit');
    expect(c1.out).toContain('1 file changed');

    // Working tree is now clean
    const st1 = await run('git status');
    expect(st1.out).toContain('nothing to commit, working tree clean');

    // Verify .git/refs/heads/main
    const headHash = fs.readFile('/home/kullanici/repo/.git/refs/heads/main').trim();
    expect(headHash.length).toBe(40);

    // Second commit
    await run('echo "satir 2" >> hello.txt');
    await run('touch extra.txt');
    await run('git add .');
    const c2 = await run('git commit -m "İkinci commit: guncelleme"');
    expect(c2.exitCode).toBe(0);
    expect(c2.out).toContain('[main ');
    expect(c2.out).not.toContain('root-commit');
    expect(c2.out).toContain('İkinci commit: guncelleme');
    expect(c2.out).toContain('2 files changed');

    // git log
    const logFull = await run('git log');
    expect(logFull.exitCode).toBe(0);
    expect(logFull.out).toContain('İkinci commit: guncelleme');
    expect(logFull.out).toContain('İlk commit');
    expect(logFull.out).toContain('Author: kullanici <kullanici@klu>');

    // git log --oneline
    const logOne = await run('git log --oneline');
    expect(logOne.exitCode).toBe(0);
    const lines = logOne.out.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('(HEAD -> main) İkinci commit: guncelleme');
    expect(lines[1]).toContain('İlk commit');
  });

  it('handles git log error when repo has no commits', async () => {
    const { run } = createTestShell();
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');

    const r = await run('git log');
    expect(r.err).toContain("fatal: your current branch 'main' does not have any commits yet");
    expect(r.exitCode).toBe(128);
  });

  it('tracks file modifications and staged deletions properly', async () => {
    const { run } = createTestShell();
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');
    await run('echo "v1" > f1.txt');
    await run('echo "v1" > f2.txt');
    await run('git add -A');
    await run('git commit -m "c1"');

    // Modify f1.txt
    await run('echo "v2" > f1.txt');
    let st = await run('git status');
    expect(st.out).toContain('Changes not staged for commit:');
    expect(st.out).toContain('modified:   f1.txt');

    // Delete f2.txt
    await run('rm f2.txt');
    st = await run('git status');
    expect(st.out).toContain('modified:   f1.txt');
    expect(st.out).toContain('deleted:    f2.txt');

    // Stage changes using -A
    await run('git add -A');
    st = await run('git status');
    expect(st.out).toContain('Changes to be committed:');
    expect(st.out).toContain('modified:   f1.txt');
    expect(st.out).toContain('deleted:    f2.txt');

    // Commit changes
    const rCommit = await run('git commit -m "c2: update f1 and delete f2"');
    expect(rCommit.exitCode).toBe(0);

    const stFinal = await run('git status');
    expect(stFinal.out).toContain('nothing to commit, working tree clean');
  });

  it('displays git help and handles invalid subcommands', async () => {
    const { run } = createTestShell();

    // git without args
    const rNone = await run('git');
    expect(rNone.err).toContain('kullanım: git <komut> [<seçenekler>]');
    expect(rNone.exitCode).toBe(1);

    // git --help (handled by Shell framework)
    const rHelp = await run('git --help');
    expect(rHelp.out).toContain('Kullanım: git <alt-komut> [seçenekler]');
    expect(rHelp.out).toContain('Sanal sürüm kontrol sistemi');
    expect(rHelp.exitCode).toBe(0);

    // git -h
    const rDashH = await run('git -h');
    expect(rDashH.out).toContain('kullanım: git <komut> [<seçenekler>]');
    expect(rDashH.out).toContain('KLU Sanal Git (Git 1) komutları:');
    expect(rDashH.exitCode).toBe(0);

    // git unknown
    await run('mkdir /home/kullanici/repo');
    await run('cd /home/kullanici/repo');
    await run('git init');
    const rUnknown = await run('git bilinmeyen');
    expect(rUnknown.err).toContain("git: 'bilinmeyen' is not a git command. See 'git --help'.");
    expect(rUnknown.exitCode).toBe(1);
  });

  it('integrates with shell help and man commands', async () => {
    const { run } = createTestShell();

    // help command lists git
    const rHelp = await run('help');
    expect(rHelp.out).toContain('git');

    // man git shows detailed manual
    const rMan = await run('man git');
    expect(rMan.out).toContain('git - sanal sürüm kontrol sistemi');
    expect(rMan.out).toContain('ALT KOMUTLAR (Git 1)');
    expect(rMan.exitCode).toBe(0);
  });
});

/** Create /home/kullanici/repo, cd into it and `git init`. */
async function setupRepo() {
  const shell = createTestShell();
  await shell.run('mkdir /home/kullanici/repo');
  await shell.run('cd /home/kullanici/repo');
  await shell.run('git init');
  return shell;
}

const REPO = '/home/kullanici/repo';

describe('GitIgnore matcher', () => {
  it('matches globs, directories, anchored paths and negations', () => {
    const ig = new GitIgnore(
      ['# yorum', '', '*.log', 'node_modules/', '/kok.txt', 'docs/*.md', '!onemli.log'].join('\n'),
    );
    expect(ig.isIgnored('hata.log')).toBe(true);
    expect(ig.isIgnored('alt/klasor/debug.log')).toBe(true);
    expect(ig.isIgnored('onemli.log')).toBe(false);
    expect(ig.isIgnored('node_modules/lib/index.js')).toBe(true);
    expect(ig.isIgnored('src/node_modules/x.js')).toBe(true);
    expect(ig.isIgnored('node_modules')).toBe(false); // dir-only rule, plain file
    expect(ig.isIgnored('kok.txt')).toBe(true);
    expect(ig.isIgnored('alt/kok.txt')).toBe(false);
    expect(ig.isIgnored('docs/okubeni.md')).toBe(true);
    expect(ig.isIgnored('docs/alt/okubeni.md')).toBe(false);
    expect(ig.isIgnored('app.js')).toBe(false);
  });
});

describe('virtual git engine (phase 2: .gitignore, diff, restore)', () => {
  it('excludes .gitignore matches from status and git add .', async () => {
    const { run } = await setupRepo();
    await run('echo "*.log" > .gitignore');
    await run('echo "node_modules/" >> .gitignore');
    await run('echo "gizli.txt" >> .gitignore');
    await run('echo "kod" > app.js');
    await run('echo "hata" > hata.log');
    await run('echo "sifre" > gizli.txt');
    await run('mkdir -p node_modules/lib src');
    await run('echo "x" > node_modules/lib/index.js');
    await run('echo "y" > src/debug.log');

    const st = await run('git status');
    expect(st.out).toContain('.gitignore');
    expect(st.out).toContain('app.js');
    expect(st.out).not.toContain('hata.log');
    expect(st.out).not.toContain('gizli.txt');
    expect(st.out).not.toContain('node_modules');
    expect(st.out).not.toContain('debug.log');

    await run('git add .');
    const st2 = await run('git status');
    expect(st2.out).toContain('new file:   .gitignore');
    expect(st2.out).toContain('new file:   app.js');
    expect(st2.out).not.toContain('hata.log');
    expect(st2.out).not.toContain('node_modules');
    expect(st2.out).not.toContain('Untracked files:');

    // Explicitly adding an ignored file fails without -f
    const rIgn = await run('git add gizli.txt');
    expect(rIgn.exitCode).toBe(1);
    expect(rIgn.err).toContain('ignored by one of your .gitignore files');

    const rForce = await run('git add -f gizli.txt');
    expect(rForce.exitCode).toBe(0);
    const st3 = await run('git status');
    expect(st3.out).toContain('new file:   gizli.txt');
  });

  it('shows working tree changes with git diff (colored -/+ lines)', async () => {
    const { run } = await setupRepo();
    await run('echo "a" > f.txt');
    await run('echo "b" >> f.txt');
    await run('echo "c" >> f.txt');
    await run('git add .');
    await run('git commit -m "c1"');

    const clean = await run('git diff');
    expect(clean.out).toBe('');

    await run('echo "a" > f.txt');
    await run('echo "B" >> f.txt');
    await run('echo "c" >> f.txt');
    await run('echo "d" >> f.txt');

    const r = await run('git diff');
    expect(r.exitCode).toBe(0);
    expect(r.out).toContain('diff --git a/f.txt b/f.txt');
    expect(r.out).toContain('--- a/f.txt');
    expect(r.out).toContain('+++ b/f.txt');
    expect(r.out).toContain('@@ -1,3 +1,4 @@');
    const lines = r.out.split('\n');
    expect(lines).toContain(' a');
    expect(lines).toContain('-b');
    expect(lines).toContain('+B');
    expect(lines).toContain(' c');
    expect(lines).toContain('+d');
    // ANSI colors: removals red, additions green
    expect(r.stdout).toContain('\x1b[31m-b');
    expect(r.stdout).toContain('\x1b[32m+B');

    // Nothing staged yet
    expect((await run('git diff --staged')).out).toBe('');
  });

  it('shows staged changes with git diff --staged / --cached', async () => {
    const { run } = await setupRepo();
    await run('echo "v1" > f.txt');
    await run('git add .');
    await run('git commit -m "c1"');

    await run('echo "v2" > f.txt');
    await run('echo "yeni" > yeni.txt');
    await run('git add .');

    // Working tree now equals index
    expect((await run('git diff')).out).toBe('');

    const staged = await run('git diff --staged');
    expect(staged.out).toContain('diff --git a/f.txt b/f.txt');
    expect(staged.out.split('\n')).toContain('-v1');
    expect(staged.out.split('\n')).toContain('+v2');
    expect(staged.out).toContain('diff --git a/yeni.txt b/yeni.txt');
    expect(staged.out).toContain('--- /dev/null');
    expect(staged.out).toContain('+++ b/yeni.txt');

    const cached = await run('git diff --cached');
    expect(cached.out).toBe(staged.out);

    // Path filter
    const onlyF = await run('git diff --staged f.txt');
    expect(onlyF.out).toContain('a/f.txt');
    expect(onlyF.out).not.toContain('yeni.txt');
  });

  it('discards working tree changes with git restore', async () => {
    const { run, fs } = await setupRepo();
    await run('echo "orijinal" > f.txt');
    await run('git add .');
    await run('git commit -m "c1"');

    await run('echo "bozuk" > f.txt');
    let st = await run('git status');
    expect(st.out).toContain('modified:   f.txt');

    const r = await run('git restore f.txt');
    expect(r.exitCode).toBe(0);
    expect(fs.readFile(`${REPO}/f.txt`)).toBe('orijinal\n');
    st = await run('git status');
    expect(st.out).toContain('nothing to commit, working tree clean');

    // Restores deleted files too
    await run('rm f.txt');
    await run('git restore f.txt');
    expect(fs.readFile(`${REPO}/f.txt`)).toBe('orijinal\n');

    // Unknown path
    const bad = await run('git restore yok.txt');
    expect(bad.exitCode).toBe(1);
    expect(bad.err).toContain("error: pathspec 'yok.txt' did not match any file(s) known to git");

    const none = await run('git restore');
    expect(none.err).toContain('fatal: you must specify path(s) to restore');
  });

  it('unstages files with git restore --staged without touching content', async () => {
    const { run, fs } = await setupRepo();
    await run('echo "v1" > f.txt');
    await run('git add .');
    await run('git commit -m "c1"');

    await run('echo "v2" > f.txt');
    await run('echo "n" > yeni.txt');
    await run('git add .');

    const r = await run('git restore --staged f.txt yeni.txt');
    expect(r.exitCode).toBe(0);
    expect(fs.readFile(`${REPO}/f.txt`)).toBe('v2\n');
    expect(fs.readFile(`${REPO}/yeni.txt`)).toBe('n\n');

    const st = await run('git status');
    expect(st.out).not.toContain('Changes to be committed:');
    expect(st.out).toContain('Changes not staged for commit:');
    expect(st.out).toContain('modified:   f.txt');
    expect(st.out).toContain('Untracked files:');
    expect(st.out).toContain('yeni.txt');
  });
});

describe('virtual git engine (phase 3: branch, switch, merge)', () => {
  async function repoWithCommit() {
    const shell = await setupRepo();
    await shell.run('echo "temel" > ortak.txt');
    await shell.run('git add .');
    await shell.run('git commit -m "ilk"');
    return shell;
  }

  it('lists, creates and validates branches', async () => {
    const { run, fs } = await setupRepo();

    // Unborn branch: cannot create branches yet
    const early = await run('git branch ozellik');
    expect(early.err).toContain("fatal: not a valid object name: 'main'");
    expect((await run('git branch')).out).toBe('');

    await run('echo "x" > a.txt');
    await run('git add .');
    await run('git commit -m "ilk"');

    expect((await run('git branch ozellik')).exitCode).toBe(0);
    expect((await run('git branch özellik/yeni')).exitCode).toBe(0);
    const list = await run('git branch');
    expect(list.out.split('\n')).toEqual(['* main', '  ozellik', '  özellik/yeni', '']);
    expect(list.stdout).toContain('* \x1b[32mmain');
    expect(fs.readFile(`${REPO}/.git/refs/heads/ozellik`)).toBe(
      fs.readFile(`${REPO}/.git/refs/heads/main`),
    );

    const dup = await run('git branch ozellik');
    expect(dup.err).toContain("fatal: a branch named 'ozellik' already exists");

    for (const bad of ['kotu..ad', 'bosluk"', 'son/', '.gizli', 'a@{b']) {
      const r = await run(`git branch '${bad}'`);
      expect(r.err).toContain('is not a valid branch name');
      expect(r.exitCode).toBe(128);
    }
  });

  it('deletes branches with -d / -D and protects current & unmerged branches', async () => {
    const { run } = await repoWithCommit();
    await run('git branch birlesik');
    await run('git switch -c deneme');
    await run('echo "d" > deneme.txt');
    await run('git add .');
    await run('git commit -m "deneme"');
    await run('git switch main');

    const cur = await run('git branch -d main');
    expect(cur.err).toContain("Cannot delete branch 'main'");
    expect(cur.exitCode).toBe(1);

    const unmerged = await run('git branch -d deneme');
    expect(unmerged.err).toContain("error: the branch 'deneme' is not fully merged");
    expect(unmerged.err).toContain('git branch -D deneme');

    const merged = await run('git branch -d birlesik');
    expect(merged.exitCode).toBe(0);
    expect(merged.out).toMatch(/Deleted branch birlesik \(was [0-9a-f]{7}\)\./);

    const forced = await run('git branch -D deneme');
    expect(forced.exitCode).toBe(0);
    expect((await run('git branch')).out).toBe('* main\n');

    const missing = await run('git branch -d yok');
    expect(missing.err).toContain("error: branch 'yok' not found.");
  });

  it('switches branches and updates the working tree', async () => {
    const { run, fs } = await repoWithCommit();

    const r1 = await run('git switch -c ozellik');
    expect(r1.out).toContain("Switched to a new branch 'ozellik'");
    expect((await run('git status')).out).toContain('On branch ozellik');

    await run('echo "yeni ozellik" > ozellik.txt');
    await run('echo "degisti" > ortak.txt');
    await run('git add .');
    await run('git commit -m "ozellik eklendi"');

    const r2 = await run('git switch main');
    expect(r2.out).toContain("Switched to branch 'main'");
    expect(fs.exists(`${REPO}/ozellik.txt`)).toBe(false);
    expect(fs.readFile(`${REPO}/ortak.txt`)).toBe('temel\n');
    expect((await run('git status')).out).toContain('nothing to commit, working tree clean');

    await run('git switch ozellik');
    expect(fs.readFile(`${REPO}/ozellik.txt`)).toBe('yeni ozellik\n');
    expect(fs.readFile(`${REPO}/ortak.txt`)).toBe('degisti\n');

    expect((await run('git switch ozellik')).out).toContain("Already on 'ozellik'");

    const bad = await run('git switch yok');
    expect(bad.err).toContain('fatal: invalid reference: yok');

    const dupe = await run('git switch -c main');
    expect(dupe.err).toContain("fatal: a branch named 'main' already exists");
  });

  it('refuses to switch when local changes would be overwritten', async () => {
    const { run, fs } = await repoWithCommit();
    await run('git switch -c ozellik');
    await run('echo "ozellik surumu" > ortak.txt');
    await run('git add .');
    await run('git commit -m "ozellik"');
    await run('git switch main');

    // Uncommitted change to a file that differs between branches
    await run('echo "kaydedilmemis" > ortak.txt');
    const r = await run('git switch ozellik');
    expect(r.exitCode).toBe(1);
    expect(r.err).toContain(
      'error: Your local changes to the following files would be overwritten by checkout:',
    );
    expect(r.err).toContain('ortak.txt');
    expect(r.err).toContain('Aborting');
    expect(fs.readFile(`${REPO}/ortak.txt`)).toBe('kaydedilmemis\n');
    expect((await run('git status')).out).toContain('On branch main');

    // Changes to files that are identical on both branches are carried over
    await run('git restore ortak.txt');
    await run('echo "tasinabilir" > not.txt');
    const ok = await run('git switch ozellik');
    expect(ok.exitCode).toBe(0);
    expect(fs.readFile(`${REPO}/not.txt`)).toBe('tasinabilir\n');
  });

  it('fast-forwards when the current branch is behind', async () => {
    const { run, fs } = await repoWithCommit();
    await run('git switch -c ozellik');
    await run('echo "ff" > ff.txt');
    await run('git add .');
    await run('git commit -m "ff commit"');
    await run('git switch main');

    const r = await run('git merge ozellik');
    expect(r.exitCode).toBe(0);
    expect(r.out).toMatch(/Updating [0-9a-f]{7}\.\.[0-9a-f]{7}/);
    expect(r.out).toContain('Fast-forward');
    expect(r.out).toContain('1 file changed');
    expect(fs.readFile(`${REPO}/ff.txt`)).toBe('ff\n');
    expect(fs.readFile(`${REPO}/.git/refs/heads/main`)).toBe(
      fs.readFile(`${REPO}/.git/refs/heads/ozellik`),
    );

    const again = await run('git merge ozellik');
    expect(again.out).toContain('Already up to date.');

    const log = await run('git log --oneline');
    expect(log.out.split('\n')[0]).toContain('(HEAD -> main, ozellik) ff commit');
  });

  it('creates a merge commit when branches changed different files', async () => {
    const { run, fs } = await repoWithCommit();
    await run('git switch -c ozellik');
    await run('echo "ozellik" > ozellik.txt');
    await run('git add .');
    await run('git commit -m "ozellik dosyasi"');

    await run('git switch main');
    await run('echo "ana" > ana.txt');
    await run('git add .');
    await run('git commit -m "ana dosyasi"');

    const r = await run('git merge ozellik');
    expect(r.exitCode).toBe(0);
    expect(r.out).toContain("Merge made by the 'ort' strategy.");
    expect(fs.readFile(`${REPO}/ozellik.txt`)).toBe('ozellik\n');
    expect(fs.readFile(`${REPO}/ana.txt`)).toBe('ana\n');
    expect((await run('git status')).out).toContain('nothing to commit, working tree clean');

    const log = await run('git log');
    expect(log.out).toContain("Merge branch 'ozellik'");
    expect(log.out).toMatch(/Merge: [0-9a-f]{7} [0-9a-f]{7}/);

    const oneline = (await run('git log --oneline')).out.trim().split('\n');
    expect(oneline).toHaveLength(4);
    expect(oneline[0]).toContain("Merge branch 'ozellik'");

    // The merged branch is now fully merged and deletable with -d
    expect((await run('git branch -d ozellik')).exitCode).toBe(0);
  });

  it('reports conflicts, blocks commit until resolved, then concludes the merge', async () => {
    const { run, fs } = await repoWithCommit();
    await run('git switch -c ozellik');
    await run('echo "ozellik satiri" > ortak.txt');
    await run('git add .');
    await run('git commit -m "ozellik degisikligi"');

    await run('git switch main');
    await run('echo "ana satiri" > ortak.txt');
    await run('git add .');
    await run('git commit -m "ana degisikligi"');

    const r = await run('git merge ozellik');
    expect(r.exitCode).toBe(1);
    expect(r.out).toContain('Auto-merging ortak.txt');
    expect(r.out).toContain('CONFLICT (content): Merge conflict in ortak.txt');
    expect(r.out).toContain('Automatic merge failed; fix conflicts and then commit the result.');
    expect(fs.readFile(`${REPO}/ortak.txt`)).toBe(
      '<<<<<<< HEAD\nana satiri\n=======\nozellik satiri\n>>>>>>> ozellik\n',
    );

    const st = await run('git status');
    expect(st.out).toContain('You have unmerged paths.');
    expect(st.out).toContain('Unmerged paths:');
    expect(st.out).toContain('both modified:  ortak.txt');

    const blocked = await run('git commit -m "erken"');
    expect(blocked.exitCode).toBe(128);
    expect(blocked.err).toContain('Committing is not possible because you have unmerged files');

    const noSwitch = await run('git switch ozellik');
    expect(noSwitch.err).toContain('you need to resolve your current index first');

    const noMerge = await run('git merge ozellik');
    expect(noMerge.err).toContain('You have not concluded your merge');

    // Resolve the conflict
    await run('echo "birlesik satir" > ortak.txt');
    await run('git add ortak.txt');
    const st2 = await run('git status');
    expect(st2.out).toContain('All conflicts fixed but you are still merging.');

    const done = await run('git commit');
    expect(done.exitCode).toBe(0);
    expect(done.out).toContain("Merge branch 'ozellik'");
    expect((await run('git status')).out).toContain('nothing to commit, working tree clean');
    expect((await run('git log')).out).toMatch(/Merge: [0-9a-f]{7} [0-9a-f]{7}/);
  });

  it('aborts a conflicted merge with git merge --abort', async () => {
    const { run, fs } = await repoWithCommit();
    await run('git switch -c ozellik');
    await run('echo "o" > ortak.txt');
    await run('echo "ek" > ek.txt');
    await run('git add .');
    await run('git commit -m "o"');
    await run('git switch main');
    await run('echo "m" > ortak.txt');
    await run('git add .');
    await run('git commit -m "m"');

    await run('git merge ozellik');
    expect(fs.exists(`${REPO}/ek.txt`)).toBe(true);

    const r = await run('git merge --abort');
    expect(r.exitCode).toBe(0);
    expect(fs.readFile(`${REPO}/ortak.txt`)).toBe('m\n');
    expect(fs.exists(`${REPO}/ek.txt`)).toBe(false);
    expect((await run('git status')).out).toContain('nothing to commit, working tree clean');

    const again = await run('git merge --abort');
    expect(again.err).toContain('There is no merge to abort');
  });

  it('refuses to merge with local changes or unknown branches', async () => {
    const { run } = await repoWithCommit();
    await run('git branch ozellik');
    await run('git switch ozellik');
    await run('echo "z" > z.txt');
    await run('git add .');
    await run('git commit -m "z"');
    await run('git switch main');

    await run('echo "kirli" > ortak.txt');
    const dirty = await run('git merge ozellik');
    expect(dirty.exitCode).toBe(1);
    expect(dirty.err).toContain('would be overwritten by merge');

    const unknown = await run('git merge yok');
    expect(unknown.err).toContain('merge: yok - not something we can merge');
  });

  it('documents phase 2 and 3 commands in help and man', async () => {
    const { run } = createTestShell();
    const h = await run('git -h');
    for (const cmd of ['diff', 'restore', 'branch', 'switch', 'merge']) {
      expect(h.out).toContain(cmd);
    }
    const man = await run('man git');
    expect(man.out).toContain('ALT KOMUTLAR (Git 2)');
    expect(man.out).toContain('ALT KOMUTLAR (Git 3)');
  });
});
