import { FsError, fsErrorMessage, type VirtualFS } from '../fs/VirtualFS';
import { expandGlob } from './glob';
import { parse, ParseError, type Pipeline, type SimpleCommand } from './parser';
import type { CommandRegistry } from './registry';
import type { CommandContext, CommandRecord, OutputChunk, ShellProcess } from './types';

export interface ShellOptions {
  fs: VirtualFS;
  registry: CommandRegistry;
  cwd?: string;
  hostname?: string;
  history?: string[];
  processes?: ShellProcess[];
}

type Listener = (record: CommandRecord) => void;

const MAX_HISTORY = 500;

/** Executes command lines against a virtual file system. UI agnostic. */
export class Shell {
  fs: VirtualFS;
  readonly registry: CommandRegistry;
  readonly hostname: string;
  cwd: string;
  prevCwd: string | null = null;
  env: Record<string, string>;
  history: string[];
  lastExitCode = 0;
  processes: ShellProcess[];
  private listeners = new Set<Listener>();

  constructor(options: ShellOptions) {
    this.fs = options.fs;
    this.registry = options.registry;
    this.hostname = options.hostname ?? 'klu';
    this.cwd = options.cwd ?? this.fs.home;
    this.history = options.history ? [...options.history] : [];
    this.env = this.defaultEnv();
    this.processes = options.processes ? [...options.processes] : this.defaultProcesses();
  }

  defaultProcesses(): ShellProcess[] {
    return [
      {
        pid: 1,
        user: 'root',
        cpu: '0.0',
        mem: '0.1',
        vsz: 21580,
        rss: 4028,
        tty: '?',
        stat: 'Ss',
        start: '00:00',
        time: '0:01',
        command: '/sbin/init',
      },
      {
        pid: 85,
        user: 'root',
        cpu: '0.0',
        mem: '0.1',
        vsz: 8340,
        rss: 2100,
        tty: '?',
        stat: 'Ss',
        start: '00:00',
        time: '0:00',
        command: '/usr/sbin/cron',
      },
      {
        pid: 100,
        user: this.fs.user,
        cpu: '0.0',
        mem: '0.2',
        vsz: 14200,
        rss: 5120,
        tty: 'pts/0',
        stat: 'Ss',
        start: '00:00',
        time: '0:00',
        command: 'bash',
      },
    ];
  }

  addProcess(proc: Partial<ShellProcess> & { pid: number; command: string }): void {
    const full: ShellProcess = {
      pid: proc.pid,
      user: proc.user ?? this.fs.user,
      cpu: proc.cpu ?? '0.0',
      mem: proc.mem ?? '0.1',
      vsz: proc.vsz ?? 12000,
      rss: proc.rss ?? 3200,
      tty: proc.tty ?? 'pts/0',
      stat: proc.stat ?? 'S',
      start: proc.start ?? '00:01',
      time: proc.time ?? '0:00',
      command: proc.command,
    };
    this.processes = [...this.processes.filter((p) => p.pid !== proc.pid), full];
  }

  killProcess(pid: number): boolean {
    const exists = this.processes.some((p) => p.pid === pid);
    if (exists) {
      this.processes = this.processes.filter((p) => p.pid !== pid);
      return true;
    }
    return false;
  }

  private defaultEnv(): Record<string, string> {
    const env: Record<string, string> = Object.create(null);
    Object.assign(env, {
      HOME: this.fs.home,
      USER: this.fs.user,
      LOGNAME: this.fs.user,
      SHELL: '/bin/bash',
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOSTNAME: this.hostname,
      LANG: 'tr_TR.UTF-8',
      PWD: this.cwd,
      '?': '0',
    });
    return env;
  }

