import { describe, expect, it } from 'vitest';
import { createTestShell } from '../test/helpers';

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
