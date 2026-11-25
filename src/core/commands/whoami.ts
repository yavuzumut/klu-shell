import type { CommandDefinition } from '../shell/types';

export const whoami: CommandDefinition = {
  name: 'whoami',
  summary: 'Mevcut kullanıcının adını yazdırır.',
  usage: 'whoami',
  completion: 'none',
  manPage: `AD
    whoami - etkin kullanıcı adını yazdırır

KULLANIM
    whoami

AÇIKLAMA
    Şu anda oturum açmış olan kullanıcının adını ekrana yazar.

ÖRNEK
    $ whoami
    kullanici`,
  run(args, ctx) {
    if (args.length > 0) {
      ctx.stderr(`whoami: extra operand '${args[0]}'\n`);
      return 1;
    }
    const user = ctx.env.USER || ctx.fs.user || 'kullanici';
    ctx.stdout(`${user}\n`);
    return 0;
  },
};