  /** Replace the file system (e.g. when a lesson starts) and reset the cwd. */
  reset(fs: VirtualFS, cwd?: string, extraProcesses?: (Partial<ShellProcess> & { pid: number; command: string })[]): void {
    this.fs = fs;
    this.cwd = cwd ? fs.resolve(cwd) : fs.home;
    this.prevCwd = null;
    this.lastExitCode = 0;
    this.env = this.defaultEnv();
    this.processes = this.defaultProcesses();
    if (extraProcesses) {
      for (const p of extraProcesses) {
        this.addProcess(p);
      }
    }
  }

  /** Coloured prompt, e.g. `kullanici@klu:~$ `. */
  get prompt(): string {
    const symbol = this.fs.user === 'root' ? '#' : '$';
    return `\x1b[1;32m${this.fs.user}@${this.hostname}\x1b[0m:\x1b[1;34m${this.fs.prettyPath(this.cwd)}\x1b[0m${symbol} `;
  }

  setCwd(abs: string): void {
    if (abs !== this.cwd) this.prevCwd = this.cwd;
    this.cwd = abs;
    this.env.PWD = abs;
    if (this.prevCwd) this.env.OLDPWD = this.prevCwd;
  }

  onExecute(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Parse and run a full command line. */
  async execute(line: string, options?: { recordHistory?: boolean }): Promise<CommandRecord> {
    const output: OutputChunk[] = [];
    const commands: string[][] = [];
    const cwdBefore = this.cwd;
    const trimmed = line.trim();
    const recordHistory = options?.recordHistory ?? true;

    if (trimmed && recordHistory) {
      if (this.history[this.history.length - 1] !== trimmed) this.history.push(trimmed);
      if (this.history.length > MAX_HISTORY) this.history.shift();
    }

    const term = {
      stdout: (text: string) => text && output.push({ stream: 'stdout', text }),
      stderr: (text: string) => text && output.push({ stream: 'stderr', text }),
    };

    let exitCode = this.lastExitCode;
    if (trimmed) {
      try {
        const list = parse(trimmed, { vars: this.env, home: this.fs.home });
        let prevOp: string | null = null;
        for (const item of list.items) {
          const skip = (prevOp === '&&' && exitCode !== 0) || (prevOp === '||' && exitCode === 0);
          if (!skip) exitCode = await this.runPipeline(item.pipeline, term, commands);
          prevOp = item.next;
        }
      } catch (err) {
        if (err instanceof ParseError) {
          term.stderr(`bash: ${err.message}\n`);
          exitCode = 2;
        } else {
          term.stderr(`bash: ${err instanceof Error ? err.message : String(err)}\n`);
          exitCode = 1;
        }
      }
    }

    this.lastExitCode = exitCode;
    this.env['?'] = String(exitCode);

    const record: CommandRecord = {
      line: trimmed,
      commands,
      exitCode,
      output,
      stdout: output.filter((c) => c.stream === 'stdout').map((c) => c.text).join(''),
      stderr: output.filter((c) => c.stream === 'stderr').map((c) => c.text).join(''),
      cwdBefore,
      cwdAfter: this.cwd,
    };
    if (trimmed) this.listeners.forEach((l) => l(record));
    return record;
  }

  private async runPipeline(
    pipeline: Pipeline,
    term: { stdout(t: string): void; stderr(t: string): void },
    commands: string[][],
  ): Promise<number> {
    let stdin: string | null = null;
    let exitCode = 0;
    const count = pipeline.commands.length;

    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const cmd = pipeline.commands[i];
      let argv: string[];
      try {
        argv = this.expandWords(cmd);
      } catch (err) {
        term.stderr(`bash: ${fsErrorMessage(err)}\n`);
        return 1;
      }

      // Variable assignments like FOO=bar (only when no command follows)
      if (argv.length && argv.every((a) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(a))) {
        for (const a of argv) {
          const eq = a.indexOf('=');
          this.env[a.slice(0, eq)] = a.slice(eq + 1);
        }
        commands.push(argv);
        stdin = '';
        continue;
      }

      let captured = '';
      let stdoutRedirect: { path: string; append: boolean } | null = null;
      let stderrRedirect: { path: string; append: boolean } | null = null;
      let redirectError = false;

      for (const r of cmd.redirects) {
        const path = this.fs.resolve(r.target.value, this.cwd);
        if (r.op === '<') {
          try {
            stdin = this.fs.readFile(path);
          } catch (err) {
            term.stderr(`bash: ${r.target.value}: ${fsErrorMessage(err)}\n`);
            redirectError = true;
          }
        } else {
          const target = { path, append: r.op.endsWith('>>') };
          // Create/truncate the file immediately, like bash does.
          try {
            if (!target.append || !this.fs.exists(path)) this.fs.writeFile(path, '');
          } catch (err) {
            term.stderr(`bash: ${r.target.value}: ${fsErrorMessage(err)}\n`);
            redirectError = true;
          }
          if (r.op.startsWith('2')) stderrRedirect = target;
          else stdoutRedirect = target;
        }
      }
      if (redirectError) {
        exitCode = 1;
        stdin = '';
        continue;
      }

      if (!argv.length) {
        stdin = '';
        continue;
      }
      commands.push(argv);

      const toTerminal = isLast && !stdoutRedirect;
      let errBuffer = '';
      const ctx: CommandContext = {
        name: argv[0],
        fs: this.fs,
        shell: this,
        cwd: this.cwd,
        env: this.env,
        stdin,
        isTTY: toTerminal,
        stdout: (text) => {
          if (toTerminal) term.stdout(text);
          else captured += text;
        },
        stderr: (text) => {
          if (stderrRedirect) errBuffer += text;
          else term.stderr(text);
        },
        resolve: (p) => this.fs.resolve(p, this.cwd),
      };

      exitCode = await this.runCommand(argv, ctx);

      if (stdoutRedirect) this.fs.writeFile(stdoutRedirect.path, captured, { append: true });
      if (stderrRedirect) this.fs.writeFile(stderrRedirect.path, errBuffer, { append: true });
      stdin = stdoutRedirect ? '' : captured;
    }
    return exitCode;
  }

