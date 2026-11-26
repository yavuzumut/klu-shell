import type { GitCommit, GitStatusResult } from './types';

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

  if (hasUntracked) {
    lines.push('');
    lines.push('Untracked files:');
    lines.push('  (use "git add <file>..." to include in what will be committed)');
    for (const file of status.untracked) {
      lines.push(`\t${ANSI.red}${file}${ANSI.reset}`);
    }
  }

  if (!hasStaged && !hasUnstaged && !hasUntracked) {
    if (status.isInitial) {
      lines.push('nothing to commit (create/copy files and use "git add" to track)');
    } else {
      lines.push('nothing to commit, working tree clean');
    }
  } else if (!hasStaged) {
    lines.push('');
    lines.push('no changes added to commit (use "git add" to track)');
  }

  return lines.join('\n') + '\n';
}

export function formatLog(
  commits: GitCommit[],
  options: { oneline?: boolean; branch?: string } = {},
): string {
  const oneline = options.oneline ?? false;
  const branch = options.branch ?? 'main';

  if (commits.length === 0) {
    return '';
  }

  if (oneline) {
    return (
      commits
        .map((c, idx) => {
          const headRef =
            idx === 0
              ? ` ${ANSI.cyan}(${ANSI.bold}HEAD -> ${ANSI.green}${branch}${ANSI.cyan})${ANSI.reset}`
              : '';
          return `${ANSI.yellow}${c.shortHash}${ANSI.reset}${headRef} ${c.message}`;
        })
        .join('\n') + '\n'
    );
  }

  return (
    commits
      .map((c, idx) => {
        const headRef =
          idx === 0
            ? ` ${ANSI.cyan}(${ANSI.bold}HEAD -> ${ANSI.green}${branch}${ANSI.cyan})${ANSI.reset}`
            : '';
        return (
          `commit ${ANSI.yellow}${c.hash}${ANSI.reset}${headRef}\n` +
          `Author: ${c.author} <${c.author}@klu>\n` +
          `Date:   ${formatGitDate(c.timestamp)}\n\n` +
          `    ${c.message}\n`
        );
      })
      .join('\n')
  );
}
