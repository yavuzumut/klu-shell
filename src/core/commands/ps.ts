import type { CommandDefinition, ShellProcess } from '../shell/types';

export const ps: CommandDefinition = {
  name: 'ps',
  summary: 'Çalışan süreçleri (prosesleri) listeler.',
  usage: 'ps [-ef | aux]',
  completion: 'none',
  manPage: `AD
    ps - mevcut süreç durumlarını raporlar (process status)

KULLANIM
    ps [SEÇENEK]...

AÇIKLAMA
    Sistemde veya geçerli terminalde çalışan süreçlerin kimlik numarasını (PID),
    kullanıcısını, CPU/bellek kullanımını ve komutunu görüntüler.

SEÇENEKLER
    aux       tüm kullanıcıların çalışan tüm süreçlerini ayrıntılı listele
    -ef       sistemdeki tüm süreçleri tam biçimde listele

ÖRNEKLER
    ps
    ps aux
    ps aux | grep worker`,
  run(args, ctx) {
    const isAux = args.some((a) => a === 'aux' || a === '-aux' || a === '-ef' || a === '-e' || a === '-f');

    const processes: ShellProcess[] = ctx.shell.processes ? [...ctx.shell.processes] : [];
    const psPid = Math.max(105, ...processes.map((p) => p.pid)) + 1;
    const psCmd = args.length ? `ps ${args.join(' ')}` : 'ps';

    if (isAux) {
      const all: ShellProcess[] = [
        ...processes,
        {
          pid: psPid,
          user: ctx.fs.user,
          cpu: '0.0',
          mem: '0.1',
          vsz: 10200,
          rss: 2800,
          tty: 'pts/0',
          stat: 'R+',
          start: '00:00',
          time: '0:00',
          command: psCmd,
        },
      ];

      const header = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n';
      const rows = all.map((p) => {
        const u = ctx.shell.displayName(p.user).padEnd(8).slice(0, 8);
        const pid = String(p.pid).padStart(5);
        const cpu = p.cpu.padStart(4);
        const mem = p.mem.padStart(4);
        const vsz = String(p.vsz).padStart(6);
        const rss = String(p.rss).padStart(5);
        const tty = p.tty.padEnd(8);
        const stat = p.stat.padEnd(4);
        const start = p.start.padEnd(5);
        const time = p.time.padStart(6);
        return `${u} ${pid} ${cpu} ${mem} ${vsz} ${rss} ${tty} ${stat} ${start} ${time} ${p.command}`;
      });

      ctx.stdout(header + rows.join('\n') + '\n');
      return 0;
    }

    // Default minimal ps: only processes on pts/0 or user's processes
    const userProcs = processes.filter((p) => p.tty !== '?');
    const rows = [
      ...userProcs,
      {
        pid: psPid,
        user: ctx.fs.user,
        cpu: '0.0',
        mem: '0.1',
        vsz: 10200,
        rss: 2800,
        tty: 'pts/0',
        stat: 'R+',
        start: '00:00',
        time: '00:00:00',
        command: 'ps',
      },
    ];

    const header = '  PID TTY          TIME CMD\n';
    const lines = rows.map((p) => {
      const pid = String(p.pid).padStart(5);
      const tty = p.tty.padEnd(8);
      const time = (p.time.includes(':') && p.time.split(':').length === 3 ? p.time : '00:00:00').padStart(8);
      return `${pid} ${tty} ${time} ${p.command}`;
    });

    ctx.stdout(header + lines.join('\n') + '\n');
    return 0;
  },
};