  private async runCommand(argv: string[], ctx: CommandContext): Promise<number> {
    const [name, ...args] = argv;
    const def = this.registry.get(name);
    if (!def) {
      if (name.includes('/')) {
        const abs = this.fs.resolve(name, this.cwd);
        const node = this.fs.tryLookup(abs);
        if (!node) {
          ctx.stderr(`bash: ${name}: No such file or directory\n`);
          return 127;
        }
        if (node.type === 'dir') {
          ctx.stderr(`bash: ${name}: Is a directory\n`);
          return 126;
        }
        if ((node.mode & 0o111) === 0) {
          ctx.stderr(`bash: ${name}: Permission denied\n`);
          return 126;
        }
        const lines = node.content.split('\n');
        let code = 0;
        for (const raw of lines) {
          const trimmed = raw.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const rec = await this.execute(trimmed, { recordHistory: false });
          code = rec.exitCode;
          if (rec.stdout) ctx.stdout(rec.stdout);
          if (rec.stderr) ctx.stderr(rec.stderr);
          if (code !== 0) break;
        }
        return code;
      }
      ctx.stderr(`bash: ${name}: command not found\n`);
      return 127;
    }
    if (args.includes('--help')) {
      ctx.stdout(`Kullanım: ${def.usage}\n${def.summary}\n\nAyrıntılı bilgi için: man ${def.name}\n`);
      return 0;
    }
    try {
      return await def.run(args, ctx);
    } catch (err) {
      if (err instanceof FsError) ctx.stderr(`${name}: ${err.path}: ${err.description}\n`);
      else ctx.stderr(`${name}: ${err instanceof Error ? err.message : String(err)}\n`);
      return 1;
    }
  }

  private expandWords(cmd: SimpleCommand): string[] {
    const out: string[] = [];
    for (const w of cmd.words) {
      if (w.glob) out.push(...expandGlob(w.value, this.fs, this.cwd));
      else out.push(w.value);
    }
    return out;
  }
}
