import { createRegistry } from '../commands';
import { createDefaultFS } from '../fs/defaultTree';
import type { FsSeed } from '../fs/VirtualFS';
import { Shell } from '../shell/Shell';

export const FIXED_NOW = new Date(2024, 10, 19, 10, 30).getTime();

// eslint-disable-next-line no-control-regex
export const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, '');

export function createTestShell(seed?: FsSeed) {
  const fs = createDefaultFS(seed, () => FIXED_NOW);
  const shell = new Shell({ fs, registry: createRegistry() });
  const run = async (line: string) => {
    const r = await shell.execute(line);
    return { ...r, out: stripAnsi(r.stdout), err: stripAnsi(r.stderr) };
  };
  return { fs, shell, run };
}
