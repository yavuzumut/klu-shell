import { describe, it, expect } from 'vitest';
import { Shell } from './Shell';
import { VirtualFS } from '../fs/VirtualFS';
import { createDefaultFS } from '../fs/defaultTree';
import { createRegistry } from '../commands';
import { localizeFixturePath, localizeFixtureText, resolveFixturePath } from '../../i18n/fixtureLocale';

describe('Shell and command i18n support', () => {
  it('localizes fixture paths without rewriting remote URLs or overlapping names', () => {
    expect(localizeFixturePath('/home/kullanici/projeler/.gizli_not', 'en')).toBe('/home/user/projects/.hidden_note');
    expect(resolveFixturePath('/home/user/projects/.hidden_note', 'en')).toBe('/home/kullanici/projeler/.gizli_not');
    expect(localizeFixtureText('git clone https://github.com/klu/notlar.git', 'en')).toBe(
      'git clone https://github.com/klu/notlar.git',
    );
    expect(localizeFixtureText('mkdir ~/projeler/docs', 'en')).toBe('mkdir ~/projects/docs');
  });

  it('executes help in Turkish by default', async () => {
    const fs = new VirtualFS();
    const registry = createRegistry();
    const shell = new Shell({ fs, registry, lang: 'tr' });

    const rec = await shell.execute('help pwd');
    expect(rec.stdout).toContain('pwd');
    expect(rec.stdout).toContain('Bulunduğun dizin');
  });

  it('executes help in English when lang is en', async () => {
    const fs = new VirtualFS();
    const registry = createRegistry();
    const shell = new Shell({ fs, registry, lang: 'en' });

    const rec = await shell.execute('help pwd');
    expect(rec.stdout).toContain('pwd');
    expect(rec.stdout).toContain('working directory');
  });

  it('updates shell locale, user, prompt, and aliases without resetting session state', async () => {
    const fs = createDefaultFS();
    const shell = new Shell({ fs, registry: createRegistry(), lang: 'tr' });
    await shell.execute('touch notlar.txt');
    const historyBeforeSwitch = [...shell.history];

    expect(shell.env.LANG).toBe('tr_TR.UTF-8');
    expect(shell.env.USER).toBe('kullanici');
    expect(shell.prompt).toContain('kullanici@klu');

    shell.lang = 'en';
    expect(shell.env.LANG).toBe('en_US.UTF-8');
    expect(shell.env.USER).toBe('user');
    expect(shell.env.LOGNAME).toBe('user');
    expect(shell.env.HOME).toBe('/home/user');
    expect(shell.prompt).toContain('user@klu');
    expect(shell.prompt.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')).toContain('~$ ');
    expect(shell.history).toEqual(historyBeforeSwitch);
    expect(fs.isFile('/home/kullanici/notlar.txt')).toBe(true);

    const whoami = await shell.execute('whoami');
    expect(whoami.stdout).toBe('user\n');
    const cd = await shell.execute('cd Documents');
    expect(cd.exitCode).toBe(0);
    expect(shell.cwd).toBe('/home/kullanici/Belgeler');
    expect((await shell.execute('pwd')).stdout).toBe('/home/user/Documents\n');
    expect((await shell.execute('cat ~/notes.txt')).exitCode).toBe(0);

    shell.lang = 'tr';
    expect(shell.env.LANG).toBe('tr_TR.UTF-8');
    expect(shell.env.USER).toBe('kullanici');
    expect(shell.history).toContain('touch notlar.txt');
    expect(fs.isFile('/home/kullanici/notlar.txt')).toBe(true);
  });

  it('localizes ls fixture names and month abbreviations for both languages', async () => {
    const timestamp = new Date(2024, 0, 5, 10, 30).getTime();
    const fs = createDefaultFS(undefined, () => timestamp);
    const shell = new Shell({ fs, registry: createRegistry(), lang: 'tr' });
    const tr = await shell.execute('ls -l');
    const date = new Date(timestamp);
    const trMonth = new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date).replace(/\.$/, '');
    expect(tr.stdout).toContain(` ${trMonth} `);
    expect(tr.stdout).toContain('kullanici');
    expect(tr.stdout).toContain('Belgeler');

    shell.lang = 'en';
    const en = await shell.execute('ls -l');
    const enMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date).replace(/\.$/, '');
    expect(en.stdout).toContain(` ${enMonth} `);
    expect(en.stdout).toContain('user');
    expect(en.stdout).toContain('Documents');
    expect(en.stdout).not.toContain('Belgeler');
  });

  it('uses selected-language filesystem error messages', async () => {
    const fs = createDefaultFS();
    const shell = new Shell({ fs, registry: createRegistry(), lang: 'tr' });
    expect((await shell.execute('cat missing.txt')).stderr).toContain('Böyle bir dosya veya dizin yok');
    shell.lang = 'en';
    expect((await shell.execute('cat missing.txt')).stderr).toContain('No such file or directory');
    await shell.execute('cat missing.txt 2>~/error.txt');
    expect(fs.readFile('/home/kullanici/error.txt')).toContain('No such file or directory');
    shell.lang = 'tr';
    await shell.execute('cat missing.txt 2>~/error.txt');
    expect(fs.readFile('/home/kullanici/error.txt')).toContain('Böyle bir dosya veya dizin yok');
  });

  it('keeps user-authored script commands unchanged in English mode', async () => {
    const fs = createDefaultFS();
    const shell = new Shell({ fs, registry: createRegistry(), lang: 'en' });
    fs.writeFile('/tmp/custom.sh', 'echo "Merhaba Linux"\n');
    fs.chmod('/tmp/custom.sh', 0o755);

    expect((await shell.execute('/tmp/custom.sh')).stdout).toBe('Merhaba Linux\n');
  });

  it('prints command --help in selected language', async () => {
    const fs = new VirtualFS();
    const registry = createRegistry();
    const shellTr = new Shell({ fs, registry, lang: 'tr' });
    const shellEn = new Shell({ fs, registry, lang: 'en' });

    const recTr = await shellTr.execute('ls --help');
    expect(recTr.stdout).toContain('Kullanım:');
    expect(recTr.stdout).toContain('Ayrıntılı bilgi için:');

    const recEn = await shellEn.execute('ls --help');
    expect(recEn.stdout).toContain('Usage:');
    expect(recEn.stdout).toContain('For more information:');
  });

  it('prints man page with localized header and contents', async () => {
    const fs = new VirtualFS();
    const registry = createRegistry();
    const shellEn = new Shell({ fs, registry, lang: 'en' });

    const rec = await shellEn.execute('man pwd');
    expect(rec.stdout).toContain('KLU Manual');
    expect(rec.stdout).toContain('print name of current/working directory');
  });

  it('localizes the missing-man-page prompt', async () => {
    const registry = createRegistry();
    const shellTr = new Shell({ fs: new VirtualFS(), registry, lang: 'tr' });
    const shellEn = new Shell({ fs: new VirtualFS(), registry, lang: 'en' });

    expect((await shellTr.execute('man')).stderr).toContain('Hangi kılavuz sayfasını görmek istiyorsun?');
    expect((await shellEn.execute('man')).stderr).toContain('What manual page do you want?');
  });

  it('prints git help in the selected language', async () => {
    const registry = createRegistry();
    const shellTr = new Shell({ fs: new VirtualFS(), registry, lang: 'tr' });
    const shellEn = new Shell({ fs: new VirtualFS(), registry, lang: 'en' });

    expect((await shellTr.execute('git')).stderr).toContain('kullanım: git');
    const english = (await shellEn.execute('git')).stderr;
    expect(english).toContain('usage: git');
    expect(english).toContain('Git 2 — diff and restore');
    expect(english).not.toContain('kullanım');
  });

  it('prints git help in English when shell lang is en', async () => {
    const fs = new VirtualFS();
    const registry = createRegistry();
    const shellEn = new Shell({ fs, registry, lang: 'en' });

    const rec = await shellEn.execute('git');
    expect(rec.stderr).toContain('usage: git <command> [<args>]');
    expect(rec.stderr).toContain('Create an empty Git repository');
  });
});
