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
import { find } from './find';
import { grep } from './grep';
import { head } from './head';
import { help } from './help';
import { history } from './history';
import { ls } from './ls';
import { man } from './man';
import { mkdir } from './mkdir';
import { mv } from './mv';
import { pwd } from './pwd';
import { rm } from './rm';
import { sort } from './sort';
import { tail } from './tail';
import { touch } from './touch';
import { uniq } from './uniq';
import { wc } from './wc';
// Level 3: permissions, system info, environment, processes
import { chmod } from './chmod';
import { whoami } from './whoami';
import { uname } from './uname';
import { date } from './date';
import { env } from './env';
import { exportCmd } from './export';
import { which } from './which';
import { ps } from './ps';
import { kill } from './kill';
import { stat } from './stat';
import { realpath } from './realpath';
import { basename } from './basename';
import { git } from './git';

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
  // Level 2: text processing and searching
  head,
  tail,
  wc,
  grep,
  sort,
  uniq,
  find,
  // Level 3: permissions, system info, environment, processes, file inspection
  chmod,
  whoami,
  uname,
  date,
  env,
  exportCmd,
  which,
  ps,
  kill,
  stat,
  realpath,
  basename,
  // Git (Interactive Git Module)
  git,
];

export function createRegistry(commands: CommandDefinition[] = ALL_COMMANDS): CommandRegistry {
  const registry = new CommandRegistry();
  commands.forEach((c) => registry.register(c));
  return registry;
}
