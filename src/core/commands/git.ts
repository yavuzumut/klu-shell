import { formatLog, formatStatus, GitRepo } from '../git';
import type { CommandDefinition } from '../shell/types';

const HELP_TEXT = `kullanım: git <komut> [<seçenekler>]

KLU Sanal Git (Git 1) komutları:
   init       Yeni bir Git deposu başlatır
   status     Çalışma ağacı ve hazırlık alanının durumunu gösterir
   add        Dosya içeriklerini hazırlık alanına (staging) ekler
   commit     Değişiklikleri yeni bir commit olarak kaydeder
   log        Commit geçmişini listeler

Ayrıntılı bilgi için: man git
`;

export const git: CommandDefinition = {
  name: 'git',
  summary: 'Sanal sürüm kontrol sistemi (init, status, add, commit, log)',
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
    init [dizin]
        Yeni bir Git deposu başlatır (.git klasörü oluşturur).
        Varsayılan dal adı: main.

    status
        Bulunulan dalı, hazırlık alanındaki (staged) değişiklikleri,
        değiştirilmiş fakat hazırlık alanına alınmamış dosyaları ve
        takip edilmeyen (untracked) dosyaları renkli olarak listeler.

    add <dosya... | . | -A>
        Dosyaları hazırlık alanına (staging area / index) ekler.
        '.' bulunulan dizin ve altındaki dosyaları, '-A' tüm depoyu ekler.

    commit -m "mesaj"
        Hazırlık alanındaki değişiklikleri benzersiz kısa bir hash (7 karakter),
        tarih, yazar ve commit mesajı ile depoya kaydeder.

    log [--oneline]
        Commit geçmişini yeniden eskiye doğru listeler.
        --oneline parametresi her commit'i tek bir satırda özetler.

ÖRNEKLER
    git init
    git status
    git add .
    git commit -m "İlk commit"
    git log
    git log --oneline`,

  run(args, ctx) {
    if (args.length === 0) {
      ctx.stderr(HELP_TEXT);
      return 1;
    }

    const sub = args[0];

    if (sub === '--help' || sub === '-h') {
      ctx.stdout(HELP_TEXT);
      return 0;
    }

    // git init [targetDir]
    if (sub === 'init') {
      const targetDir = args[1] ? ctx.resolve(args[1]) : ctx.cwd;
      const { isReinit } = GitRepo.init(ctx.fs, targetDir);
      const gitPath = ctx.fs.resolve('.git', targetDir);
      if (isReinit) {
        ctx.stdout(`Reinitialized existing Git repository in ${gitPath}/\n`);
      } else {
        ctx.stdout(`Initialized empty Git repository in ${gitPath}/\n`);
      }
      return 0;
    }

    // All other commands require an existing repository
    const repo = GitRepo.find(ctx.fs, ctx.cwd);
    if (!repo) {
      ctx.stderr('fatal: not a git repository (or any of the parent directories): .git\n');
      return 128;
    }

    // git status
    if (sub === 'status') {
      const status = repo.getStatus();
      ctx.stdout(formatStatus(status));
      return 0;
    }

    // git add <patterns...>
    if (sub === 'add') {
      const patterns = args.slice(1);
      if (patterns.length === 0) {
        ctx.stderr("Nothing specified, nothing added.\nMaybe you wanted to say 'git add .'?\n");
        return 0;
      }
      try {
        repo.add(patterns, ctx.cwd);
        return 0;
      } catch (err) {
        ctx.stderr(`${err instanceof Error ? err.message : String(err)}\n`);
        return 1;
      }
    }

    // git commit -m "msg"
    if (sub === 'commit') {
      const subargs = args.slice(1);
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

      if (message === null) {
        ctx.stderr("error: switch 'm' requires a value\n");
        return 1;
      }

      if (!message.trim()) {
        ctx.stderr('Aborting commit due to empty commit message.\n');
        return 1;
      }

      try {
        const parentCommit = repo.getHeadCommit();
        const parentTree = parentCommit?.tree ?? {};
        const commit = repo.commit(message, ctx.fs.user);

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
          `[${branch}${rootTag} ${commit.shortHash}] ${commit.message}\n` +
            ` ${changedCount} file${changedCount === 1 ? '' : 's'} changed\n`,
        );
        return 0;
      } catch {
        const status = repo.getStatus();
        ctx.stdout(formatStatus(status));
        return 1;
      }
    }

    // git log [--oneline]
    if (sub === 'log') {
      const subargs = args.slice(1);
      const oneline = subargs.includes('--oneline');
      const commits = repo.getLog();

      if (commits.length === 0) {
        const branch = repo.getCurrentBranch() ?? 'main';
        ctx.stderr(`fatal: your current branch '${branch}' does not have any commits yet\n`);
        return 128;
      }

      const formatted = formatLog(commits, {
        oneline,
        branch: repo.getCurrentBranch() ?? 'main',
      });
      ctx.stdout(formatted);
      return 0;
    }

    // Invalid subcommand
    ctx.stderr(`git: '${sub}' is not a git command. See 'git --help'.\n`);
    return 1;
  },
};
