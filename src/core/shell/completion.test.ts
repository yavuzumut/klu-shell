import { describe, expect, it } from 'vitest';
import { createTestShell } from '../test/helpers';
import { complete } from './completion';

describe('tab completion', () => {
  it('completes command names', () => {
    const { shell } = createTestShell();
    expect(complete('pw', shell)).toEqual({ line: 'pwd ', options: [] });
    expect(complete('m', shell).options).toEqual(['man', 'mkdir', 'mv']);
    expect(complete('ls | ca', shell).line).toBe('ls | cat ');
  });

  it('completes file and directory names', () => {
    const { shell } = createTestShell();
    expect(complete('cat mer', shell).line).toBe('cat merhaba.txt ');
    expect(complete('cd Bel', shell).line).toBe('cd Belgeler/');
    expect(complete('cat Belgeler/r', shell).line).toBe('cat Belgeler/rapor.txt ');
    expect(complete('ls /e', shell).line).toBe('ls /etc/');
    expect(complete('ls ~/Mu', shell).line).toBe('ls ~/Muzik/');
  });

  it('extends to the common prefix, then lists options', () => {
    const { shell } = createTestShell({ files: { '~/rapor1.txt': '', '~/rapor2.txt': '' } });
    expect(complete('cat ra', shell)).toEqual({ line: 'cat rapor', options: [] });
    expect(complete('cat rapor', shell).options).toEqual(['rapor1.txt', 'rapor2.txt']);
  });

  it('hides dotfiles unless requested and limits cd to dirs', () => {
    const { shell } = createTestShell();
    expect(complete('cat .gi', shell).line).toBe('cat .gizli_not ');
    expect(complete('cd me', shell).line).toBe('cd me');
    expect(complete('ls ', shell).options).not.toContain('.bashrc');
  });

  it('respects the shell cwd', () => {
    const { shell } = createTestShell();
    shell.setCwd('/etc');
    expect(complete('cat hostn', shell).line).toBe('cat hostname ');
  });
});
