import { dirname, joinPath, type FsNode, type VirtualFS } from '../fs/VirtualFS';
import type { GitCommit, GitIndex, GitStatusResult } from './types';

function generateHash(seed: string): string {
  let h1 = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h1 ^= seed.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  let h2 = 0x27d4eb2f;
  for (let i = seed.length - 1; i >= 0; i--) {
    h2 ^= seed.charCodeAt(i);
    h2 = Math.imul(h2, 0x1000193);
  }
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (hex1 + hex2 + hex1 + hex2 + hex1).slice(0, 40);
}

export class GitRepo {
  constructor(
    public readonly fs: VirtualFS,
    public readonly repoRoot: string,
  ) {}

  get gitDir(): string {
    return joinPath(this.repoRoot, '.git');
  }

  // ---------------------------------------------------------------- discovery

  /**
   * Search upwards from `cwd` towards root `/` to find a `.git` repository directory.
   */
  static find(fs: VirtualFS, cwd: string): GitRepo | null {
    let curr = fs.resolve(cwd);
    while (true) {
      const gitPath = joinPath(curr, '.git');
      if (fs.exists(gitPath) && fs.isDir(gitPath)) {
        return new GitRepo(fs, curr);
      }
      if (curr === '/' || curr === '') {
        break;
      }
      const parent = dirname(curr);
      if (parent === curr) break;
      curr = parent;
    }
    return null;
  }

  /**
   * Initialize a repository at `targetDir`.
   */
  static init(
    fs: VirtualFS,
    targetDir: string,
    defaultBranch = 'main',
  ): { repo: GitRepo; isReinit: boolean } {
    const absTarget = fs.resolve(targetDir);
    const gitDir = joinPath(absTarget, '.git');

    if (fs.exists(gitDir) && fs.isDir(gitDir)) {
      return { repo: new GitRepo(fs, absTarget), isReinit: true };
    }

    fs.mkdir(gitDir, { parents: true });
    fs.mkdir(joinPath(gitDir, 'refs/heads'), { parents: true });
    fs.writeFile(joinPath(gitDir, 'HEAD'), `ref: refs/heads/${defaultBranch}\n`);
    fs.writeFile(joinPath(gitDir, 'index.json'), '{}');
    fs.writeFile(joinPath(gitDir, 'commits.json'), '[]');

    return { repo: new GitRepo(fs, absTarget), isReinit: false };
  }

  // ---------------------------------------------------------------- references

  getCurrentBranch(): string | null {
    const headPath = joinPath(this.gitDir, 'HEAD');
    if (!this.fs.exists(headPath)) return null;
    const content = this.fs.readFile(headPath).trim();
    const prefix = 'ref: refs/heads/';
    if (content.startsWith(prefix)) {
      return content.slice(prefix.length).trim();
    }
    return null;
  }

  getBranchCommitHash(branch: string): string | null {
    const branchPath = joinPath(this.gitDir, `refs/heads/${branch}`);
    if (!this.fs.exists(branchPath)) return null;
    const hash = this.fs.readFile(branchPath).trim();
    return hash || null;
  }

  getHeadCommitHash(): string | null {
    const branch = this.getCurrentBranch();
    if (branch) {
      return this.getBranchCommitHash(branch);
    }
    const headPath = joinPath(this.gitDir, 'HEAD');
    if (this.fs.exists(headPath)) {
      const content = this.fs.readFile(headPath).trim();
      if (!content.startsWith('ref:')) return content;
    }
    return null;
  }

  getCommits(): GitCommit[] {
    const commitsPath = joinPath(this.gitDir, 'commits.json');
    if (!this.fs.exists(commitsPath)) return [];
    try {
      return JSON.parse(this.fs.readFile(commitsPath)) as GitCommit[];
    } catch {
      return [];
    }
  }

  getHeadCommit(): GitCommit | null {
    const headHash = this.getHeadCommitHash();
    if (!headHash) return null;
    const commits = this.getCommits();
    return commits.find((c) => c.hash === headHash || c.shortHash === headHash) ?? null;
  }

  getIndex(): GitIndex {
    const indexPath = joinPath(this.gitDir, 'index.json');
    if (!this.fs.exists(indexPath)) return {};
    try {
      return JSON.parse(this.fs.readFile(indexPath)) as GitIndex;
    } catch {
      return {};
    }
  }

  saveIndex(index: GitIndex): void {
    this.fs.writeFile(joinPath(this.gitDir, 'index.json'), JSON.stringify(index, null, 2));
  }

