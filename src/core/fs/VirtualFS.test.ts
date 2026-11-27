import { describe, expect, it } from 'vitest';
import {
  FsError,
  MAX_FILE_SIZE,
  MAX_TOTAL_NODES,
  MAX_TOTAL_SIZE,
  modeString,
  VirtualFS,
  type DirNode,
  type FsNode,
} from './VirtualFS';
import { createDefaultFS } from './defaultTree';

function fileNode(name: string, content = ''): FsNode {
  return { type: 'file', name, content, mode: 0o644, owner: 'user', group: 'user', mtime: 1 };
}

function rootNode(children: Record<string, FsNode> = Object.create(null)): DirNode {
  return { type: 'dir', name: '', children, mode: 0o755, owner: 'root', group: 'root', mtime: 1 };
}

function wideRoot(fileCount: number, content = ''): DirNode {
  const children: Record<string, FsNode> = Object.create(null);
  for (let i = 0; i < fileCount; i++) children[`f${i}`] = fileNode(`f${i}`, content);
  return rootNode(children);
}

function deepRoot(directoryCount: number): DirNode {
  const root = rootNode();
  let parent = root;
  for (let i = 0; i < directoryCount; i++) {
    const name = `d${i}`;
    const child: DirNode = {
      type: 'dir', name, children: Object.create(null), mode: 0o755,
      owner: 'user', group: 'user', mtime: 1,
    };
    parent.children[name] = child;
    parent = child;
  }
  return root;
}

