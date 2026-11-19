/**
 * Command catalogue. To add a new command:
 *   1. Create `src/core/commands/<name>.ts` exporting a CommandDefinition
 *   2. Import it here and add it to ALL_COMMANDS
 *   3. Add tests in `src/core/commands/commands.test.ts`
 */
import { CommandRegistry } from '../shell/registry';
import type { CommandDefinition } from '../shell/types';
import { cat } from './cat';
import { cd } from './cd';
import { clear } from './clear';
import { cp } from './cp';
import { echo } from './echo';
import { help } from './help';
import { history } from './history';
import { ls } from './ls';
import { man } from './man';
import { mkdir } from './mkdir';
import { mv } from './mv';
import { pwd } from './pwd';
import { rm } from './rm';
import { touch } from './touch';

export const ALL_COMMANDS: CommandDefinition[] = [
  pwd,
  ls,
  cd,
  mkdir,
  touch,
  cat,
  echo,
  cp,
  mv,
  rm,
  clear,
  help,
  man,
  history,
];

export function createRegistry(commands: CommandDefinition[] = ALL_COMMANDS): CommandRegistry {
  const registry = new CommandRegistry();
  commands.forEach((c) => registry.register(c));
  return registry;
}