  private saveCommits(commits: GitCommit[]): void {
    this.fs.writeFile(joinPath(this.gitDir, 'commits.json'), JSON.stringify(commits, null, 2));
  }

  private setBranchHead(branch: string, commitHash: string): void {
    const headsDir = joinPath(this.gitDir, 'refs/heads');
    if (!this.fs.exists(headsDir)) {
      this.fs.mkdir(headsDir, { parents: true });
    }
    this.fs.writeFile(joinPath(headsDir, branch), commitHash + '\n');
  }

  // --------------------------------------------------------------- file scans

  toRelPath(absPath: string): string {
    if (this.repoRoot === '/') {
      return absPath.startsWith('/') ? absPath.slice(1) : absPath;
    }
    const prefix = this.repoRoot + '/';
    if (absPath === this.repoRoot) return '';
    return absPath.startsWith(prefix) ? absPath.slice(prefix.length) : absPath;
  }

  toAbsPath(relPath: string): string {
    return joinPath(this.repoRoot, relPath);
  }

  getWorkingFiles(): Map<string, string> {
    const result = new Map<string, string>();
    const scan = (dirAbs: string) => {
      let entries: FsNode[];
      try {
        entries = this.fs.readdir(dirAbs);
      } catch {
        return;
      }
      for (const node of entries) {
        if (node.type === 'dir') {
          if (node.name === '.git') continue;
          scan(joinPath(dirAbs, node.name));
        } else if (node.type === 'file') {
          const fullPath = joinPath(dirAbs, node.name);
          const relPath = this.toRelPath(fullPath);
          result.set(relPath, node.content);
        }
      }
    };
    scan(this.repoRoot);
    return result;
  }

  // ------------------------------------------------------------------ status

  getStatus(): GitStatusResult {
    const headCommit = this.getHeadCommit();
    const isInitial = headCommit === null;
    const headTree = headCommit?.tree ?? {};
    const index = this.getIndex();
    const workingFiles = this.getWorkingFiles();

    const stagedNewFiles: string[] = [];
    const stagedModifiedFiles: string[] = [];
    const stagedDeletedFiles: string[] = [];

    // 1. Staged changes: index vs HEAD
    for (const [relPath, content] of Object.entries(index)) {
      if (!(relPath in headTree)) {
        stagedNewFiles.push(relPath);
      } else if (headTree[relPath] !== content) {
        stagedModifiedFiles.push(relPath);
      }
    }
    for (const relPath of Object.keys(headTree)) {
      if (!(relPath in index)) {
        stagedDeletedFiles.push(relPath);
      }
    }

    // 2. Unstaged changes: working tree vs index
    const unstagedModifiedFiles: string[] = [];
    const unstagedDeletedFiles: string[] = [];

    for (const [relPath, stagedContent] of Object.entries(index)) {
      if (workingFiles.has(relPath)) {
        if (workingFiles.get(relPath) !== stagedContent) {
          unstagedModifiedFiles.push(relPath);
        }
      } else {
        unstagedDeletedFiles.push(relPath);
      }
    }

    // 3. Untracked files: working tree not in index and not in headTree
    const untracked: string[] = [];
    for (const relPath of workingFiles.keys()) {
      if (!(relPath in index) && !(relPath in headTree)) {
        untracked.push(relPath);
      }
    }

    return {
      branch: this.getCurrentBranch() ?? 'main',
      isInitial,
      staged: {
        newFiles: stagedNewFiles.sort(),
        modifiedFiles: stagedModifiedFiles.sort(),
        deletedFiles: stagedDeletedFiles.sort(),
      },
      unstaged: {
        modifiedFiles: unstagedModifiedFiles.sort(),
        deletedFiles: unstagedDeletedFiles.sort(),
      },
      untracked: untracked.sort(),
    };
  }

  // --------------------------------------------------------------------- add

