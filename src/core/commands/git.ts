import {
  formatBranches,
  formatDiff,
  formatLog,
  formatStatus,
  GitRepo,
  type GitConflict,
} from '../git';
import type { CommandDefinition } from '../shell/types';

const HELP_TEXT = `kullanım: git <komut> [<seçenekler>]

KLU Sanal Git (Git 1) komutları:
   init       Yeni bir Git deposu başlatır
   status     Çalışma ağacı ve hazırlık alanının durumunu gösterir
   add        Dosya içeriklerini hazırlık alanına (staging) ekler
   commit     Değişiklikleri yeni bir commit olarak kaydeder
   log        Commit geçmişini listeler

Git 2 — farklar ve geri alma:
   diff       Değişen satırları gösterir (--staged: hazırlık alanı)
   restore    Değişiklikleri geri alır (--staged: hazırlıktan çıkarır)

Git 3 — dallar:
   branch     Dalları listeler, oluşturur veya siler
   switch     Başka bir dala geçer (-c: yeni dal oluşturup geçer)
   merge      Bir dalı bulunulan dala birleştirir

Git 4 — uzak depolar:
   clone      Uzak depoyu klonlar
   remote     Uzak depo bağlantılarını yönetir (-v, add, remove)
   push       Commit'leri uzak depoya gönderir (-u: upstream ayarla)
   pull       Uzak depodaki değişiklikleri çeker ve birleştirir

Ayrıntılı bilgi için: man git
`;

const EN_HELP_TEXT = `usage: git <command> [<args>]

KLU Virtual Git commands:
   init       Create an empty Git repository
   status     Show the working tree and staging status
   add        Add file contents to the staging area
   commit     Record changes to the repository
   log        Show commit logs

Git 2 — diff and restore:
   diff       Show changes between commits, commit and working tree, etc
   restore    Restore working tree files or unstage files (--staged)

Git 3 — branches:
   branch     List, create, or delete branches
   switch     Switch branches (-c: create and switch)
   merge      Join two or more development histories together

Git 4 — remotes:
   clone      Clone a repository into a new directory
   remote     Manage set of tracked repositories (-v, add, remove)
   push       Update remote refs along with associated objects
   pull       Fetch from and integrate with another repository

For more information: man git
`;

const errMsg = (err: unknown) => (err instanceof Error ? err.message : String(err));

function plural(n: number): string {
  return `${n} file${n === 1 ? '' : 's'} changed`;
}

function conflictLine(c: GitConflict, branch: string, displayPath: (path: string) => string, displayName: (name: string) => string): string {
  const path = displayPath(c.path);
  const branchName = displayName(branch);
  switch (c.kind) {
    case 'deleted by us':
      return `CONFLICT (modify/delete): ${path} deleted in HEAD and modified in ${branchName}.`;
    case 'deleted by them':
      return `CONFLICT (modify/delete): ${path} deleted in ${branchName} and modified in HEAD.`;
    case 'both added':
      return `CONFLICT (add/add): Merge conflict in ${path}`;
    default:
      return `CONFLICT (content): Merge conflict in ${path}`;
  }
}

