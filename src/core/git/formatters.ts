import { buildHunks, diffLines } from './diff';
import type { GitBranchInfo, GitCommit, GitFileDiff, GitStatusResult } from './types';

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatGitDate(timestamp: number): string {
  const d = new Date(timestamp);
  const dayName = DAYS[d.getDay()] ?? 'Sun';
  const monthName = MONTHS[d.getMonth()] ?? 'Jan';
  const day = d.getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const year = d.getFullYear();
  return `${dayName} ${monthName} ${day} ${time} ${year} +0000`;
}

export function formatStatus(status: GitStatusResult): string {
  const lines: string[] = [];
  lines.push(`On branch ${status.branch}`);

  const merging = status.merging;
  const hasUnmerged = (merging?.conflicts.length ?? 0) > 0;
  if (merging) {
    if (hasUnmerged) {
      lines.push('You have unmerged paths.');
      lines.push('  (fix conflicts and run "git commit")');
      lines.push('  (use "git merge --abort" to abort the merge)');
    } else {
      lines.push('All conflicts fixed but you are still merging.');
      lines.push('  (use "git commit" to conclude merge)');
    }
  }

  if (status.isInitial) {
    lines.push('\nNo commits yet\n');
  }

  const hasStaged =
    status.staged.newFiles.length > 0 ||
    status.staged.modifiedFiles.length > 0 ||
    status.staged.deletedFiles.length > 0;

  const hasUnstaged =
    status.unstaged.modifiedFiles.length > 0 || status.unstaged.deletedFiles.length > 0;

  const hasUntracked = status.untracked.length > 0;

  if (hasStaged) {
    if (!status.isInitial) lines.push('');
    lines.push('Changes to be committed:');
    lines.push('  (use "git restore --staged <file>..." to unstage)');
    for (const file of status.staged.newFiles) {
      lines.push(`\t${ANSI.green}new file:   ${file}${ANSI.reset}`);
    }
    for (const file of status.staged.modifiedFiles) {
      lines.push(`\t${ANSI.green}modified:   ${file}${ANSI.reset}`);
    }
    for (const file of status.staged.deletedFiles) {
      lines.push(`\t${ANSI.green}deleted:    ${file}${ANSI.reset}`);
    }
  }

  if (hasUnstaged) {
    lines.push('');
    lines.push('Changes not staged for commit:');
    lines.push('  (use "git add <file>..." to update what will be committed)');
    lines.push('  (use "git restore <file>..." to discard changes in working directory)');
    for (const file of status.unstaged.modifiedFiles) {
      lines.push(`\t${ANSI.red}modified:   ${file}${ANSI.reset}`);
    }
    for (const file of status.unstaged.deletedFiles) {
      lines.push(`\t${ANSI.red}deleted:    ${file}${ANSI.reset}`);
    }
  }

  if (hasUnmerged) {
    lines.push('');
    lines.push('Unmerged paths:');
    lines.push('  (use "git add <file>..." to mark resolution)');
    for (const c of merging?.conflicts ?? []) {
      lines.push(`\t${ANSI.red}${(c.kind + ':').padEnd(16)}${c.path}${ANSI.reset}`);
    }
  }

  if (hasUntracked) {
    lines.push('');
    lines.push('Untracked files:');
    lines.push('  (use "git add <file>..." to include in what will be committed)');
    for (const file of status.untracked) {
      lines.push(`\t${ANSI.red}${file}${ANSI.reset}`);
    }
  }

  if (!hasStaged && !hasUnstaged && !hasUntracked && !hasUnmerged) {
    if (merging) {
      // The merge header above already explains how to conclude the merge.
    } else if (status.isInitial) {
      lines.push('nothing to commit (create/copy files and use "git add" to track)');
    } else {
      lines.push('nothing to commit, working tree clean');
    }
  } else if (!hasStaged && !merging) {
    lines.push('');
    lines.push('no changes added to commit (use "git add" to track)');
  }

  return lines.join('\n') + '\n';
}

