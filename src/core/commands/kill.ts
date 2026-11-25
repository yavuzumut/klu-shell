import type { CommandDefinition } from '../shell/types';

export const kill: CommandDefinition = {
  name: 'kill',
  summary: 'Süreçlere sinyal göndererek sonlandırır.',
  usage: 'kill [-9 | -s SİNYAL] PID...',
  completion: 'none',
  manPage: `AD
    kill - süreçlere sonlandırma sinyali gönderir

KULLANIM
    kill [-SİNYAL] PID...

AÇIKLAMA
    Belirtilen süreç kimlik numarasına (PID) sahip sürece bir sinyal gönderir.
    Varsayılan sinyal SIGTERM (15 - nazikçe kapanma isteği) sinyalidir.
    Zorla kapatmak için -9 (SIGKILL) sinyali kullanılır.

SEÇENEKLER
    -9, -KILL    süreci beklemeden anında zorla öldür (SIGKILL)
    -15, -TERM   süreci nazikçe sonlandır (SIGTERM - varsayılan)

ÖRNEKLER
    kill 1420
    kill -9 1420
    kill -15 2048`,
  run(args, ctx) {
    if (args.length === 0) {
      ctx.stderr('kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]\n');
      return 1;
    }

    const pids: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === '-s') {
        i++; // skip signal specifier
        continue;
      }
      if (a.startsWith('-')) {
        // e.g. -9, -15, -KILL, -SIGTERM
        continue;
      }
      pids.push(a);
    }

    if (pids.length === 0) {
      ctx.stderr('kill: missing process id\n');
      return 1;
    }

    let exitCode = 0;
    for (const pidStr of pids) {
      const pid = parseInt(pidStr, 10);
      if (isNaN(pid) || String(pid) !== pidStr) {
        ctx.stderr(`bash: kill: ${pidStr}: arguments must be process or job IDs\n`);
        exitCode = 1;
        continue;
      }

      if (pid === 1) {
        ctx.stderr('bash: kill: (1): Operation not permitted\n');
        exitCode = 1;
        continue;
      }

      const killed = ctx.shell.killProcess(pid);
      if (!killed) {
        ctx.stderr(`bash: kill: (${pid}): No such process\n`);
        exitCode = 1;
      }
    }

    return exitCode;
  },
};
