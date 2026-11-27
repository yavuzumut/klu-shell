import { describe, expect, it } from 'vitest';
import { quotePath } from '../shell/parser';
import { createTestShell } from '../test/helpers';

describe('shell basics', () => {
  it('reports unknown commands', async () => {
    const { run } = createTestShell();
    const r = await run('foo');
    expect(r.err).toBe('bash: foo: komut bulunamadı\n');
    expect(r.exitCode).toBe(127);
  });

  it('reports syntax errors', async () => {
    const { run } = createTestShell();
    const r = await run('| ls');
    expect(r.err).toContain("beklenmeyen belirteç yakınında sözdizimi hatası `|'");
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
    expect((await run('echo x > /etc')).err).toBe('bash: /etc: Bir dizin\n');
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
    expect((await run('cd yok')).err).toBe('bash: cd: yok: Böyle bir dosya veya dizin yok\n');
    expect((await run('cd merhaba.txt')).err).toBe('bash: cd: merhaba.txt: Dizin değil\n');
    expect((await run('cd a b')).err).toBe('bash: cd: çok fazla argüman\n');
    expect((await run('cd -')).err).toBe('bash: cd: OLDPWD ayarlanmamış\n');
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
    expect(out).toMatch(/Kas 19 10:30 rapor\.txt/);
  });

  it('-l shows dirs and owners', async () => {
    const { run } = createTestShell();
    const out = (await run('ls -l /')).out;
    expect(out).toMatch(/drwxr-xr-x +\d+ root +root +4096 Kas 19 10:30 etc/);
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
    expect(r.err).toBe("ls: erişilemiyor 'yok': Böyle bir dosya veya dizin yok\n");
    expect(r.exitCode).toBe(2);
    expect((await run('ls -z')).err).toBe("ls: geçersiz seçenek -- 'z'\nŞunu deneyin: 'ls --help' hakkında daha fazla bilgi için.\n");
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
    expect((await run('mkdir Belgeler')).err).toBe("mkdir: dizin oluşturulamıyor 'Belgeler': Dosya zaten var\n");
    expect((await run('mkdir q/w')).err).toBe("mkdir: dizin oluşturulamıyor 'q/w': Böyle bir dosya veya dizin yok\n");
    expect((await run('mkdir')).err).toBe("mkdir: argüman eksik\nŞunu deneyin: 'mkdir --help' hakkında daha fazla bilgi için.\n");
    expect((await run('mkdir -p merhaba.txt')).err).toBe(
      "mkdir: dizin oluşturulamıyor 'merhaba.txt': Dosya zaten var\n",
    );
  });

  it('touch creates files and keeps content', async () => {
    const { run, fs } = createTestShell();
    await run('touch yeni.txt merhaba.txt');
    expect(fs.readFile('/home/kullanici/yeni.txt')).toBe('');
    expect(fs.readFile('/home/kullanici/merhaba.txt')).toContain('Merhaba');
    expect((await run('touch yok/a')).err).toBe("touch: oluşturulamıyor 'yok/a': Böyle bir dosya veya dizin yok\n");
    expect((await run('touch')).err).toContain('touch: dosya argümanı eksik');
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
    expect(r.err).toBe('cat: yok: Böyle bir dosya veya dizin yok\ncat: Belgeler: Bir dizin\n');
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
    expect((await run('cp Belgeler B')).err).toBe("cp: -r belirtilmedi; dizin atlanıyor 'Belgeler'\n");
    await run('cp -r Belgeler B');
    expect(fs.isFile('/home/kullanici/B/rapor.txt')).toBe(true);
    await run('cp -r Belgeler B');
    expect(fs.isFile('/home/kullanici/B/Belgeler/rapor.txt')).toBe(true);
  });

  it('reports cp errors', async () => {
    const { run } = createTestShell();
    expect((await run('cp')).err).toContain('cp: dosya argümanı eksik');
    expect((await run('cp a')).err).toContain("cp: hedef dosya argümanı eksik: 'a'");
    expect((await run('cp yok x')).err).toBe("cp: durum bilgisi alınamıyor 'yok': Böyle bir dosya veya dizin yok\n");
    expect((await run('cp merhaba.txt merhaba.txt')).err).toBe(
      "cp: 'merhaba.txt' and 'merhaba.txt' aynı dosya\n",
    );
    expect((await run('cp -r Belgeler Belgeler/alt')).err).toBe(
      "cp: dizin kopyalanamıyor, 'Belgeler', into itself, 'Belgeler/alt'\n",
    );
    expect((await run('cp merhaba.txt .bashrc yok')).err).toBe("cp: target 'yok' dizin değil\n");
    expect((await run('cp merhaba.txt yok/a')).err).toBe(
      "cp: cannot create regular file 'yok/a': Böyle bir dosya veya dizin yok\n",
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
    expect((await run('mv yok x')).err).toBe("mv: durum bilgisi alınamıyor 'yok': Böyle bir dosya veya dizin yok\n");
    expect((await run('mv Belgeler Belgeler/x')).err).toBe(
      "mv: taşınamıyor 'Belgeler' to a subdirectory of itself, 'Belgeler/x'\n",
    );
    expect((await run('mv merhaba.txt yok/x')).err).toBe(
      "mv: taşınamıyor 'merhaba.txt' to 'yok/x': Böyle bir dosya veya dizin yok\n",
    );
    expect((await run('mv x')).err).toContain("mv: hedef dosya argümanı eksik: 'x'");
  });
});

describe('rm', () => {
  it('removes files and directories', async () => {
    const { run, fs } = createTestShell();
    await run('rm merhaba.txt');
    expect(fs.exists('/home/kullanici/merhaba.txt')).toBe(false);
    expect((await run('rm Belgeler')).err).toBe("rm: silinemiyor 'Belgeler': Bir dizin\n");
    await run('rm -r Belgeler');
    expect(fs.exists('/home/kullanici/Belgeler')).toBe(false);
    await run('rm -d Indirilenler');
    expect(fs.exists('/home/kullanici/Indirilenler')).toBe(false);
  });

  it('handles -f and missing files', async () => {
    const { run } = createTestShell();
    expect((await run('rm yok')).err).toBe("rm: silinemiyor 'yok': Böyle bir dosya veya dizin yok\n");
    const r = await run('rm -f yok');
    expect(r.err).toBe('');
    expect(r.exitCode).toBe(0);
    expect((await run('rm')).err).toContain('rm: argüman eksik');
  });

  it('refuses dangerous targets', async () => {
    const { run, fs } = createTestShell();
    expect((await run('rm -rf /')).err).toContain("rm: üzerinde yinelemeli işlem yapmak tehlikelidir: '/'");
    expect((await run('rm -r ..')).err).toBe("rm: '.' veya '..' dizini silinmiyor; atlanıyor: '..'\n");
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
    expect((await run('man yok')).err).toBe('Kılavuz girdisi yok: yok\n');
    expect((await run('man')).err).toContain('Hangi kılavuz sayfasını görmek istiyorsun?');
  });

  it('history lists previous commands', async () => {
    const { run } = createTestShell();
    await run('pwd');
    expect((await run('history')).out).toBe('    1  pwd\n    2  history\n');
  });

  it('touch, mkdir, cat and ls work with __proto__, constructor and toString', async () => {
    const { run } = createTestShell();
    await run('mkdir /tmp/special');
    await run('cd /tmp/special');

    // Create files with special names
    for (const name of ['__proto__', 'constructor', 'toString']) {
      await run(`touch ${name}`);
      await run(`echo "data_${name}" > ${name}`);
      const catRes = await run(`cat ${name}`);
      expect(catRes.out).toBe(`data_${name}\n`);
    }

    const lsRes = await run('ls');
    expect(lsRes.out).toContain('__proto__');
    expect(lsRes.out).toContain('constructor');
    expect(lsRes.out).toContain('toString');

    // Create directories with special names
    for (const name of ['dir___proto__', 'dir_constructor', 'dir_toString']) {
      await run(`mkdir ${name}`);
      await run(`touch ${name}/file.txt`);
      const dirLs = await run(`ls ${name}`);
      expect(dirLs.out).toContain('file.txt');
    }
  });

  it('correctly resolves commands for special file paths like "rapor;ls" and "a b"', async () => {
    const { run } = createTestShell();
    await run('mkdir /tmp/quoting');
    await run('cd /tmp/quoting');

    // Create files with special characters in names
    await run(`echo "content 1" > ${quotePath('rapor;ls')}`);
    await run(`echo "content 2" > ${quotePath('a b')}`);

    expect(quotePath('rapor;ls')).toBe("'rapor;ls'");
    expect(quotePath('a b')).toBe("'a b'");

    // Command produced by handleTreeSelectPath for clicking "rapor;ls"
    const cmd1 = `cat ${quotePath('rapor;ls')}`;
    const res1 = await run(cmd1);
    expect(res1.exitCode).toBe(0);
    expect(res1.out).toBe('content 1\n');
    expect(res1.err).toBe('');

    // Command produced by handleTreeSelectPath for clicking "a b"
    const cmd2 = `cat ${quotePath('a b')}`;
    const res2 = await run(cmd2);
    expect(res2.exitCode).toBe(0);
    expect(res2.out).toBe('content 2\n');
    expect(res2.err).toBe('');
  });

  describe('head and tail', () => {
    it('head reads first N lines from file and stdin', async () => {
      const { run, fs } = createTestShell();
      fs.writeFile('/tmp/lines.txt', '1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n');
      expect((await run('head /tmp/lines.txt')).out).toBe('1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n');
      expect((await run('head -n 3 /tmp/lines.txt')).out).toBe('1\n2\n3\n');
      expect((await run('head -2 /tmp/lines.txt')).out).toBe('1\n2\n');
      expect((await run('echo -e "a\\nb\\nc" | head -n 2')).out).toBe('a\nb\n');
    });

    it('tail reads last N lines and supports -n +N', async () => {
      const { run, fs } = createTestShell();
      fs.writeFile('/tmp/lines.txt', '1\n2\n3\n4\n5\n');
      expect((await run('tail -n 2 /tmp/lines.txt')).out).toBe('4\n5\n');
      expect((await run('tail -2 /tmp/lines.txt')).out).toBe('4\n5\n');
      expect((await run('tail -n +3 /tmp/lines.txt')).out).toBe('3\n4\n5\n');
      expect((await run('echo -e "x\\ny\\nz" | tail -n 1')).out).toBe('z\n');
    });

    it('head and tail show headers when multiple files are provided', async () => {
      const { run, fs } = createTestShell();
      fs.writeFile('/tmp/a.txt', 'a1\na2\n');
      fs.writeFile('/tmp/b.txt', 'b1\nb2\n');
      const rHead = await run('head -n 1 /tmp/a.txt /tmp/b.txt');
      expect(rHead.out).toBe('==> /tmp/a.txt <==\na1\n\n==> /tmp/b.txt <==\nb1\n');
      const rTail = await run('tail -n 1 /tmp/a.txt /tmp/b.txt');
      expect(rTail.out).toBe('==> /tmp/a.txt <==\na2\n\n==> /tmp/b.txt <==\nb2\n');
    });
  });

  describe('wc', () => {
    it('counts lines, words, and bytes', async () => {
      const { run, fs } = createTestShell();
      fs.writeFile('/tmp/words.txt', 'bir iki uc\ndort bes\n');
      const r = await run('wc /tmp/words.txt');
      expect(r.exitCode).toBe(0);
      expect(r.out).toContain('2'); // lines
      expect(r.out).toContain('5'); // words
      expect(r.out).toContain('/tmp/words.txt');

      expect((await run('wc -l /tmp/words.txt')).out.trim()).toBe('2 /tmp/words.txt');
      expect((await run('wc -w /tmp/words.txt')).out.trim()).toBe('5 /tmp/words.txt');
      expect((await run('cat /tmp/words.txt | wc -l')).out.trim()).toBe('2');
    });
  });

  describe('grep', () => {
    it('searches pattern with options and exit codes', async () => {
      const { run, fs } = createTestShell();
      fs.writeFile('/tmp/log.txt', 'INFO: basladi\nWARN: dikkat\nERROR: hata olustu\n');
      const r1 = await run('grep ERROR /tmp/log.txt');
      expect(r1.exitCode).toBe(0);
      expect(r1.out).toBe('ERROR: hata olustu\n');

      const rNone = await run('grep FATAL /tmp/log.txt');
      expect(rNone.exitCode).toBe(1);
      expect(rNone.out).toBe('');

      const rCase = await run('grep -i error /tmp/log.txt');
      expect(rCase.exitCode).toBe(0);
      expect(rCase.out).toBe('ERROR: hata olustu\n');

      const rInv = await run('grep -v -c INFO /tmp/log.txt');
      expect(rInv.out.trim()).toBe('2');

      const rPipe = await run('cat /tmp/log.txt | grep -n WARN');
      expect(rPipe.out).toBe('2:WARN: dikkat\n');
    });

    it('supports recursive search with -r', async () => {
      const { run, fs } = createTestShell();
      fs.mkdir('/tmp/d1');
      fs.writeFile('/tmp/d1/f1.txt', 'aranan metin burada\n');
      fs.writeFile('/tmp/d1/f2.txt', 'baska bir sey\n');
      const r = await run('grep -r aranan /tmp/d1');
      expect(r.exitCode).toBe(0);
      expect(r.out).toContain('/tmp/d1/f1.txt:aranan metin burada');
    });
  });

  describe('sort and uniq', () => {
    it('sorts alphabetically and numerically', async () => {
      const { run, fs } = createTestShell();
      fs.writeFile('/tmp/nums.txt', '10\n2\n1\n20\n');
      expect((await run('sort /tmp/nums.txt')).out).toBe('1\n10\n2\n20\n');
      expect((await run('sort -n /tmp/nums.txt')).out).toBe('1\n2\n10\n20\n');
      expect((await run('sort -rn /tmp/nums.txt')).out).toBe('20\n10\n2\n1\n');
    });

    it('uniq deduplicates consecutive lines and works with sort in pipeline', async () => {
      const { run, fs } = createTestShell();
      fs.writeFile('/tmp/rep.txt', 'elma\nelma\narmut\nelma\n');
      expect((await run('uniq /tmp/rep.txt')).out).toBe('elma\narmut\nelma\n');
      expect((await run('sort /tmp/rep.txt | uniq')).out).toBe('armut\nelma\n');
      const rCount = await run('sort /tmp/rep.txt | uniq -c');
      expect(rCount.out).toContain('1 armut');
      expect(rCount.out).toContain('3 elma');
    });
  });

  describe('find', () => {
    it('finds files and directories by name and type', async () => {
      const { run, fs } = createTestShell();
      fs.mkdir('/tmp/search');
      fs.writeFile('/tmp/search/a.txt', 'hello');
      fs.writeFile('/tmp/search/b.md', 'markdown');
      fs.mkdir('/tmp/search/sub');
      fs.writeFile('/tmp/search/sub/c.txt', 'nested');

      const rTxt = await run('find /tmp/search -name "*.txt"');
      expect(rTxt.exitCode).toBe(0);
      expect(rTxt.out).toContain('/tmp/search/a.txt');
      expect(rTxt.out).toContain('/tmp/search/sub/c.txt');
      expect(rTxt.out).not.toContain('/tmp/search/b.md');

      const rType = await run('find /tmp/search -type d');
      expect(rType.out).toContain('/tmp/search/sub');
      expect(rType.out).not.toContain('/tmp/search/a.txt');

      const rDepth = await run('find /tmp/search -maxdepth 1 -name "*.txt"');
      expect(rDepth.out).toContain('/tmp/search/a.txt');
      expect(rDepth.out).not.toContain('/tmp/search/sub/c.txt');
    });
  });

  describe('chmod', () => {
    it('changes permissions using octal mode', async () => {
      const { run, fs } = createTestShell();
      await run('touch /tmp/test.sh');
      const r = await run('chmod 755 /tmp/test.sh');
      expect(r.exitCode).toBe(0);
      expect(fs.lookup('/tmp/test.sh').mode).toBe(0o755);
    });

    it('changes permissions using symbolic mode (+x, -w, u+x)', async () => {
      const { run, fs } = createTestShell();
      await run('touch /tmp/script.sh');
      // default file mode is 0o644
      await run('chmod +x /tmp/script.sh');
      expect(fs.lookup('/tmp/script.sh').mode).toBe(0o755);

      await run('chmod -w /tmp/script.sh');
      expect(fs.lookup('/tmp/script.sh').mode & 0o222).toBe(0);
    });

    it('supports -R recursive mode', async () => {
      const { run, fs } = createTestShell();
      await run('mkdir -p /tmp/rec/sub && touch /tmp/rec/sub/f.txt');
      const r = await run('chmod -R 700 /tmp/rec');
      expect(r.exitCode).toBe(0);
      expect(fs.lookup('/tmp/rec').mode).toBe(0o700);
      expect(fs.lookup('/tmp/rec/sub').mode).toBe(0o700);
      expect(fs.lookup('/tmp/rec/sub/f.txt').mode).toBe(0o700);
    });

    it('reports errors for missing operands or non-existent files', async () => {
      const { run } = createTestShell();
      expect((await run('chmod')).err).toContain('argüman eksik');
      expect((await run('chmod 755')).err).toContain('hedef argüman eksik');
      expect((await run('chmod bad /tmp/f')).err).toContain('geçersiz izin kipi');
      expect((await run('chmod 755 /tmp/nonexistent')).err).toContain('Böyle bir dosya veya dizin yok');
    });
  });

  describe('whoami', () => {
    it('prints current user', async () => {
      const { run } = createTestShell();
      const r = await run('whoami');
      expect(r.exitCode).toBe(0);
      expect(r.out.trim()).toBe('kullanici');
    });

    it('reports error on extra operand', async () => {
      const { run } = createTestShell();
      const r = await run('whoami extra');
      expect(r.exitCode).toBe(1);
      expect(r.err).toContain('fazladan argüman');
    });
  });

  describe('uname', () => {
    it('prints Linux by default', async () => {
      const { run } = createTestShell();
      const r = await run('uname');
      expect(r.exitCode).toBe(0);
      expect(r.out.trim()).toBe('Linux');
    });

    it('supports -a and individual flags', async () => {
      const { run } = createTestShell();
      const rAll = await run('uname -a');
      expect(rAll.exitCode).toBe(0);
      expect(rAll.out).toContain('Linux');
      expect(rAll.out).toContain('klu');
      expect(rAll.out).toContain('x86_64');

      const rRel = await run('uname -r');
      expect(rRel.out.trim()).toBe('6.8.0-klu');
    });
  });

  describe('date', () => {
    it('prints formatted date', async () => {
      const { run } = createTestShell();
      const r = await run('date');
      expect(r.exitCode).toBe(0);
      expect(r.out).toContain('2024'); // default FIXED_NOW year
    });

    it('supports -u for UTC', async () => {
      const { run } = createTestShell();
      const r = await run('date -u');
      expect(r.exitCode).toBe(0);
      expect(r.out).toContain('UTC');
    });

    it('supports custom format string', async () => {
      const { run } = createTestShell();
      const r = await run('date +%Y-%m-%d');
      expect(r.exitCode).toBe(0);
      expect(r.out.trim()).toBe('2024-11-19');
    });
  });

  describe('env', () => {
    it('lists environment variables', async () => {
      const { run } = createTestShell();
      const r = await run('env');
      expect(r.exitCode).toBe(0);
      expect(r.out).toContain('USER=kullanici');
      expect(r.out).toContain('HOME=/home/kullanici');
      expect(r.out).toContain('SHELL=/bin/bash');
    });

    it('works in pipelines', async () => {
      const { run } = createTestShell();
      const r = await run('env | grep USER');
      expect(r.out.trim()).toBe('USER=kullanici');
    });
  });

  describe('export', () => {
    it('sets and exports environment variables', async () => {
      const { run } = createTestShell();
      await run('export YENI=test_deger');
      const rEcho = await run('echo $YENI');
      expect(rEcho.out.trim()).toBe('test_deger');

      const rEnv = await run('env | grep YENI');
      expect(rEnv.out.trim()).toBe('YENI=test_deger');
    });

    it('lists exported variables with -p or without arguments', async () => {
      const { run } = createTestShell();
      const r = await run('export');
      expect(r.out).toContain('declare -x USER="kullanici"');
    });

    it('rejects invalid variable identifiers', async () => {
      const { run } = createTestShell();
      const r = await run('export 123bad=val');
      expect(r.exitCode).toBe(1);
      expect(r.err).toContain('geçerli bir tanımlayıcı değil');
    });
  });

  describe('which', () => {
    it('finds path of existing commands', async () => {
      const { run } = createTestShell();
      const rLs = await run('which ls');
      expect(rLs.exitCode).toBe(0);
      expect(rLs.out.trim()).toBe('/bin/ls');

      const rGrep = await run('which grep');
      expect(rGrep.exitCode).toBe(0);
      expect(rGrep.out.trim()).toBe('/usr/bin/grep');
    });

    it('returns error when command is not found', async () => {
      const { run } = createTestShell();
      const r = await run('which bulunamayan');
      expect(r.exitCode).toBe(1);
      expect(r.err).toContain('which: no bulunamayan in');
    });
  });

  describe('ps and kill', () => {
    it('lists processes with ps and ps aux', async () => {
      const { run, shell } = createTestShell();
      shell.addProcess({ pid: 1420, command: 'python3 worker.py' });

      const rPs = await run('ps');
      expect(rPs.out).toContain('bash');
      expect(rPs.out).toContain('ps');

      const rAux = await run('ps aux');
      expect(rAux.out).toContain('/sbin/init');
      expect(rAux.out).toContain('python3 worker.py');
    });

    it('terminates processes with kill', async () => {
      const { run, shell } = createTestShell();
      shell.addProcess({ pid: 1420, command: 'python3 worker.py' });

      const rKill = await run('kill 1420');
      expect(rKill.exitCode).toBe(0);
      expect(shell.processes.some((p) => p.pid === 1420)).toBe(false);

      const rAgain = await run('kill 1420');
      expect(rAgain.exitCode).toBe(1);
      expect(rAgain.err).toContain('Böyle bir süreç yok');
    });

    it('refuses to kill PID 1', async () => {
      const { run } = createTestShell();
      const r = await run('kill 1');
      expect(r.exitCode).toBe(1);
      expect(r.err).toContain('İşleme izin verilmedi');
    });
  });

  describe('executable script execution', () => {
    it('denies execution without +x and runs with +x', async () => {
      const { run } = createTestShell();
      await run('echo "echo Merhaba Betik" > /tmp/betik.sh');

      // Without +x -> 126 Permission denied
      const rNoExec = await run('/tmp/betik.sh');
      expect(rNoExec.exitCode).toBe(126);
      expect(rNoExec.err).toContain('İzin reddedildi');

      // With +x -> executes successfully
      await run('chmod +x /tmp/betik.sh');
      const rExec = await run('/tmp/betik.sh');
      expect(rExec.exitCode).toBe(0);
      expect(rExec.out.trim()).toBe('Merhaba Betik');
    });

    it('does not leak script lines into shell history', async () => {
      const { run, shell } = createTestShell();
      await run('echo "echo inside_script" > /tmp/betik.sh');
      await run('chmod +x /tmp/betik.sh');
      await run('/tmp/betik.sh');
      expect(shell.history).toContain('/tmp/betik.sh');
      expect(shell.history).not.toContain('echo inside_script');
    });
  });

  describe('logical operators && and ||', () => {
    it('executes right side of && only on success', async () => {
      const { run } = createTestShell();
      const rSuccess = await run('echo A && echo B');
      expect(rSuccess.out).toBe('A\nB\n');
      expect(rSuccess.exitCode).toBe(0);

      const rFail = await run('cat /yok.txt && echo B');
      expect(rFail.out).toBe('');
      expect(rFail.exitCode).not.toBe(0);
    });

    it('executes right side of || only on failure', async () => {
      const { run } = createTestShell();
      const rSuccess = await run('echo A || echo B');
      expect(rSuccess.out).toBe('A\n');
      expect(rSuccess.exitCode).toBe(0);

      const rFail = await run('cat /yok.txt || echo B');
      expect(rFail.out).toBe('B\n');
      expect(rFail.exitCode).toBe(0);
    });

    it('chains && and || with pipelines and redirection', async () => {
      const { run } = createTestShell();
      await run('echo "arama metni" > /tmp/metin.txt');

      const rMatch = await run('cat /tmp/metin.txt | grep "arama" && echo "bulundu" || echo "yok"');
      expect(rMatch.out).toContain('bulundu');
      expect(rMatch.out).not.toContain('yok');

      const rNoMatch = await run('cat /tmp/metin.txt | grep "kayip" && echo "bulundu" || echo "yok"');
      expect(rNoMatch.out).toContain('yok');
      expect(rNoMatch.out).not.toContain('bulundu');
    });
  });

  describe('stat', () => {
    it('displays file metadata including size, mode, and owner', async () => {
      const { run } = createTestShell();
      await run('echo "KLU Linux" > /tmp/stat_test.txt');
      const r = await run('stat /tmp/stat_test.txt');
      expect(r.exitCode).toBe(0);
      expect(r.out).toContain('File: /tmp/stat_test.txt');
      expect(r.out).toContain('regular file');
      expect(r.out).toContain('Access: (0644/-rw-r--r--)');
      expect(r.out).toContain('Uid: ( 1000/kullanici)');
    });

    it('supports custom formatting with -c', async () => {
      const { run } = createTestShell();
      await run('echo "12345" > /tmp/fmt.txt');
      const r = await run('stat -c "%s %a %F" /tmp/fmt.txt');
      expect(r.exitCode).toBe(0);
      expect(r.out.trim()).toBe('6 644 regular file');
    });

    it('reports error on missing operand or non-existent file', async () => {
      const { run } = createTestShell();
      expect((await run('stat')).err).toContain('argüman eksik');
      expect((await run('stat /yok.txt')).err).toContain('Böyle bir dosya veya dizin yok');
    });
  });

  describe('realpath', () => {
    it('resolves relative paths, .., and ~ to absolute canonical paths', async () => {
      const { run } = createTestShell();
      const rDot = await run('realpath .');
      expect(rDot.exitCode).toBe(0);
      expect(rDot.out.trim()).toBe('/home/kullanici');

      const rParent = await run('realpath ..');
      expect(rParent.out.trim()).toBe('/home');

      const rTilde = await run('realpath ~/Belgeler/../Muzik');
      expect(rTilde.out.trim()).toBe('/home/kullanici/Muzik');
    });

    it('reports error for non-existent path unless -m is given', async () => {
      const { run } = createTestShell();
      const rErr = await run('realpath /olmayan/dosya.txt');
      expect(rErr.exitCode).toBe(1);
      expect(rErr.err).toContain('Böyle bir dosya veya dizin yok');

      const rMissing = await run('realpath -m /olmayan/dosya.txt');
      expect(rMissing.exitCode).toBe(0);
      expect(rMissing.out.trim()).toBe('/olmayan/dosya.txt');
    });
  });

  describe('basename', () => {
    it('strips directory prefixes', async () => {
      const { run } = createTestShell();
      const r1 = await run('basename /usr/local/bin/sort');
      expect(r1.out.trim()).toBe('sort');

      const r2 = await run('basename /etc/nginx/');
      expect(r2.out.trim()).toBe('nginx');

      const rRoot = await run('basename /');
      expect(rRoot.out.trim()).toBe('/');
    });

    it('strips suffix when provided', async () => {
      const { run } = createTestShell();
      const rSuff = await run('basename /home/kullanici/app.js .js');
      expect(rSuff.out.trim()).toBe('app');

      const rOption = await run('basename -s .txt /home/kullanici/notlar.txt');
      expect(rOption.out.trim()).toBe('notlar');
    });

    it('supports multiple arguments with -a', async () => {
      const { run } = createTestShell();
      const r = await run('basename -a /a/b.js /c/d.py');
      expect(r.out).toBe('b.js\nd.py\n');
    });

    it('reports error on missing operand', async () => {
      const { run } = createTestShell();
      const r = await run('basename');
      expect(r.exitCode).toBe(1);
      expect(r.err).toContain('argüman eksik');
    });
  });
});