export function formatLog(
  commits: GitCommit[],
  options: { oneline?: boolean; branch?: string; refs?: Record<string, string[]> } = {},
): string {
  const oneline = options.oneline ?? false;
  const branch = options.branch ?? 'main';
  const refs = options.refs ?? {};

  if (commits.length === 0) {
    return '';
  }

  const decorate = (c: GitCommit, idx: number): string => {
    const names: string[] = [];
    if (idx === 0) names.push(`${ANSI.bold}HEAD -> ${ANSI.green}${branch}`);
    for (const name of refs[c.hash] ?? []) {
      if (idx === 0 && name === branch) continue;
      names.push(`${ANSI.green}${name}`);
    }
    if (names.length === 0) return '';
    return ` ${ANSI.cyan}(${names.join(`${ANSI.cyan}, `)}${ANSI.cyan})${ANSI.reset}`;
  };

  if (oneline) {
    return (
      commits
        .map((c, idx) => `${ANSI.yellow}${c.shortHash}${ANSI.reset}${decorate(c, idx)} ${c.message}`)
        .join('\n') + '\n'
    );
  }

  const shortOf = (hash: string) => commits.find((c) => c.hash === hash)?.shortHash ?? hash.slice(0, 7);

  return (
    commits
      .map((c, idx) => {
        const mergeLine =
          c.mergeParent && c.parent ? `Merge: ${shortOf(c.parent)} ${shortOf(c.mergeParent)}\n` : '';
        return (
          `commit ${ANSI.yellow}${c.hash}${ANSI.reset}${decorate(c, idx)}\n` +
          mergeLine +
          `Author: ${c.author} <${c.author}@klu>\n` +
          `Date:   ${formatGitDate(c.timestamp)}\n\n` +
          `    ${c.message}\n`
        );
      })
      .join('\n')
  );
}

/** Render file differences as a colored unified diff (`-` red, `+` green). */
export function formatDiff(diffs: GitFileDiff[]): string {
  const out: string[] = [];
  for (const d of diffs) {
    out.push(`${ANSI.bold}diff --git a/${d.path} b/${d.path}${ANSI.reset}`);
    if (d.oldContent === null) out.push(`${ANSI.bold}new file mode 100644${ANSI.reset}`);
    if (d.newContent === null) out.push(`${ANSI.bold}deleted file mode 100644${ANSI.reset}`);
    out.push(`${ANSI.bold}--- ${d.oldContent === null ? '/dev/null' : `a/${d.path}`}${ANSI.reset}`);
    out.push(`${ANSI.bold}+++ ${d.newContent === null ? '/dev/null' : `b/${d.path}`}${ANSI.reset}`);

    const hunks = buildHunks(diffLines(d.oldContent ?? '', d.newContent ?? ''));
    for (const h of hunks) {
      const oldRange = h.oldLines === 1 ? `${h.oldStart}` : `${h.oldStart},${h.oldLines}`;
      const newRange = h.newLines === 1 ? `${h.newStart}` : `${h.newStart},${h.newLines}`;
      out.push(`${ANSI.cyan}@@ -${oldRange} +${newRange} @@${ANSI.reset}`);
      for (const op of h.ops) {
        if (op.type === 'remove') out.push(`${ANSI.red}-${op.line}${ANSI.reset}`);
        else if (op.type === 'add') out.push(`${ANSI.green}+${op.line}${ANSI.reset}`);
        else out.push(` ${op.line}`);
      }
    }
  }
  return out.length > 0 ? out.join('\n') + '\n' : '';
}

/** `git branch` listing: active branch marked with `*` and highlighted. */
export function formatBranches(branches: GitBranchInfo[]): string {
  if (branches.length === 0) return '';
  return (
    branches
      .map((b) => (b.current ? `* ${ANSI.green}${b.name}${ANSI.reset}` : `  ${b.name}`))
      .join('\n') + '\n'
  );
}
