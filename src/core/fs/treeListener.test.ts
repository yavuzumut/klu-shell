import { describe, expect, it, vi } from 'vitest';
import { createDefaultFS } from './defaultTree';
import type { FsChangeEvent } from './VirtualFS';

describe('VirtualFS change listener & tree state', () => {
  it('notifies listeners on mkdir, touch, writeFile, remove, copy, move', () => {
    const fs = createDefaultFS();
    const events: FsChangeEvent[] = [];
    const unsubscribe = fs.subscribe((e) => events.push(e));

    // 1. mkdir
    fs.mkdir('/home/kullanici/test_dir');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ action: 'create', path: '/home/kullanici/test_dir' });

    // 2. touch (create new file)
    fs.touch('/home/kullanici/test_file.txt');
    expect(events[1]).toEqual({ action: 'create', path: '/home/kullanici/test_file.txt' });

    // 3. touch existing file (modify mtime)
    fs.touch('/home/kullanici/test_file.txt');
    expect(events[2]).toEqual({ action: 'modify', path: '/home/kullanici/test_file.txt' });

    // 4. writeFile update
    fs.writeFile('/home/kullanici/test_file.txt', 'merhaba dünya');
    expect(events[3]).toEqual({ action: 'modify', path: '/home/kullanici/test_file.txt' });

    // 5. copy
    fs.copy('/home/kullanici/test_file.txt', '/home/kullanici/test_file_copy.txt');
    expect(events[4]).toEqual({ action: 'create', path: '/home/kullanici/test_file_copy.txt' });

    // 6. move
    fs.move('/home/kullanici/test_file_copy.txt', '/home/kullanici/test_file_moved.txt');
    expect(events[5]).toEqual({
      action: 'move',
      path: '/home/kullanici/test_file_copy.txt',
      targetPath: '/home/kullanici/test_file_moved.txt',
    });

    // 7. remove
    fs.remove('/home/kullanici/test_file_moved.txt');
    expect(events[6]).toEqual({ action: 'delete', path: '/home/kullanici/test_file_moved.txt' });

    // Unsubscribe
    unsubscribe();
    fs.mkdir('/home/kullanici/another');
    expect(events).toHaveLength(7);
  });

  it('reflects mkdir -p nested directories in events and tree readdir', () => {
    const fs = createDefaultFS();
    const events: FsChangeEvent[] = [];
    fs.subscribe((e) => events.push(e));

    fs.mkdir('/home/kullanici/a/b/c', { parents: true });
    expect(events.map((e) => e.path)).toEqual([
      '/home/kullanici/a',
      '/home/kullanici/a/b',
      '/home/kullanici/a/b/c',
    ]);

    expect(fs.readdir('/home/kullanici').some((n) => n.name === 'a')).toBe(true);
    expect(fs.readdir('/home/kullanici/a').some((n) => n.name === 'b')).toBe(true);
    expect(fs.readdir('/home/kullanici/a/b').some((n) => n.name === 'c')).toBe(true);
  });

  it('updates file tree node listing when node is removed or moved', () => {
    const fs = createDefaultFS();
    const listener = vi.fn();
    fs.subscribe(listener);

    expect(fs.exists('/home/kullanici/merhaba.txt')).toBe(true);
    fs.remove('/home/kullanici/merhaba.txt');
    expect(fs.exists('/home/kullanici/merhaba.txt')).toBe(false);
    expect(fs.readdir('/home/kullanici').some((n) => n.name === 'merhaba.txt')).toBe(false);
    expect(listener).toHaveBeenCalledWith({ action: 'delete', path: '/home/kullanici/merhaba.txt' });
  });
});
