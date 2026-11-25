import type { CommandDefinition } from '../shell/types';

export const exportCmd: CommandDefinition = {
  name: 'export',
  summary: 'Ortam değişkeni tanımlar veya dışa aktarır.',
  usage: 'export [AD[=DEĞER]]...',
  completion: 'none',
  manPage: `AD
    export - kabuk ortam değişkenlerini dışa aktarır

KULLANIM
    export [-p] [AD[=DEĞER]]...

AÇIKLAMA
    Belirtilen AD değişkenini ortam değişkeni olarak işaretler ve alt süreçlerin
    kullanımına sunar. Değer verilirse değişkenin içeriğini de atar.
    Bağımsız değişken verilmezse dışa aktarılmış tüm değişkenleri listeler.

ÖRNEKLER
    export TEMA=koyu
    export PROJE="KLU Linux"
    export -p`,
  run(args, ctx) {
    if (args.length === 0 || (args.length === 1 && args[0] === '-p')) {
      const keys = Object.keys(ctx.env)
        .filter((k) => k !== '?')
        .sort();
      for (const k of keys) {
        ctx.stdout(`declare -x ${k}="${ctx.env[k]}"\n`);
      }
      return 0;
    }

    let exitCode = 0;
    for (const arg of args) {
      if (arg === '-p') continue;
      const eq = arg.indexOf('=');
      const name = eq >= 0 ? arg.slice(0, eq) : arg;
      const val = eq >= 0 ? arg.slice(eq + 1) : ctx.env[name] ?? '';

      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
        ctx.stderr(`bash: export: '${arg}': not a valid identifier\n`);
        exitCode = 1;
        continue;
      }

      ctx.env[name] = val;
      if (ctx.shell) {
        ctx.shell.env[name] = val;
      }
    }

    return exitCode;
  },
};
