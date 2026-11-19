import { describe, expect, it } from 'vitest';
import { createTestShell } from '../test/helpers';

describe('shell basics', () => {
  it('reports unknown commands', async () => {
    const { run } = createTestShell();
    const r = await run('foo');
    expect(r.err).toBe('bash: foo: command not found\n');
    expect(r.exitCode).toBe(127);
  });

  it('reports syntax errors', async () => {
    const { run } = createTestShell();
    const r = await run('| ls');
    expect(r.err).toContain("syntax error near unexpected token `|'");
    expect(r.exitCode).toBe(2);
  });

  it('records history without consecutive duplicates', async () => {
    const { run, shell } = createTestShell();
    await run('pwd');
    await run('pwd');
    await run('ls');
    await run('   ');
    expect(shell.history).toEqual(['pwd', 'ls']);
  });

  it('supports && , || and ;', async () => {
    const { run } = createTestShell();
    expect((await run('echo a && echo b')).out).toBe('a\nb\n');
    expect((await run('cat yok && echo b')).out).toBe('');
    expect((await run('cat yok || echo b')).out).toBe('b\n');
    expect((await run('echo a; echo b')).out).toBe('a\nb\n');
  });

  it('supports redirection and pipes', async () => {
    const { run, fs } = createTestShell();
    await run('echo bir > /tmp/f.txt');
    await run('echo iki >> /tmp/f.txt');
    expect(fs.readFile('/tmp/f.txt')).toBe('bir\niki\n');
    expect((await run('cat < /tmp/f.txt')).out).toBe('bir\niki\n');
    expect((await run('cat /tmp/f.txt | cat -n')).out).toBe('     1\tbir\n     2\tiki\n');
    expect((await run('echo x > /etc')).err).toBe('bash: /etc: Is a directory\n');
  });

  it('expands globs', async () => {
    // Use an isolated directory so files from the default tree (e.g. ~/merhaba.txt) don't interfere.
    const { run } = createTestShell({
      files: { '/tmp/glob/a.txt': '', '/tmp/glob/b.txt': '', '/tmp/glob/c.md': '', '/tmp/glob/alt/d.txt': '' },
    });
    await run('cd /tmp/glob');
    expect((await run('echo *.txt')).out).toBe('a.txt b.txt\n');
    expect((await run('echo alt/*')).out).toBe('alt/d.txt\n');
    expect((await run('echo *.yok')).out).toBe('*.yok\n');
  });

  it('supports variables and $?', async () => {
    const { run } = createTestShell();
    await run('AD=Ada');
    expect((await run('echo "Merhaba $AD"')).out).toBe('Merhaba Ada\n');
    await run('cat yok');
    expect((await run('echo $?')).out).toBe('1\n');
  });

  it('prints --help for any command', async () => {
    const { run } = createTestShell();
    expect((await run('ls --help')).out).toContain('Kullanım: ls');
  });

  it('notifies listeners with a command record', async () => {
    const { run, shell } = createTestShell();
    const records: string[][][] = [];
    shell.onExecute((r) => records.push(r.commands));
    await run('echo a | cat');
    expect(records).toEqual([[['echo', 'a'], ['cat']]]);
  });
});

describe('pwd / cd', () => {
  it('pwd prints the cwd', async () => {
    const { run } = createTestShell();
    expect((await run('pwd')).out).toBe('/home/kullanici\n');
  });

  it('cd navigates with relative, absolute and special paths', async () => {
    const { run, shell } = createTestShell();
    await run('cd Belgeler');
    expect(shell.cwd).toBe('/home/kullanici/Belgeler');
    await run('cd ..');
    expect(shell.cwd).toBe('/home/kullanici');
    await run('cd /etc');
    expect(shell.cwd).toBe('/etc');
    expect((await run('cd -')).out).toBe('/home/kullanici\n');
    await run('cd /');
    await run('cd');
    expect(shell.cwd).toBe('/home/kullanici');
    await run('cd ~/Resimler');
    expect(shell.cwd).toBe('/home/kullanici/Resimler');
  });

  it('cd reports errors', async () => {
    const { run, shell } = createTestShell();
    expect((await run('cd yok')).err).toBe('bash: cd: yok: No such file or directory\n');
    expect((await run('cd merhaba.txt')).err).toBe('bash: cd: merhaba.txt: Not a directory\n');
    expect((await run('cd a b')).err).toBe('bash: cd: too many arguments\n');
    expect((await run('cd -')).err).toBe('bash: cd: OLDPWD not set\n');
    expect(shell.cwd).toBe('/home/kullanici');
  });
});

