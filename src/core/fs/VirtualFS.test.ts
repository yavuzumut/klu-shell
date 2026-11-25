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
    expect(fs.readFile('/etc/hostname')).toBe('klu\n');
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
    expect(copy.readFile('/etc/hostname')).toBe('klu\n');
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

  it('handles prototype properties and special names without prototype pollution', () => {
    const fs = new VirtualFS();
    // Clean file system must not report phantom prototype properties as existing
    expect(fs.exists('/toString')).toBe(false);
    expect(fs.exists('/constructor')).toBe(false);
    expect(fs.exists('/__proto__')).toBe(false);
    expect(fs.exists('/valueOf')).toBe(false);
    expect(fs.tryLookup('/toString')).toBeNull();

    // Files named __proto__, constructor, toString can be created, read, and removed normally
    fs.mkdir('/tmp');
    for (const name of ['__proto__', 'constructor', 'toString']) {
      const p = `/tmp/${name}`;
      fs.touch(p);
      expect(fs.exists(p)).toBe(true);
      expect(fs.isFile(p)).toBe(true);
      fs.writeFile(p, `content of ${name}`);
      expect(fs.readFile(p)).toBe(`content of ${name}`);
      fs.remove(p);
      expect(fs.exists(p)).toBe(false);
    }

    // Directories named __proto__, constructor, toString can be created and hold files
    for (const name of ['__proto__', 'constructor', 'toString']) {
      const dirPath = `/tmp/dir_${name}`;
      fs.mkdir(dirPath);
      expect(fs.exists(dirPath)).toBe(true);
      expect(fs.isDir(dirPath)).toBe(true);
      const child = `${dirPath}/sample.txt`;
      fs.writeFile(child, 'hello');
      expect(fs.readFile(child)).toBe('hello');
      const list = fs.readdir(dirPath).map((n) => n.name);
      expect(list).toEqual(['sample.txt']);
      fs.remove(dirPath, { recursive: true });
      expect(fs.exists(dirPath)).toBe(false);
    }
  });

  describe('chmod', () => {
    it('changes node mode and notifies listeners', () => {
      const fs = new VirtualFS();
      fs.writeFile('/test.txt', 'hello');
      const events: string[] = [];
      fs.subscribe((e) => events.push(`${e.action}:${e.path}`));

      fs.chmod('/test.txt', 0o755);
      expect(fs.lookup('/test.txt').mode).toBe(0o755);
      expect(events).toContain('modify:/test.txt');

      fs.chmod('/test.txt', (m) => m & ~0o055);
      expect(fs.lookup('/test.txt').mode).toBe(0o700);
    });

    it('changes mode recursively for directories', () => {
      const fs = new VirtualFS();
      fs.mkdir('/dir');
      fs.writeFile('/dir/sub.txt', 'sub');

      fs.chmod('/dir', 0o700, { recursive: true });
      expect(fs.lookup('/dir').mode).toBe(0o700);
      expect(fs.lookup('/dir/sub.txt').mode).toBe(0o700);
    });
  });
});