function expectFsErrorCode(operation: () => unknown, code: FsError['code']): void {
  let thrown: unknown;
  try {
    operation();
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(FsError);
  expect((thrown as FsError).code).toBe(code);
}

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

  it('preserves special file and directory names through JSON round-trip and clone', () => {
    const fs = new VirtualFS();
    fs.mkdir('/files');
    fs.mkdir('/dirs');
    for (const name of ['__proto__', 'constructor', 'prototype']) {
      fs.writeFile(`/files/${name}`, `file:${name}`);
      fs.mkdir(`/dirs/${name}`);
      fs.writeFile(`/dirs/${name}/child`, `child:${name}`);
    }

    const serialized = JSON.parse(JSON.stringify(fs.toJSON())) as DirNode;
    const restored = VirtualFS.fromJSON(serialized);
    const cloned = fs.clone();
    for (const name of ['__proto__', 'constructor', 'prototype']) {
      for (const candidate of [restored, cloned]) {
        expect(candidate.readFile(`/files/${name}`)).toBe(`file:${name}`);
        expect(candidate.isDir(`/dirs/${name}`)).toBe(true);
        expect(candidate.readFile(`/dirs/${name}/child`)).toBe(`child:${name}`);
      }
    }
  });

  it('preserves special file and directory names during recursive copy', () => {
    const fs = new VirtualFS();
    fs.mkdir('/src');
    fs.mkdir('/src/files');
    fs.mkdir('/src/dirs');
    for (const name of ['__proto__', 'constructor', 'prototype']) {
      fs.writeFile(`/src/files/${name}`, `file:${name}`);
      fs.mkdir(`/src/dirs/${name}`);
      fs.writeFile(`/src/dirs/${name}/child`, `child:${name}`);
    }

    fs.copy('/src', '/copy', { recursive: true });
    for (const name of ['__proto__', 'constructor', 'prototype']) {
      expect(fs.readFile(`/copy/files/${name}`)).toBe(`file:${name}`);
      expect(fs.isDir(`/copy/dirs/${name}`)).toBe(true);
      expect(fs.readFile(`/copy/dirs/${name}/child`)).toBe(`child:${name}`);
    }
  });

  it.each([
    ['non-directory root', { ...rootNode(), type: 'file', content: 'x' }],
    ['unsupported node type', rootNode({ bad: { ...fileNode('bad'), type: 'link' } as unknown as FsNode })],
    ['missing metadata', rootNode({ bad: { type: 'file', name: 'bad', content: 'x' } as FsNode })],
    ['non-string content', rootNode({ bad: { ...fileNode('bad'), content: 42 } as unknown as FsNode })],
    ['invalid children container', { ...rootNode(), children: [] }],
    ['child key/name mismatch', rootNode({ key: fileNode('different') })],
    ['slash in child name', rootNode({ 'a/b': fileNode('a/b') })],
  ])('rejects malformed imported trees: %s', (_label, malformed) => {
    expect(() => VirtualFS.fromJSON(malformed as DirNode)).toThrowError(FsError);
  });

  it('enforces per-file, total-byte, and node limits while importing', () => {
    expectFsErrorCode(() => VirtualFS.fromJSON(wideRoot(1, 'x'.repeat(MAX_FILE_SIZE + 1))), 'EFBIG');

    const oversizedChildren: Record<string, FsNode> = Object.create(null);
    for (let i = 0; i < 5; i++) {
      oversizedChildren[`large${i}`] = fileNode(`large${i}`, i === 4 ? 'x' : 'x'.repeat(MAX_FILE_SIZE));
    }
    expect(MAX_TOTAL_SIZE).toBe(4 * MAX_FILE_SIZE);
    expectFsErrorCode(() => VirtualFS.fromJSON(rootNode(oversizedChildren)), 'ENOSPC');

    expectFsErrorCode(() => VirtualFS.fromJSON(wideRoot(MAX_TOTAL_NODES)), 'ENOSPC');
  });

  it('keeps the depth limit and does not mutate existing state after failed import', () => {
    expect(() => VirtualFS.fromJSON(deepRoot(65))).toThrowError(FsError);
    expect(VirtualFS.fromJSON(deepRoot(64)).isDir('/' + Array.from({ length: 64 }, (_, i) => `d${i}`).join('/')))
      .toBe(true);

    const fs = new VirtualFS();
    fs.writeFile('/keep', 'unchanged');
    const before = JSON.stringify(fs.toJSON());
    const invalid = rootNode({ bad: { ...fileNode('bad'), content: null } as unknown as FsNode });
    expect(() => VirtualFS.fromJSON(invalid)).toThrowError(FsError);
    expect(fs.readFile('/keep')).toBe('unchanged');
    expect(JSON.stringify(fs.toJSON())).toBe(before);
  });

  it('rejects mkdir -p at capacity without partial directories or notifications', () => {
    const fs = VirtualFS.fromJSON(wideRoot(MAX_TOTAL_NODES - 2));
    const events: unknown[] = [];
    fs.subscribe((event) => events.push(event));

    expectFsErrorCode(() => fs.mkdir('/partial/child', { parents: true }), 'ENOSPC');
    expect(fs.exists('/partial')).toBe(false);
    expect(events).toEqual([]);
  });

  it('keeps seed atomic when capacity fails after earlier seed entries', () => {
    const fs = VirtualFS.fromJSON(wideRoot(MAX_TOTAL_NODES - 3));
    const events: unknown[] = [];
    fs.subscribe((event) => events.push(event));
    const before = JSON.stringify(fs.toJSON());

    expectFsErrorCode(() => fs.seed({ dirs: ['/first', '/second', '/third'] }), 'ENOSPC');
    expect(fs.exists('/first')).toBe(false);
    expect(fs.exists('/second')).toBe(false);
    expect(fs.exists('/third')).toBe(false);
    expect(JSON.stringify(fs.toJSON())).toBe(before);
    expect(events).toEqual([]);
  });

  it('measures the single-file limit in UTF-8 bytes', () => {
    const fs = new VirtualFS();
    const exactLimitEmojiContent = '😀'.repeat(MAX_FILE_SIZE / 4);
    fs.writeFile('/emoji.txt', exactLimitEmojiContent);
    expect(fs.readFile('/emoji.txt')).toBe(exactLimitEmojiContent);
    expectFsErrorCode(() => fs.writeFile('/emoji.txt', `${exactLimitEmojiContent}😀`), 'EFBIG');
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


