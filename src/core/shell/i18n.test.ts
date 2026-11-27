import { describe, it, expect } from 'vitest';
import { Shell } from './Shell';
import { VirtualFS } from '../fs/VirtualFS';
import { createRegistry } from '../commands';

describe('Shell and command i18n support', () => {
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
