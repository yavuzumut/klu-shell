import { describe, expect, it } from 'vitest';
import { FsError, modeString, VirtualFS } from './VirtualFS';
import { createDefaultFS } from './defaultTree';

describe('VirtualFS.resolve', () => {
  const fs = new VirtualFS();
  it.each([
    ['/etc', '/home/kullanici', '/etc'],
    ['Belgeler', '/home/kullanici', '/home/kullanici/Belgeler'],
    ['..', '/home/kullanici', '/home'],
    ['../../..', '/home/kullanici', '/'],
    ['./a/./b/../c', '/', '/a/c'],
    ['~', '/etc', '/home/kullanici'],
    ['~/Belgeler', '/etc', '/home/kullanici/Belgeler'],
    ['/a//b/', '/', '/a/b'],
  ])('resolve(%s, %s) = %s', (path, cwd, expected) => {
    expect(fs.resolve(path, cwd)).toBe(expected);
  });

  it('prettyPath abbreviates home', () => {
    expect(fs.prettyPath('/home/kullanici')).toBe('~');
    expect(fs.prettyPath('/home/kullanici/x')).toBe('~/x');
    expect(fs.prettyPath('/home/kullanicilar')).toBe('/home/kullanicilar');
  });
});

describe('VirtualFS operations', () => {
  const make = () => createDefaultFS();

  it('has the default layout', () => {
    const fs = make();
    for (const p of ['/etc', '/var/log', '/tmp', '/home/kullanici/Belgeler']) expect(fs.isDir(p)).toBe(true);
    expect(fs.readFile('/etc/hostname')).toBe('termi\n');
    expect(fs.lookup('/etc').owner).toBe('root');
    expect(fs.lookup('/home/kullanici').owner).toBe('kullanici');
  });

  it('creates and reads files', () => {
    const fs = make();
    fs.writeFile('/tmp/a.txt', 'x');
    fs.writeFile('/tmp/a.txt', 'y', { append: true });
    expect(fs.readFile('/tmp/a.txt')).toBe('xy');
  });

  it('throws Linux-like errors', () => {
    const fs = make();
    const code = (fn: () => void) => {
      try {
        fn();
      } catch (e) {
        return (e as FsError).code;
      }
      return null;
    };
    expect(code(() => fs.lookup('/nope'))).toBe('ENOENT');
    expect(code(() => fs.lookup('/etc/hostname/x'))).toBe('ENOTDIR');
    expect(code(() => fs.readFile('/etc'))).toBe('EISDIR');
    expect(code(() => fs.mkdir('/etc'))).toBe('EEXIST');
    expect(code(() => fs.mkdir('/a/b'))).toBe('ENOENT');
    expect(code(() => fs.remove('/etc'))).toBe('EISDIR');
    expect(code(() => fs.rmdir('/etc'))).toBe('ENOTEMPTY');
    expect(code(() => fs.copy('/etc', '/etc/sub', { recursive: true }))).toBe('EINVAL');
    expect(code(() => fs.move('/home', '/home/kullanici/h'))).toBe('EINVAL');
  });

  it('mkdir -p creates parents and tolerates existing dirs', () => {
    const fs = make();
    fs.mkdir('/a/b/c', { parents: true });
    fs.mkdir('/a/b', { parents: true });
    expect(fs.isDir('/a/b/c')).toBe(true);
  });

  it('copies deeply and independently', () => {
    const fs = make();
    fs.copy('/home/kullanici/Belgeler', '/tmp/B', { recursive: true });
    fs.writeFile('/tmp/B/rapor.txt', 'changed');
    expect(fs.readFile('/home/kullanici/Belgeler/rapor.txt')).not.toBe('changed');
  });

  it('moves nodes', () => {
    const fs = make();
    fs.move('/home/kullanici/merhaba.txt', '/tmp/m.txt');
    expect(fs.exists('/home/kullanici/merhaba.txt')).toBe(false);
    expect(fs.lookup('/tmp/m.txt').name).toBe('m.txt');
  });

  it('removes recursively', () => {
    const fs = make();
    fs.remove('/home/kullanici/Belgeler', { recursive: true });
    expect(fs.exists('/home/kullanici/Belgeler')).toBe(false);
  });

  it('serializes and clones', () => {
    const fs = make();
    const copy = VirtualFS.fromJSON(JSON.parse(JSON.stringify(fs.toJSON())));
    expect(copy.readFile('/etc/hostname')).toBe('termi\n');
    const c2 = fs.clone();
    c2.writeFile('/tmp/z', '1');
    expect(fs.exists('/tmp/z')).toBe(false);
  });

  it('formats mode strings', () => {
    const fs = make();
    expect(modeString(fs.lookup('/etc'))).toBe('drwxr-xr-x');
    expect(modeString(fs.lookup('/etc/hostname'))).toBe('-rw-r--r--');
    expect(modeString(fs.lookup('/root'))).toBe('drwx------');
  });
});