  add(patterns: string[], cwd: string): { stagedCount: number } {
    if (patterns.length === 0) {
      throw new Error('Nothing specified, nothing added.');
    }

    const workingFiles = this.getWorkingFiles();
    const index = this.getIndex();
    let stagedCount = 0;

    for (const pat of patterns) {
      if (pat === '-A' || pat === '--all') {
        // Stage all working files and removals across entire repo
        for (const [relPath, content] of workingFiles.entries()) {
          index[relPath] = content;
          stagedCount++;
        }
        for (const relPath of Object.keys(index)) {
          if (!workingFiles.has(relPath)) {
            delete index[relPath];
            stagedCount++;
          }
        }
        continue;
      }

      if (pat === '.') {
        // Stage all files in cwd and subdirectories
        const relCwd = this.toRelPath(cwd);
        const prefix = relCwd ? (relCwd.endsWith('/') ? relCwd : relCwd + '/') : '';

        for (const [relPath, content] of workingFiles.entries()) {
          if (!prefix || relPath.startsWith(prefix)) {
            index[relPath] = content;
            stagedCount++;
          }
        }
        for (const relPath of Object.keys(index)) {
          if (!prefix || relPath.startsWith(prefix)) {
            if (!workingFiles.has(relPath)) {
              delete index[relPath];
              stagedCount++;
            }
          }
        }
        continue;
      }

      // Specific file or directory pattern
      const absTarget = this.fs.resolve(pat, cwd);
      const isInsideRepo =
        this.repoRoot === '/' ||
        absTarget === this.repoRoot ||
        absTarget.startsWith(this.repoRoot + '/');

      if (!isInsideRepo) {
        throw new Error(`fatal: '${pat}' is outside repository at '${this.repoRoot}'`);
      }

      const relTarget = this.toRelPath(absTarget);

      if (this.fs.exists(absTarget)) {
        if (this.fs.isDir(absTarget)) {
          // Add all files under this directory
          const prefix = relTarget ? (relTarget.endsWith('/') ? relTarget : relTarget + '/') : '';
          for (const [relPath, content] of workingFiles.entries()) {
            if (relPath.startsWith(prefix)) {
              index[relPath] = content;
              stagedCount++;
            }
          }
          for (const relPath of Object.keys(index)) {
            if (relPath.startsWith(prefix) && !workingFiles.has(relPath)) {
              delete index[relPath];
              stagedCount++;
            }
          }
        } else {
          // File exists
          const content = this.fs.readFile(absTarget);
          index[relTarget] = content;
          stagedCount++;
        }
      } else {
        // Does not exist in working directory. Is it in the index or HEAD (staged deletion)?
        const headCommit = this.getHeadCommit();
        const headTree = headCommit?.tree ?? {};
        if (relTarget in index || relTarget in headTree) {
          delete index[relTarget];
          stagedCount++;
        } else {
          throw new Error(`fatal: pathspec '${pat}' did not match any files`);
        }
      }
    }

    this.saveIndex(index);
    return { stagedCount };
  }

  // ------------------------------------------------------------------ commit

  commit(message: string, author?: string): GitCommit {
    const status = this.getStatus();
    const hasStaged =
      status.staged.newFiles.length > 0 ||
      status.staged.modifiedFiles.length > 0 ||
      status.staged.deletedFiles.length > 0;

    if (!hasStaged) {
      const hasUnstaged =
        status.unstaged.modifiedFiles.length > 0 ||
        status.unstaged.deletedFiles.length > 0 ||
        status.untracked.length > 0;
      if (hasUnstaged) {
        throw new Error(
          `no changes added to commit (use "git add" to track)`,
        );
      }
      throw new Error('nothing to commit, working tree clean');
    }

    const branch = this.getCurrentBranch() ?? 'main';
    const parent = this.getHeadCommitHash();
    const index = this.getIndex();
    const commits = this.getCommits();
    const timestamp = this.fs.now();
    const commitAuthor = author ?? this.fs.user;

    const fullHash = generateHash(
      JSON.stringify(index) + message + timestamp + commits.length + commitAuthor,
    );
    const shortHash = fullHash.slice(0, 7);

    const commitObj: GitCommit = {
      hash: fullHash,
      shortHash,
      parent,
      tree: { ...index },
      message,
      author: commitAuthor,
      timestamp,
    };

    commits.push(commitObj);
    this.saveCommits(commits);
    this.setBranchHead(branch, fullHash);

    return commitObj;
  }

  // --------------------------------------------------------------------- log

  getLog(): GitCommit[] {
    const headHash = this.getHeadCommitHash();
    if (!headHash) return [];

    const commits = this.getCommits();
    const byHash = new Map<string, GitCommit>();
    for (const c of commits) {
      byHash.set(c.hash, c);
      byHash.set(c.shortHash, c);
    }

    const chain: GitCommit[] = [];
    let currHash: string | null = headHash;
    while (currHash) {
      const commit = byHash.get(currHash);
      if (!commit) break;
      chain.push(commit);
      currHash = commit.parent;
    }

    return chain;
  }
}