describe('ls', () => {
  it('lists the cwd, hiding dotfiles', async () => {
    const { run } = createTestShell();
    const r = await run('ls');
    expect(r.out).toBe('Belgeler  Indirilenler  merhaba.txt  Muzik  Resimler\n');
    expect(r.stdout).toContain('\x1b[1;34mBelgeler\x1b[0m');
  });

  it('-a shows hidden files plus . and ..', async () => {
    const { run } = createTestShell();
    const out = (await run('ls -a')).out;
    expect(out.startsWith('.  ..  ')).toBe(true);
    expect(out).toContain('.bashrc');
    expect(out).toContain('.gizli_not');
  });

  it('-l prints long format', async () => {
    const { run } = createTestShell();
    const out = (await run('ls -l Belgeler')).out;
    expect(out).toMatch(/^total \d+\n/);
    expect(out).toContain('-rw-r--r-- 1 kullanici kullanici');
    expect(out).toMatch(/Nov 19 10:30 rapor\.txt/);
  });

  it('-l shows dirs and owners', async () => {
    const { run } = createTestShell();
    const out = (await run('ls -l /')).out;
    expect(out).toMatch(/drwxr-xr-x +\d+ root +root +4096 Nov 19 10:30 etc/);
  });

  it('lists files and multiple directories', async () => {
    const { run } = createTestShell();
    expect((await run('ls merhaba.txt')).out).toBe('merhaba.txt\n');
    const out = (await run('ls Muzik Resimler')).out;
    expect(out).toBe('Muzik:\nsarki.mp3\n\nResimler:\ntatil.jpg\n');
  });

  it('prints one entry per line when piped', async () => {
    const { run } = createTestShell();
    expect((await run('ls Belgeler | cat')).out).toBe('alisveris.txt\nrapor.txt\n');
  });

  it('reports missing paths and bad options', async () => {
    const { run } = createTestShell();
    const r = await run('ls yok');
    expect(r.err).toBe("ls: cannot access 'yok': No such file or directory\n");
    expect(r.exitCode).toBe(2);
    expect((await run('ls -z')).err).toBe("ls: invalid option -- 'z'\nTry 'ls --help' for more information.\n");
  });
});

describe('mkdir / touch', () => {
  it('creates directories', async () => {
    const { run, fs } = createTestShell();
    await run('mkdir a b');
    expect(fs.isDir('/home/kullanici/a') && fs.isDir('/home/kullanici/b')).toBe(true);
    await run('mkdir -p x/y/z');
    expect(fs.isDir('/home/kullanici/x/y/z')).toBe(true);
  });

  it('reports mkdir errors', async () => {
    const { run } = createTestShell();
    expect((await run('mkdir Belgeler')).err).toBe("mkdir: cannot create directory 'Belgeler': File exists\n");
    expect((await run('mkdir q/w')).err).toBe("mkdir: cannot create directory 'q/w': No such file or directory\n");
    expect((await run('mkdir')).err).toBe("mkdir: missing operand\nTry 'mkdir --help' for more information.\n");
    expect((await run('mkdir -p merhaba.txt')).err).toBe(
      "mkdir: cannot create directory 'merhaba.txt': File exists\n",
    );
  });

  it('touch creates files and keeps content', async () => {
    const { run, fs } = createTestShell();
    await run('touch yeni.txt merhaba.txt');
    expect(fs.readFile('/home/kullanici/yeni.txt')).toBe('');
    expect(fs.readFile('/home/kullanici/merhaba.txt')).toContain('Merhaba');
    expect((await run('touch yok/a')).err).toBe("touch: cannot touch 'yok/a': No such file or directory\n");
    expect((await run('touch')).err).toContain('touch: missing file operand');
  });
});

describe('cat / echo', () => {
  it('cat prints and concatenates', async () => {
    const { run } = createTestShell({ files: { '~/a': 'A\n', '~/b': 'B\n' } });
    expect((await run('cat a b')).out).toBe('A\nB\n');
    expect((await run('cat -n a')).out).toBe('     1\tA\n');
  });

  it('cat reports errors but prints what it can', async () => {
    const { run } = createTestShell({ files: { '~/a': 'A\n' } });
    const r = await run('cat yok a Belgeler');
    expect(r.out).toBe('A\n');
    expect(r.err).toBe('cat: yok: No such file or directory\ncat: Belgeler: Is a directory\n');
    expect(r.exitCode).toBe(1);
  });

  it('echo prints text', async () => {
    const { run } = createTestShell();
    expect((await run('echo Merhaba   Dünya')).out).toBe('Merhaba Dünya\n');
    expect((await run('echo -n a')).out).toBe('a');
    expect((await run('echo -e "a\\tb"')).out).toBe('a\tb\n');
    expect((await run('echo')).out).toBe('\n');
  });
});