export const git: CommandDefinition = {
  name: 'git',
  summary:
    'Sanal sürüm kontrol sistemi (init, status, add, commit, log, diff, restore, branch, switch, merge, clone, remote, push, pull)',
  usage: 'git <alt-komut> [seçenekler]',
  completion: 'files',
  manPage: `AD
    git - sanal sürüm kontrol sistemi

KULLANIM
    git <alt-komut> [seçenekler]

AÇIKLAMA
    Git; dosyalardaki değişiklikleri adım adım kaydeden, geçmişe dönmeyi sağlayan
    ve projeleri güvenle yönetmeye yarayan bir sürüm kontrol sistemidir.

ALT KOMUTLAR (Git 1)
    init [--bare] [dizin]
        Yeni bir Git deposu başlatır (.git klasörü oluşturur).
        --bare seçeneği ile doğrudan nesne tabanlı uzak depo oluşturulur.
        Varsayılan dal adı: main.

    status
        Bulunulan dalı, hazırlık alanındaki (staged) değişiklikleri,
        değiştirilmiş fakat hazırlık alanına alınmamış dosyaları ve
        takip edilmeyen (untracked) dosyaları renkli olarak listeler.

    add <dosya... | . | -A> [-f]
        Dosyaları hazırlık alanına (staging area / index) ekler.
        '.' bulunulan dizin ve altındaki dosyaları, '-A' tüm depoyu ekler.
        .gitignore ile yok sayılan dosyalar eklenmez (-f ile zorlanabilir).

    commit -m "mesaj"
        Hazırlık alanındaki değişiklikleri benzersiz kısa bir hash (7 karakter),
        tarih, yazar ve commit mesajı ile depoya kaydeder.

    log [--oneline]
        Commit geçmişini yeniden eskiye doğru listeler.
        --oneline parametresi her commit'i tek bir satırda özetler.

ALT KOMUTLAR (Git 2)
    .gitignore
        Depo kökündeki .gitignore dosyasındaki kalıplar (*.log, node_modules/,
        gizli.txt ...) takip edilmeyen dosyalar listesinden ve 'git add .'
        işleminden hariç tutulur.

    diff [--staged | --cached] [dosya...]
        Argümansız: çalışma alanı ile hazırlık alanı arasındaki farkları,
        --staged ile: hazırlık alanı ile son commit arasındaki farkları gösterir.
        Silinen satırlar kırmızı (-), eklenen satırlar yeşil (+) renklidir.

    restore [--staged] <dosya...>
        Argümansız: çalışma alanındaki kaydedilmemiş değişiklikleri geri alır.
        --staged ile: dosyayı hazırlık alanından çıkarır (içeriğe dokunmaz).

ALT KOMUTLAR (Git 3)
    branch [-d | -D] [dal]
        Argümansız: dalları listeler, aktif dalı '*' ile işaretler.
        'git branch <dal>' yeni dal oluşturur, '-d' birleştirilmiş dalı,
        '-D' ise birleştirilmemiş olsa bile dalı siler.

    switch [-c] <dal>
        Belirtilen dala geçer ve çalışma alanını o dalın son commit'ine
        göre günceller. Kaydedilmemiş değişiklikler kaybolacaksa geçişi durdurur.
        -c yeni bir dal oluşturup doğrudan o dala geçer.

    merge <dal> | --abort
        Dalı bulunulan dala birleştirir: mümkünse fast-forward yapar,
        değilse merge commit oluşturur. Aynı dosya iki dalda farklı
        değiştirilmişse çakışma (conflict) bildirir; çakışmayı düzeltip
        'git add' + 'git commit' ile bitirebilir ya da --abort ile iptal edebilirsin.

ALT KOMUTLAR (Git 4)
    clone <url> [klasor]
        Uzak depoyu hedef klasöre klonlar, dosyaları açar ve 'origin' bağlantısını kurar.

    remote [-v | --verbose]
    remote add <ad> <url>
    remote remove <ad>
        Uzak depo bağlantılarını yönetir. '-v' ile URL'leri listeler.

    push [-u | --set-upstream] [uzak] [dal]
        Commit'leri uzak depoya aktarır. '-u' ile upstream ayarı kaydedilir.

    pull [uzak] [dal]
        Uzak depodaki değişiklikleri çeker ve mevcut dala birleştirir.

ÖRNEKLER
    git init
    git status
    git add .
    git commit -m "İlk commit"
    git log --oneline
    git diff
    git branch ozellik
    git switch -c deneme
    git merge ozellik
    git clone https://github.com/klu/notlar.git
    git remote add origin https://github.com/klu/notlar.git
    git remote -v
    git push -u origin main
    git pull`,

  run(args, ctx) {
    if (args.length === 0) {
      ctx.stderr(ctx.shell.lang === 'en' ? EN_HELP_TEXT : HELP_TEXT);
      return 1;
    }

    const sub = args[0];

    if (sub === '--help' || sub === '-h') {
      ctx.stdout(ctx.shell.lang === 'en' ? EN_HELP_TEXT : HELP_TEXT);
      return 0;
    }

    // git init [--bare] [targetDir]
    if (sub === 'init') {
      let isBare = false;
      const targetArgs: string[] = [];
      for (const a of args.slice(1)) {
        if (a === '--bare') isBare = true;
        else targetArgs.push(a);
      }
      const targetDir = targetArgs[0] ? ctx.resolve(targetArgs[0]) : ctx.cwd;
      const { isReinit } = GitRepo.init(ctx.fs, targetDir, 'main', { bare: isBare });
      const gitPath = isBare ? ctx.resolve(targetDir) : ctx.fs.resolve('.git', targetDir);
      if (isReinit) {
        ctx.stdout(`Reinitialized existing Git repository in ${ctx.shell.displayPath(gitPath)}/\n`);
      } else {
        ctx.stdout(`Initialized empty Git repository in ${ctx.shell.displayPath(gitPath)}/\n`);
      }
      return 0;
    }

    // git clone <url> [targetDir]
    if (sub === 'clone') {
      const cloneArgs = args.slice(1).filter((a) => !a.startsWith('-'));
      if (cloneArgs.length === 0) {
        ctx.stderr('fatal: You must specify a repository to clone.\nusage: git clone <url> [directory]\n');
        return 128;
      }
      const url = cloneArgs[0];
      const target = cloneArgs[1] ? ctx.shell.canonicalizePathInput(cloneArgs[1]) : undefined;
      try {
        GitRepo.clone(ctx.fs, url, target, ctx.cwd);
        const folderName = target || url.trim().replace(/\.git\/?$/, '').split(/[/:]+/).pop() || 'repo';
        ctx.stdout(`Cloning into '${ctx.shell.displayName(folderName)}'...\ndone.\n`);
        return 0;
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 128;
      }
    }

    // All other commands require an existing repository
    const repo = GitRepo.find(ctx.fs, ctx.cwd);
    if (!repo) {
      ctx.stderr('fatal: not a git repository (or any of the parent directories): .git\n');
      return 128;
    }

    const subargs = args.slice(1);
    const canonicalBranchName = (name: string) => ctx.shell.canonicalizePathInput(name);

    // git status
    if (sub === 'status') {
      const status = repo.getStatus();
      ctx.stdout(formatStatus(status, (path) => ctx.shell.displayPath(path), (name) => ctx.shell.displayName(name)));
      return 0;
    }

    // git add <patterns...>
    if (sub === 'add') {
      const patterns = subargs;
      if (patterns.length === 0) {
        ctx.stderr("Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?\n");
        return 0;
      }
      try {
        repo.add(patterns.map((path) => ctx.shell.canonicalizePathInput(path)), ctx.cwd);
        return 0;
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 1;
      }
    }

    // git commit -m "msg"
    if (sub === 'commit') {
      let message: string | null = null;

      for (let i = 0; i < subargs.length; i++) {
        const a = subargs[i];
        if (a === '-m' || a === '--message') {
          if (i + 1 >= subargs.length) {
            ctx.stderr("error: switch 'm' requires a value\n");
            return 1;
          }
          message = subargs[++i];
        } else if (a.startsWith('-m')) {
          message = a.slice(2);
        } else if (a.startsWith('--message=')) {
          message = a.slice('--message='.length);
        } else {
          ctx.stderr(`error: unknown option '${a}'\n`);
          return 1;
        }
      }

      // While concluding a merge, the prepared merge message is the default.
      const mergeState = repo.getMergeState();
      if (message === null && mergeState) {
        message = mergeState.message;
      }

      if (message === null) {
        ctx.stderr("error: switch 'm' requires a value\n");
        return 1;
      }

      if (!message.trim()) {
        ctx.stderr('Aborting commit due to empty commit message.\n');
        return 1;
      }

      if (mergeState && mergeState.conflicts.length > 0) {
        try {
          repo.commit(message, ctx.shell.username);
        } catch (err) {
          ctx.stderr(`${errMsg(err)}\n`);
        }
        return 128;
      }

      try {
        const parentCommit = repo.getHeadCommit();
        const parentTree = parentCommit?.tree ?? {};
        const commit = repo.commit(message, ctx.shell.username);

        // Calculate count of changed files
        const allKeys = new Set([...Object.keys(parentTree), ...Object.keys(commit.tree)]);
        let changedCount = 0;
        for (const k of allKeys) {
          if (parentTree[k] !== commit.tree[k]) changedCount++;
        }

        const branch = repo.getCurrentBranch() ?? 'main';
        const isRoot = commit.parent === null;
        const rootTag = isRoot ? ' (root-commit)' : '';
        ctx.stdout(
          `[${ctx.shell.displayName(branch)}${rootTag} ${commit.shortHash}] ${ctx.shell.displayText(commit.message)}\n` +
            ` ${plural(changedCount)}\n`,
        );
        return 0;
      } catch {
        const status = repo.getStatus();
        ctx.stdout(formatStatus(status, (path) => ctx.shell.displayPath(path), (name) => ctx.shell.displayName(name)));
        return 1;
      }
    }

    // git log [--oneline]
    if (sub === 'log') {
      const oneline = subargs.includes('--oneline');
      const commits = repo.getLog();

      if (commits.length === 0) {
        const branch = repo.getCurrentBranch() ?? 'main';
        ctx.stderr(`fatal: your current branch '${ctx.shell.displayName(branch)}' does not have any commits yet\n`);
        return 128;
      }

      const refs: Record<string, string[]> = {};
      for (const b of repo.listBranches()) {
        (refs[b.hash] ??= []).push(b.name);
      }

      const formatted = formatLog(commits, {
        oneline,
        branch: repo.getCurrentBranch() ?? 'main',
        refs,
        lang: ctx.shell.lang,
        localizeName: (name) => ctx.shell.displayName(name),
        localizeText: (text) => ctx.shell.displayText(text),
      });
      ctx.stdout(formatted);
      return 0;
    }

    // git diff [--staged|--cached] [paths...]
    if (sub === 'diff') {
      let staged = false;
      const paths: string[] = [];
      for (const a of subargs) {
        if (a === '--staged' || a === '--cached') staged = true;
        else if (a === '--') continue;
        else if (a.startsWith('-')) {
          ctx.stderr(`error: invalid option: ${a}\n`);
          return 129;
        } else paths.push(a);
      }
      try {
        const specs = paths.length > 0 ? repo.resolvePathspecs(paths.map((path) => ctx.shell.canonicalizePathInput(path)), ctx.cwd) : [''];
        const diffs = staged ? repo.diffStaged(specs) : repo.diffWorking(specs);
        ctx.stdout(formatDiff(diffs, (path) => ctx.shell.displayPath(path)));
        return 0;
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 128;
      }
    }

    // git restore [--staged] [--worktree] <paths...>
    if (sub === 'restore') {
      let staged = false;
      let worktree = false;
      const paths: string[] = [];
      for (const a of subargs) {
        if (a === '--staged' || a === '-S') staged = true;
        else if (a === '--worktree' || a === '-W') worktree = true;
        else if (a === '-SW' || a === '-WS') staged = worktree = true;
        else if (a === '--') continue;
        else if (a.startsWith('-')) {
          ctx.stderr(`error: unknown option '${a.replace(/^-+/, '')}'\n`);
          return 129;
        } else paths.push(a);
      }
      if (paths.length === 0) {
        ctx.stderr('fatal: you must specify path(s) to restore\n');
        return 128;
      }
      try {
        repo.restore(paths.map((path) => ctx.shell.canonicalizePathInput(path)), ctx.cwd, { staged, worktree: worktree || !staged });
        return 0;
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 1;
      }
    }

    // git branch [-d|-D <name...>] [<name>]
    if (sub === 'branch') {
      const flags = subargs.filter((a) => a.startsWith('-'));
      const names = subargs.filter((a) => !a.startsWith('-')).map(canonicalBranchName);
      const del = flags.some((f) => f === '-d' || f === '--delete');
      const forceDel = flags.includes('-D');
      const unknown = flags.find((f) => !['-d', '-D', '--delete', '--list', '-l'].includes(f));
      if (unknown) {
        ctx.stderr(`error: unknown option '${unknown.replace(/^-+/, '')}'\n`);
        return 129;
      }

      if (del || forceDel) {
        if (names.length === 0) {
          ctx.stderr('fatal: branch name required\n');
          return 128;
        }
        let code = 0;
        for (const name of names) {
          try {
            const { hash } = repo.deleteBranch(name, forceDel);
            ctx.stdout(`Deleted branch ${ctx.shell.displayName(name)} (was ${hash.slice(0, 7)}).\n`);
          } catch (err) {
            ctx.stderr(`${errMsg(err)}\n`);
            code = 1;
          }
        }
        return code;
      }

      if (names.length === 0 || flags.includes('--list') || flags.includes('-l')) {
        ctx.stdout(formatBranches(repo.listBranches(), (name) => ctx.shell.displayName(name)));
        return 0;
      }

      if (names.length > 1) {
        ctx.stderr('fatal: too many arguments\n');
        return 128;
      }
      try {
        repo.createBranch(names[0]);
        return 0;
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 128;
      }
    }

    // git switch [-c] <branch>
    if (sub === 'switch') {
      let create = false;
      const names: string[] = [];
      for (const a of subargs) {
        if (a === '-c' || a === '--create') create = true;
        else if (a.startsWith('-')) {
          ctx.stderr(`error: unknown switch '${a.replace(/^-+/, '')}'\n`);
          return 129;
        } else names.push(a);
      }
      if (names.length === 0) {
        ctx.stderr(
          create
            ? "error: switch 'c' requires a value\n"
            : 'fatal: missing branch or commit argument\n',
        );
        return 128;
      }
      const name = canonicalBranchName(names[0]);
      try {
        const { alreadyOn } = repo.switchBranch(name, { create });
        const displayName = ctx.shell.displayName(name);
        if (alreadyOn) ctx.stdout(`Already on '${displayName}'\n`);
        else if (create) ctx.stdout(`Switched to a new branch '${displayName}'\n`);
        else ctx.stdout(`Switched to branch '${displayName}'\n`);
        return 0;
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 1;
      }
    }

    // git merge <branch> | --abort
    if (sub === 'merge') {
      if (subargs.includes('--abort')) {
        try {
          repo.abortMerge();
          return 0;
        } catch (err) {
          ctx.stderr(`${errMsg(err)}\n`);
          return 128;
        }
      }
      const requestedName = subargs.find((a) => !a.startsWith('-'));
      if (!requestedName) {
        ctx.stderr('fatal: No branch specified.\nusage: git merge <branch>\n');
        return 128;
      }
      const name = canonicalBranchName(requestedName);
      try {
        const result = repo.merge(name, ctx.shell.username);
        switch (result.type) {
          case 'up-to-date':
            ctx.stdout('Already up to date.\n');
            return 0;
          case 'fast-forward':
            ctx.stdout(
              `Updating ${result.from}..${result.to}\nFast-forward\n ${plural(result.changedFiles.length)}\n`,
            );
            return 0;
          case 'merge':
            ctx.stdout(
              `Merge made by the 'ort' strategy.\n ${plural(result.changedFiles.length)}\n`,
            );
            return 0;
          case 'conflict': {
            const lines = result.autoMerged.map((p) => `Auto-merging ${ctx.shell.displayPath(p)}`);
            for (const c of result.conflicts) lines.push(conflictLine(c, name, (path) => ctx.shell.displayPath(path), (branch) => ctx.shell.displayName(branch)));
            lines.push('Automatic merge failed; fix conflicts and then commit the result.');
            ctx.stdout(lines.join('\n') + '\n');
            return 1;
          }
        }
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 1;
      }
    }

    // git remote [-v | --verbose] | git remote add <name> <url> | git remote remove <name>
    if (sub === 'remote') {
      if (subargs.length === 0 || subargs[0] === '-v' || subargs[0] === '--verbose') {
        const isVerbose = subargs.includes('-v') || subargs.includes('--verbose');
        const remotes = repo.getRemotes();
        if (remotes.length === 0) {
          return 0;
        }
        if (!isVerbose) {
          ctx.stdout(remotes.map((r) => r.name).join('\n') + '\n');
          return 0;
        }
        const lines: string[] = [];
        for (const r of remotes) {
          lines.push(`${r.name}\t${r.url} (fetch)`);
          lines.push(`${r.name}\t${r.url} (push)`);
        }
        ctx.stdout(lines.join('\n') + '\n');
        return 0;
      }

      const action = subargs[0];
      if (action === 'add') {
        const name = subargs[1];
        const url = subargs[2];
        if (!name || !url) {
          ctx.stderr('usage: git remote add <name> <url>\n');
          return 128;
        }
        try {
          repo.addRemote(name, url);
          return 0;
        } catch (err) {
          ctx.stderr(`${errMsg(err)}\n`);
          return 128;
        }
      }

      if (action === 'remove' || action === 'rm') {
        const name = subargs[1];
        if (!name) {
          ctx.stderr('usage: git remote remove <name>\n');
          return 128;
        }
        try {
          repo.removeRemote(name);
          return 0;
        } catch (err) {
          ctx.stderr(`${errMsg(err)}\n`);
          return 128;
        }
      }

      ctx.stderr(
        `error: Unknown subcommand: ${action}\nusage: git remote [-v] | git remote add <name> <url> | git remote remove <name>\n`,
      );
      return 1;
    }

    // git push [-u | --set-upstream] [remote] [branch]
    if (sub === 'push') {
      let setUpstream = false;
      const positional: string[] = [];
      for (const a of subargs) {
        if (a === '-u' || a === '--set-upstream') {
          setUpstream = true;
        } else if (a.startsWith('-')) {
          ctx.stderr(`error: unknown option '${a.replace(/^-+/, '')}'\n`);
          return 129;
        } else {
          positional.push(a);
        }
      }

      const remoteName = positional[0];
      const branchName = positional[1] ? canonicalBranchName(positional[1]) : undefined;

      try {
        const result = repo.push(remoteName, branchName, { setUpstream });
        const oldShort = result.oldHash ? result.oldHash.slice(0, 7) : null;
        const newShort = result.newHash.slice(0, 7);

        let out = `To ${result.url}\n`;
        if (result.isNewBranch) {
          out += ` * [new branch]      ${ctx.shell.displayName(result.branch)} -> ${ctx.shell.displayName(result.branch)}\n`;
        } else if (oldShort && oldShort !== newShort) {
          out += `   ${oldShort}..${newShort}  ${ctx.shell.displayName(result.branch)} -> ${ctx.shell.displayName(result.branch)}\n`;
        } else {
          out += `Everything up-to-date\n`;
        }

        if (result.setUpstream) {
          out += `Branch '${ctx.shell.displayName(result.branch)}' set up to track remote branch '${ctx.shell.displayName(result.branch)}' from '${result.remote}'.\n`;
        }

        ctx.stdout(out);
        return 0;
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        const msg = errMsg(err);
        return msg.startsWith('fatal:') || msg.startsWith('error: src refspec') ? 128 : 1;
      }
    }

    // git pull [remote] [branch]
    if (sub === 'pull') {
      const positional = subargs.filter((a) => !a.startsWith('-'));
      const remoteName = positional[0];
      const branchName = positional[1] ? canonicalBranchName(positional[1]) : undefined;

      try {
        const result = repo.pull(remoteName, branchName, ctx.shell.username);
        switch (result.type) {
          case 'up-to-date':
            ctx.stdout('Already up to date.\n');
            return 0;
          case 'fast-forward':
            ctx.stdout(
              `Updating ${result.from}..${result.to}\nFast-forward\n ${plural(result.changedFiles.length)}\n`,
            );
            return 0;
          case 'merge':
            ctx.stdout(
              `Merge made by the 'ort' strategy.\n ${plural(result.changedFiles.length)}\n`,
            );
            return 0;
          case 'conflict': {
            const lines = result.autoMerged.map((p) => `Auto-merging ${ctx.shell.displayPath(p)}`);
            for (const c of result.conflicts) lines.push(conflictLine(c, branchName ?? 'FETCH_HEAD', (path) => ctx.shell.displayPath(path), (branch) => ctx.shell.displayName(branch)));
            lines.push('Automatic merge failed; fix conflicts and then commit the result.');
            ctx.stdout(lines.join('\n') + '\n');
            return 1;
          }
        }
      } catch (err) {
        ctx.stderr(`${errMsg(err)}\n`);
        return 1;
      }
    }

    // Invalid subcommand
    ctx.stderr(`git: '${sub}' is not a git command. See 'git --help'.\n`);
    return 1;
  },
};
