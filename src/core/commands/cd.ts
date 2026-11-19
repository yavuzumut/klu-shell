import { fsErrorMessage } from '../fs/VirtualFS';
import type { CommandDefinition } from '../shell/types';

export const cd: CommandDefinition = {
  name: 'cd',
  summary: 'Çalışma dizinini değiştirir.',
  usage: 'cd [DİZİN]',
  completion: 'dirs',
  manPage: `AD
    cd - çalışma dizinini değiştirir (change directory)

KULLANIM
    cd [DİZİN]

AÇIKLAMA
    Bulunduğun dizini DİZİN olarak değiştirir. DİZİN verilmezse ev
    dizinine (~) gider.

ÖZEL YOLLAR
    ~     ev dizinin (/home/kullanici)
    .     bulunduğun dizin
    ..    bir üst dizin
    -     bir önceki dizin
    /     kök dizin

ÖRNEKLER
    cd Belgeler       Belgeler dizinine gir (göreli yol)
    cd /etc           /etc dizinine git (mutlak yol)
    cd ..             bir üst dizine çık
    cd                ev dizinine dön`,
  run(args, ctx) {
    const operands = args.filter((a) => a !== '--');
    if (operands.length > 1) {
      ctx.stderr('bash: cd: too many arguments\n');
      return 1;
    }
    let target = operands[0] ?? ctx.fs.home;
    if (target === '-') {
      if (!ctx.shell.prevCwd) {
        ctx.stderr('bash: cd: OLDPWD not set\n');
        return 1;
      }
      target = ctx.shell.prevCwd;
      ctx.stdout(target + '\n');
    }
    const abs = ctx.resolve(target);
    try {
      const node = ctx.fs.lookup(abs);
      if (node.type !== 'dir') {
        ctx.stderr(`bash: cd: ${target}: Not a directory\n`);
        return 1;
      }
    } catch (err) {
      ctx.stderr(`bash: cd: ${target}: ${fsErrorMessage(err)}\n`);
      return 1;
    }
    ctx.shell.setCwd(abs);
    return 0;
  },
};