describe('cp', () => {
  it('copies files and into directories', async () => {
    const { run, fs } = createTestShell();
    await run('cp merhaba.txt kopya.txt');
    expect(fs.readFile('/home/kullanici/kopya.txt')).toBe(fs.readFile('/home/kullanici/merhaba.txt'));
    await run('cp merhaba.txt kopya.txt Belgeler');
    expect(fs.isFile('/home/kullanici/Belgeler/merhaba.txt')).toBe(true);
    expect(fs.isFile('/home/kullanici/Belgeler/kopya.txt')).toBe(true);
  });

  it('copies directories with -r', async () => {
    const { run, fs } = createTestShell();
    expect((await run('cp Belgeler B')).err).toBe("cp: -r not specified; omitting directory 'Belgeler'\n");
    await run('cp -r Belgeler B');
    expect(fs.isFile('/home/kullanici/B/rapor.txt')).toBe(true);
    await run('cp -r Belgeler B');
    expect(fs.isFile('/home/kullanici/B/Belgeler/rapor.txt')).toBe(true);
  });

  it('reports cp errors', async () => {
    const { run } = createTestShell();
    expect((await run('cp')).err).toContain('cp: missing file operand');
    expect((await run('cp a')).err).toContain("cp: missing destination file operand after 'a'");
    expect((await run('cp yok x')).err).toBe("cp: cannot stat 'yok': No such file or directory\n");
    expect((await run('cp merhaba.txt merhaba.txt')).err).toBe(
      "cp: 'merhaba.txt' and 'merhaba.txt' are the same file\n",
    );
    expect((await run('cp -r Belgeler Belgeler/alt')).err).toBe(
      "cp: cannot copy a directory, 'Belgeler', into itself, 'Belgeler/alt'\n",
    );
    expect((await run('cp merhaba.txt .bashrc yok')).err).toBe("cp: target 'yok' is not a directory\n");
    expect((await run('cp merhaba.txt yok/a')).err).toBe(
      "cp: cannot create regular file 'yok/a': No such file or directory\n",
    );
  });
});

describe('mv', () => {
  it('renames and moves', async () => {
    const { run, fs } = createTestShell();
    await run('mv merhaba.txt selam.txt');
    expect(fs.exists('/home/kullanici/merhaba.txt')).toBe(false);
    expect(fs.isFile('/home/kullanici/selam.txt')).toBe(true);
    await run('mv selam.txt Belgeler/');
    expect(fs.isFile('/home/kullanici/Belgeler/selam.txt')).toBe(true);
    await run('mv Muzik Resimler');
    expect(fs.isDir('/home/kullanici/Resimler/Muzik')).toBe(true);
  });

  it('reports mv errors', async () => {
    const { run } = createTestShell();
    expect((await run('mv yok x')).err).toBe("mv: cannot stat 'yok': No such file or directory\n");
    expect((await run('mv Belgeler Belgeler/x')).err).toBe(
      "mv: cannot move 'Belgeler' to a subdirectory of itself, 'Belgeler/x'\n",
    );
    expect((await run('mv merhaba.txt yok/x')).err).toBe(
      "mv: cannot move 'merhaba.txt' to 'yok/x': No such file or directory\n",
    );
    expect((await run('mv x')).err).toContain("mv: missing destination file operand after 'x'");
  });
});

describe('rm', () => {
  it('removes files and directories', async () => {
    const { run, fs } = createTestShell();
    await run('rm merhaba.txt');
    expect(fs.exists('/home/kullanici/merhaba.txt')).toBe(false);
    expect((await run('rm Belgeler')).err).toBe("rm: cannot remove 'Belgeler': Is a directory\n");
    await run('rm -r Belgeler');
    expect(fs.exists('/home/kullanici/Belgeler')).toBe(false);
    await run('rm -d Indirilenler');
    expect(fs.exists('/home/kullanici/Indirilenler')).toBe(false);
  });

  it('handles -f and missing files', async () => {
    const { run } = createTestShell();
    expect((await run('rm yok')).err).toBe("rm: cannot remove 'yok': No such file or directory\n");
    const r = await run('rm -f yok');
    expect(r.err).toBe('');
    expect(r.exitCode).toBe(0);
    expect((await run('rm')).err).toContain('rm: missing operand');
  });

  it('refuses dangerous targets', async () => {
    const { run, fs } = createTestShell();
    expect((await run('rm -rf /')).err).toContain("rm: it is dangerous to operate recursively on '/'");
    expect((await run('rm -r ..')).err).toBe("rm: refusing to remove '.' or '..' directory: skipping '..'\n");
    expect(fs.isDir('/etc')).toBe(true);
  });
});

describe('clear / help / man / history', () => {
  it('clear emits ANSI clear sequence', async () => {
    const { shell } = createTestShell();
    expect((await shell.execute('clear')).stdout).toBe('\x1b[2J\x1b[3J\x1b[H');
  });

  it('help lists all commands', async () => {
    const { run } = createTestShell();
    const out = (await run('help')).out;
    for (const c of ['pwd', 'ls', 'cd', 'mkdir', 'touch', 'cat', 'echo', 'cp', 'mv', 'rm', 'clear', 'man']) {
      expect(out).toMatch(new RegExp(`^  ${c}\\s`, 'm'));
    }
  });

  it('man shows manual pages and errors', async () => {
    const { run } = createTestShell();
    expect((await run('man ls')).out).toContain('ls - dizin içeriğini listeler');
    expect((await run('man yok')).err).toBe('No manual entry for yok\n');
    expect((await run('man')).err).toContain('What manual page do you want?');
  });

  it('history lists previous commands', async () => {
    const { run } = createTestShell();
    await run('pwd');
    expect((await run('history')).out).toBe('    1  pwd\n    2  history\n');
  });
});
