import { dirname, joinPath, type FsNode, type VirtualFS } from '../fs/VirtualFS';
import { buildConflictContent } from './diff';
import { GitIgnore } from './gitignore';
import type {
  GitBranchInfo,
  GitCommit,
  GitConflict,
  GitFileDiff,
  GitIndex,
  GitMergeResult,
  GitMergeState,
  GitStatusResult,
} from './types';

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

type Tree = Record<string, string>;

/** Does repo-relative `relPath` fall under pathspec `spec` ('' = whole repo)? */
function matchesSpec(relPath: string, spec: string): boolean {
  return spec === '' || relPath === spec || relPath.startsWith(spec + '/');
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
    if (!this.fs.isFile(branchPath)) return null;
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

  getCommit(hash: string): GitCommit | null {
    return this.getCommits().find((c) => c.hash === hash || c.shortHash === hash) ?? null;
  }

  getHeadCommit(): GitCommit | null {
    const headHash = this.getHeadCommitHash();
    if (!headHash) return null;
    return this.getCommit(headHash);
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
    const branchPath = joinPath(this.gitDir, `refs/heads/${branch}`);
    const parent = dirname(branchPath);
    if (!this.fs.exists(parent)) {
      this.fs.mkdir(parent, { parents: true });
    }
    this.fs.writeFile(branchPath, commitHash + '\n');
  }

  /** Point HEAD at `refs/heads/<branch>`. */
  private setHeadRef(branch: string): void {
    this.fs.writeFile(joinPath(this.gitDir, 'HEAD'), `ref: refs/heads/${branch}\n`);
  }

  // ------------------------------------------------------------ merge state

  private get mergeStatePath(): string {
    return joinPath(this.gitDir, 'MERGE_STATE.json');
  }

  getMergeState(): GitMergeState | null {
    if (!this.fs.isFile(this.mergeStatePath)) return null;
    try {
      return JSON.parse(this.fs.readFile(this.mergeStatePath)) as GitMergeState;
    } catch {
      return null;
    }
  }

  private saveMergeState(state: GitMergeState | null): void {
    if (state === null) {
      if (this.fs.exists(this.mergeStatePath)) this.fs.remove(this.mergeStatePath);
      return;
    }
    this.fs.writeFile(this.mergeStatePath, JSON.stringify(state, null, 2));
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

  /**
   * Convert user supplied paths (relative to `cwd`) into repo-relative
   * pathspecs. `''` denotes the repository root.
   */
  resolvePathspecs(args: string[], cwd: string): string[] {
    return args.map((arg) => {
      const abs = this.fs.resolve(arg, cwd);
      const inside =
        this.repoRoot === '/' || abs === this.repoRoot || abs.startsWith(this.repoRoot + '/');
      if (!inside) {
        throw new Error(`fatal: '${arg}' is outside repository at '${this.repoRoot}'`);
      }
      return this.toRelPath(abs);
    });
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

  /** Parsed `.gitignore` from the repository root (empty if absent). */
  getIgnore(): GitIgnore {
    const path = this.toAbsPath('.gitignore');
    return new GitIgnore(this.fs.isFile(path) ? this.fs.readFile(path) : '');
  }

  isIgnored(relPath: string): boolean {
    return this.getIgnore().isIgnored(relPath);
  }

  /** Write a file into the working tree, creating parent directories as needed. */
  private writeWorkingFile(relPath: string, content: string): void {
    const abs = this.toAbsPath(relPath);
    const parent = dirname(abs);
    if (!this.fs.exists(parent)) this.fs.mkdir(parent, { parents: true });
    this.fs.writeFile(abs, content);
  }

  /** Remove a file from the working tree and prune now-empty parent directories. */
  private removeWorkingFile(relPath: string): void {
    const abs = this.toAbsPath(relPath);
    if (this.fs.isFile(abs)) this.fs.remove(abs);
    this.pruneEmptyDirs(dirname(abs), this.repoRoot);
  }

  private pruneEmptyDirs(dirAbs: string, stopAt: string): void {
    let curr = dirAbs;
    while (curr !== stopAt && curr !== '/' && curr.startsWith(stopAt + '/')) {
      if (!this.fs.isDir(curr) || this.fs.readdir(curr).length > 0) break;
      this.fs.remove(curr, { recursive: true });
      curr = dirname(curr);
    }
  }

  // ------------------------------------------------------------------ status

  getStatus(): GitStatusResult {
    const headCommit = this.getHeadCommit();
    const isInitial = headCommit === null;
    const headTree = headCommit?.tree ?? {};
    const index = this.getIndex();
    const workingFiles = this.getWorkingFiles();
    const ignore = this.getIgnore();
    const mergeState = this.getMergeState();
    const conflicted = new Set(mergeState?.conflicts.map((c) => c.path) ?? []);

    const stagedNewFiles: string[] = [];
    const stagedModifiedFiles: string[] = [];
    const stagedDeletedFiles: string[] = [];

    // 1. Staged changes: index vs HEAD
    for (const [relPath, content] of Object.entries(index)) {
      if (conflicted.has(relPath)) continue;
      if (!(relPath in headTree)) {
        stagedNewFiles.push(relPath);
      } else if (headTree[relPath] !== content) {
        stagedModifiedFiles.push(relPath);
      }
    }
    for (const relPath of Object.keys(headTree)) {
      if (conflicted.has(relPath)) continue;
      if (!(relPath in index)) {
        stagedDeletedFiles.push(relPath);
      }
    }

    // 2. Unstaged changes: working tree vs index
    const unstagedModifiedFiles: string[] = [];
    const unstagedDeletedFiles: string[] = [];

    for (const [relPath, stagedContent] of Object.entries(index)) {
      if (conflicted.has(relPath)) continue;
      if (workingFiles.has(relPath)) {
        if (workingFiles.get(relPath) !== stagedContent) {
          unstagedModifiedFiles.push(relPath);
        }
      } else {
        unstagedDeletedFiles.push(relPath);
      }
    }

    // 3. Untracked files: working tree not in index and not in headTree (minus .gitignore)
    const untracked: string[] = [];
    for (const relPath of workingFiles.keys()) {
      if (conflicted.has(relPath)) continue;
      if (!(relPath in index) && !(relPath in headTree) && !ignore.isIgnored(relPath)) {
        untracked.push(relPath);
      }
    }

    const result: GitStatusResult = {
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
    if (mergeState) {
      result.merging = { branch: mergeState.branch, conflicts: mergeState.conflicts };
    }
    return result;
  }

  /** Paths of tracked files that differ between HEAD, index and working tree. */
  private getTrackedChanges(): string[] {
    const st = this.getStatus();
    return [
      ...new Set([
        ...st.staged.newFiles,
        ...st.staged.modifiedFiles,
        ...st.staged.deletedFiles,
        ...st.unstaged.modifiedFiles,
        ...st.unstaged.deletedFiles,
      ]),
    ].sort();
  }

  // --------------------------------------------------------------------- add

  add(patterns: string[], cwd: string): { stagedCount: number } {
    const force = patterns.some((p) => p === '-f' || p === '--force');
    patterns = patterns.filter((p) => p !== '-f' && p !== '--force');

    if (patterns.length === 0) {
      throw new Error('Nothing specified, nothing added.');
    }

    const workingFiles = this.getWorkingFiles();
    const index = this.getIndex();
    const ignore = this.getIgnore();
    const touched = new Set<string>();
    let stagedCount = 0;

    const stage = (relPath: string, content: string) => {
      index[relPath] = content;
      touched.add(relPath);
      stagedCount++;
    };
    const unstage = (relPath: string) => {
      delete index[relPath];
      touched.add(relPath);
      stagedCount++;
    };
    /** Bulk adds skip ignored files unless they are already tracked. */
    const skipIgnored = (relPath: string) => !force && !(relPath in index) && ignore.isIgnored(relPath);

    for (const pat of patterns) {
      if (pat === '-A' || pat === '--all') {
        // Stage all working files and removals across entire repo
        for (const [relPath, content] of workingFiles.entries()) {
          if (skipIgnored(relPath)) continue;
          stage(relPath, content);
        }
        for (const relPath of Object.keys(index)) {
          if (!workingFiles.has(relPath)) {
            unstage(relPath);
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
            if (skipIgnored(relPath)) continue;
            stage(relPath, content);
          }
        }
        for (const relPath of Object.keys(index)) {
          if (!prefix || relPath.startsWith(prefix)) {
            if (!workingFiles.has(relPath)) {
              unstage(relPath);
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
              if (skipIgnored(relPath)) continue;
              stage(relPath, content);
            }
          }
          for (const relPath of Object.keys(index)) {
            if (relPath.startsWith(prefix) && !workingFiles.has(relPath)) {
              unstage(relPath);
            }
          }
        } else {
          // File exists — explicitly naming an ignored file is an error without -f
          if (skipIgnored(relTarget)) {
            throw new Error(
              `The following paths are ignored by one of your .gitignore files:\n${pat}\n` +
                `hint: Use -f if you really want to add them.`,
            );
          }
          const content = this.fs.readFile(absTarget);
          stage(relTarget, content);
        }
      } else {
        // Does not exist in working directory. Is it in the index or HEAD (staged deletion)?
        const headCommit = this.getHeadCommit();
        const headTree = headCommit?.tree ?? {};
        const isConflicted =
          this.getMergeState()?.conflicts.some((c) => c.path === relTarget) ?? false;
        if (relTarget in index || relTarget in headTree || isConflicted) {
          unstage(relTarget);
        } else {
          throw new Error(`fatal: pathspec '${pat}' did not match any files`);
        }
      }
    }

    this.saveIndex(index);

    // Staging a conflicted file marks it as resolved.
    const mergeState = this.getMergeState();
    if (mergeState) {
      mergeState.conflicts = mergeState.conflicts.filter((c) => !touched.has(c.path));
      this.saveMergeState(mergeState);
    }

    return { stagedCount };
  }

  // ------------------------------------------------------------------ commit

  commit(message: string, author?: string): GitCommit {
    const mergeState = this.getMergeState();
    if (mergeState && mergeState.conflicts.length > 0) {
      throw new Error(
        'error: Committing is not possible because you have unmerged files.\n' +
          "hint: Fix them up in the work tree, and then use 'git add <file>'\n" +
          'hint: as appropriate to mark resolution and make a commit.\n' +
          'fatal: Exiting because of an unresolved conflict.',
      );
    }

    const status = this.getStatus();
    const hasStaged =
      status.staged.newFiles.length > 0 ||
      status.staged.modifiedFiles.length > 0 ||
      status.staged.deletedFiles.length > 0;

    // A merge commit may legitimately have no staged changes relative to HEAD.
    if (!hasStaged && !mergeState) {
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

    const commitObj = this.createCommit(
      this.getIndex(),
      message,
      author ?? this.fs.user,
      mergeState?.mergeHead ?? null,
    );
    if (mergeState) this.saveMergeState(null);
    return commitObj;
  }

  /** Record a commit object for `tree` and advance the current branch. */
  private createCommit(
    tree: Tree,
    message: string,
    author: string,
    mergeParent: string | null = null,
  ): GitCommit {
    const branch = this.getCurrentBranch() ?? 'main';
    const parent = this.getHeadCommitHash();
    const commits = this.getCommits();
    const timestamp = this.fs.now();

    const fullHash = generateHash(
      JSON.stringify(tree) + message + timestamp + commits.length + author + (mergeParent ?? ''),
    );
    const shortHash = fullHash.slice(0, 7);

    const commitObj: GitCommit = {
      hash: fullHash,
      shortHash,
      parent,
      tree: { ...tree },
      message,
      author,
      timestamp,
    };
    if (mergeParent) commitObj.mergeParent = mergeParent;

    commits.push(commitObj);
    this.saveCommits(commits);
    this.setBranchHead(branch, fullHash);

    return commitObj;
  }

  // --------------------------------------------------------------------- log

  /**
   * All commits reachable from HEAD (following both parents of merge
   * commits), newest first.
   */
  getLog(): GitCommit[] {
    const headHash = this.getHeadCommitHash();
    if (!headHash) return [];
    const commits = this.getCommits();
    const reachable = this.getAncestors(headHash, commits);
    // commits.json is append-only, so array order is creation order.
    return commits.filter((c) => reachable.has(c.hash)).reverse();
  }

  /** Set of commit hashes reachable from `hash` (inclusive). */
  private getAncestors(hash: string, commits = this.getCommits()): Set<string> {
    const byHash = new Map<string, GitCommit>();
    for (const c of commits) {
      byHash.set(c.hash, c);
      byHash.set(c.shortHash, c);
    }
    const seen = new Set<string>();
    const queue: string[] = [hash];
    while (queue.length > 0) {
      const curr = byHash.get(queue.shift() as string);
      if (!curr || seen.has(curr.hash)) continue;
      seen.add(curr.hash);
      if (curr.parent) queue.push(curr.parent);
      if (curr.mergeParent) queue.push(curr.mergeParent);
    }
    return seen;
  }

  /** Is `ancestor` reachable from `descendant`? */
  isAncestor(ancestor: string, descendant: string): boolean {
    const target = this.getCommit(ancestor);
    if (!target) return false;
    return this.getAncestors(descendant).has(target.hash);
  }

  /** Most recent common ancestor of two commits (null if unrelated). */
  private getMergeBase(a: string, b: string): GitCommit | null {
    const commits = this.getCommits();
    const ancA = this.getAncestors(a, commits);
    const ancB = this.getAncestors(b, commits);
    for (let i = commits.length - 1; i >= 0; i--) {
      const c = commits[i];
      if (ancA.has(c.hash) && ancB.has(c.hash)) return c;
    }
    return null;
  }

  // -------------------------------------------------------------------- diff

  /** Working tree vs index (`git diff`). Untracked files are not included. */
  diffWorking(specs: string[] = ['']): GitFileDiff[] {
    const index = this.getIndex();
    const working = this.getWorkingFiles();
    const conflicted = new Set(this.getMergeState()?.conflicts.map((c) => c.path) ?? []);
    const result: GitFileDiff[] = [];
    for (const relPath of Object.keys(index).sort()) {
      if (!specs.some((s) => matchesSpec(relPath, s))) continue;
      const oldContent = index[relPath];
      const newContent = working.get(relPath) ?? null;
      if (oldContent !== newContent || conflicted.has(relPath)) {
        result.push({ path: relPath, oldContent, newContent });
      }
    }
    return result;
  }

  /** Index vs HEAD (`git diff --staged`). */
  diffStaged(specs: string[] = ['']): GitFileDiff[] {
    const index = this.getIndex();
    const headTree = this.getHeadCommit()?.tree ?? {};
    const paths = [...new Set([...Object.keys(index), ...Object.keys(headTree)])].sort();
    const result: GitFileDiff[] = [];
    for (const relPath of paths) {
      if (!specs.some((s) => matchesSpec(relPath, s))) continue;
      const oldContent = headTree[relPath] ?? null;
      const newContent = index[relPath] ?? null;
      if (oldContent !== newContent) {
        result.push({ path: relPath, oldContent, newContent });
      }
    }
    return result;
  }

  // ----------------------------------------------------------------- restore

  /**
   * `git restore [--staged] [--worktree] <paths>`
   *  - worktree: overwrite working files with their index version
   *  - staged:   reset index entries to their HEAD version (unstage)
   * Both together restore index and working tree from HEAD.
   */
  restore(
    args: string[],
    cwd: string,
    options: { staged?: boolean; worktree?: boolean } = {},
  ): string[] {
    const staged = options.staged ?? false;
    const worktree = options.worktree ?? !staged;
    const specs = this.resolvePathspecs(args, cwd);
    const headTree = this.getHeadCommit()?.tree ?? {};
    const index = this.getIndex();
    const restored = new Set<string>();

    const pathspecError = (arg: string) =>
      new Error(`error: pathspec '${arg}' did not match any file(s) known to git`);

    if (staged) {
      const known = [...new Set([...Object.keys(index), ...Object.keys(headTree)])];
      specs.forEach((spec, i) => {
        const matches = known.filter((p) => matchesSpec(p, spec));
        if (matches.length === 0) throw pathspecError(args[i]);
        for (const p of matches) {
          if (p in headTree) index[p] = headTree[p];
          else delete index[p];
          restored.add(p);
        }
      });
      this.saveIndex(index);
    }

    if (worktree) {
      const known = Object.keys(index);
      const working = this.getWorkingFiles();
      specs.forEach((spec, i) => {
        const matches = known.filter((p) => matchesSpec(p, spec));
        if (matches.length === 0) throw pathspecError(args[i]);
        for (const p of matches) {
          if (working.get(p) !== index[p]) this.writeWorkingFile(p, index[p]);
          restored.add(p);
        }
      });
    }

    return [...restored].sort();
  }

  // ---------------------------------------------------------------- branches

  /** Validate a branch name using a subset of `git check-ref-format` rules. */
  static isValidBranchName(name: string): boolean {
    if (!name || name === 'HEAD' || name === '@') return false;
    if (name.startsWith('-') || name.startsWith('/') || name.endsWith('/')) return false;
    if (name.endsWith('.') || name.endsWith('.lock')) return false;
    if (name.includes('..') || name.includes('//') || name.includes('@{')) return false;
    if (!/^[\p{L}\p{N}._/-]+$/u.test(name)) return false;
    if (name.split('/').some((seg) => seg.startsWith('.'))) return false;
    return true;
  }

  listBranches(): GitBranchInfo[] {
    const current = this.getCurrentBranch();
    const headsDir = joinPath(this.gitDir, 'refs/heads');
    const result: GitBranchInfo[] = [];
    const scan = (dirAbs: string, prefix: string) => {
      let entries: FsNode[];
      try {
        entries = this.fs.readdir(dirAbs);
      } catch {
        return;
      }
      for (const node of entries) {
        const name = prefix + node.name;
        if (node.type === 'dir') {
          scan(joinPath(dirAbs, node.name), name + '/');
        } else {
          const hash = node.content.trim();
          if (hash) result.push({ name, hash, current: name === current });
        }
      }
    };
    scan(headsDir, '');
    return result.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  }

  branchExists(name: string): boolean {
    return this.getBranchCommitHash(name) !== null;
  }

  /** Create `name` pointing at the current HEAD commit. */
  createBranch(name: string): GitBranchInfo {
    if (!GitRepo.isValidBranchName(name)) {
      throw new Error(`fatal: '${name}' is not a valid branch name`);
    }
    if (this.branchExists(name)) {
      throw new Error(`fatal: a branch named '${name}' already exists`);
    }
    const head = this.getHeadCommitHash();
    if (!head) {
      throw new Error(`fatal: not a valid object name: '${this.getCurrentBranch() ?? 'main'}'`);
    }
    for (const b of this.listBranches()) {
      if (b.name.startsWith(name + '/') || name.startsWith(b.name + '/')) {
        throw new Error(
          `fatal: cannot lock ref 'refs/heads/${name}': 'refs/heads/${b.name}' exists`,
        );
      }
    }
    this.setBranchHead(name, head);
    return { name, hash: head, current: false };
  }

  /** Delete a branch. Without `force`, refuses to drop unmerged work. */
  deleteBranch(name: string, force = false): { hash: string } {
    const hash = this.getBranchCommitHash(name);
    if (!hash) {
      throw new Error(`error: branch '${name}' not found.`);
    }
    if (name === this.getCurrentBranch()) {
      throw new Error(`error: Cannot delete branch '${name}' checked out at '${this.repoRoot}'`);
    }
    const head = this.getHeadCommitHash();
    if (!force && (!head || !this.isAncestor(hash, head))) {
      throw new Error(
        `error: the branch '${name}' is not fully merged.\n` +
          `hint: If you are sure you want to delete it, run 'git branch -D ${name}'.`,
      );
    }
    const headsDir = joinPath(this.gitDir, 'refs/heads');
    const branchPath = joinPath(headsDir, name);
    this.fs.remove(branchPath);
    this.pruneEmptyDirs(dirname(branchPath), headsDir);
    return { hash };
  }

  // ------------------------------------------------------------ tree updates

  /**
   * Files whose uncommitted state would be lost by moving the working tree
   * from `fromTree` to `toTree`.
   */
  private findOverwriteConflicts(
    fromTree: Tree,
    toTree: Tree,
  ): { local: string[]; untracked: string[] } {
    const index = this.getIndex();
    const working = this.getWorkingFiles();
    const local: string[] = [];
    const untracked: string[] = [];
    const paths = [...new Set([...Object.keys(fromTree), ...Object.keys(toTree)])].sort();

    for (const p of paths) {
      if (fromTree[p] === toTree[p]) continue;
      const idx = index[p];
      const w = working.get(p);
      // Already exactly in the target state — nothing would be lost.
      if (idx === toTree[p] && w === toTree[p]) continue;

      if (p in fromTree || p in index) {
        if (idx !== fromTree[p] || w !== fromTree[p]) local.push(p);
      } else if (w !== undefined) {
        untracked.push(p);
      }
    }
    return { local, untracked };
  }

  /** Move index and working tree from `fromTree` to `toTree` (changed paths only). */
  private applyTree(fromTree: Tree, toTree: Tree): string[] {
    const index = this.getIndex();
    const changed: string[] = [];
    const paths = [...new Set([...Object.keys(fromTree), ...Object.keys(toTree)])].sort();
    for (const p of paths) {
      if (fromTree[p] === toTree[p]) continue;
      changed.push(p);
      if (p in toTree) {
        index[p] = toTree[p];
        this.writeWorkingFile(p, toTree[p]);
      } else {
        delete index[p];
        this.removeWorkingFile(p);
      }
    }
    this.saveIndex(index);
    return changed;
  }

  private overwriteError(
    conflicts: { local: string[]; untracked: string[] },
    action: 'checkout' | 'merge',
  ): Error | null {
    const verb = action === 'checkout' ? 'switch branches' : 'merge';
    if (conflicts.local.length > 0) {
      return new Error(
        `error: Your local changes to the following files would be overwritten by ${action}:\n` +
          conflicts.local.map((f) => `\t${f}`).join('\n') +
          `\nPlease commit your changes or stash them before you ${verb}.\nAborting`,
      );
    }
    if (conflicts.untracked.length > 0) {
      return new Error(
        `error: The following untracked working tree files would be overwritten by ${action}:\n` +
          conflicts.untracked.map((f) => `\t${f}`).join('\n') +
          `\nPlease move or remove them before you ${verb}.\nAborting`,
      );
    }
    return null;
  }

  // ------------------------------------------------------------------ switch

  /**
   * `git switch <branch>` / `git switch -c <branch>`.
   * Updates the working tree to the target branch, refusing to clobber
   * uncommitted changes.
   */
  switchBranch(name: string, options: { create?: boolean } = {}): { alreadyOn: boolean } {
    if (this.getMergeState()) {
      throw new Error('error: you need to resolve your current index first');
    }

    if (options.create) {
      if (!GitRepo.isValidBranchName(name)) {
        throw new Error(`fatal: '${name}' is not a valid branch name`);
      }
      if (this.branchExists(name)) {
        throw new Error(`fatal: a branch named '${name}' already exists`);
      }
      // On an unborn branch we simply repoint HEAD.
      if (this.getHeadCommitHash()) this.createBranch(name);
      this.setHeadRef(name);
      return { alreadyOn: false };
    }

    if (name === this.getCurrentBranch()) {
      return { alreadyOn: true };
    }
    const targetHash = this.getBranchCommitHash(name);
    if (!targetHash) {
      throw new Error(`fatal: invalid reference: ${name}`);
    }

    const fromTree = this.getHeadCommit()?.tree ?? {};
    const toTree = this.getCommit(targetHash)?.tree ?? {};
    const err = this.overwriteError(this.findOverwriteConflicts(fromTree, toTree), 'checkout');
    if (err) throw err;

    this.applyTree(fromTree, toTree);
    this.setHeadRef(name);
    return { alreadyOn: false };
  }

  // ------------------------------------------------------------------- merge

  /** `git merge <branch>`: fast-forward, three-way merge commit, or conflict. */
  merge(branchName: string, author?: string): GitMergeResult {
    if (this.getMergeState()) {
      throw new Error(
        'fatal: You have not concluded your merge (MERGE_HEAD exists).\n' +
          'Please, commit your changes before you merge.',
      );
    }
    const theirsHash = this.getBranchCommitHash(branchName);
    if (!theirsHash) {
      throw new Error(`merge: ${branchName} - not something we can merge`);
    }
    const theirs = this.getCommit(theirsHash);
    if (!theirs) {
      throw new Error(`merge: ${branchName} - not something we can merge`);
    }

    const oursHash = this.getHeadCommitHash();
    if (oursHash && (oursHash === theirs.hash || this.isAncestor(theirs.hash, oursHash))) {
      return { type: 'up-to-date' };
    }

    const localChanges = this.getTrackedChanges();
    if (localChanges.length > 0) {
      throw this.overwriteError({ local: localChanges, untracked: [] }, 'merge') as Error;
    }

    const oursTree = this.getHeadCommit()?.tree ?? {};
    const current = this.getCurrentBranch() ?? 'main';

    // ---- Fast-forward
    if (!oursHash || this.isAncestor(oursHash, theirs.hash)) {
      const err = this.overwriteError(this.findOverwriteConflicts(oursTree, theirs.tree), 'merge');
      if (err) throw err;
      const changedFiles = this.applyTree(oursTree, theirs.tree);
      this.setBranchHead(current, theirs.hash);
      return {
        type: 'fast-forward',
        from: oursHash ? oursHash.slice(0, 7) : '0000000',
        to: theirs.shortHash,
        changedFiles,
      };
    }

    // ---- Three-way merge
    const baseTree = this.getMergeBase(oursHash, theirs.hash)?.tree ?? {};
    const merged: Tree = {};
    const conflicts: GitConflict[] = [];
    const autoMerged: string[] = [];
    const paths = [
      ...new Set([...Object.keys(baseTree), ...Object.keys(oursTree), ...Object.keys(theirs.tree)]),
    ].sort();

    for (const p of paths) {
      const b = baseTree[p];
      const o = oursTree[p];
      const t = theirs.tree[p];
      if (o !== b && t !== b && o !== undefined && t !== undefined) autoMerged.push(p);

      if (o === t) {
        if (o !== undefined) merged[p] = o;
      } else if (o === b) {
        if (t !== undefined) merged[p] = t;
      } else if (t === b) {
        if (o !== undefined) merged[p] = o;
      } else if (o === undefined) {
        conflicts.push({ path: p, kind: 'deleted by us' });
      } else if (t === undefined) {
        conflicts.push({ path: p, kind: 'deleted by them' });
      } else {
        conflicts.push({ path: p, kind: b === undefined ? 'both added' : 'both modified' });
      }
    }

    // Conflicted paths keep "our" version in the index until resolved.
    const targetTree: Tree = { ...merged };
    for (const c of conflicts) {
      if (oursTree[c.path] !== undefined) targetTree[c.path] = oursTree[c.path];
    }
    const err = this.overwriteError(this.findOverwriteConflicts(oursTree, targetTree), 'merge');
    if (err) throw err;

    const message = `Merge branch '${branchName}'`;

    if (conflicts.length === 0) {
      const changedFiles = this.applyTree(oursTree, merged);
      const commit = this.createCommit(merged, message, author ?? this.fs.user, theirs.hash);
      return { type: 'merge', commit, changedFiles };
    }

    this.applyTree(oursTree, targetTree);
    for (const c of conflicts) {
      const o = oursTree[c.path];
      const t = theirs.tree[c.path];
      if (o !== undefined && t !== undefined) {
        this.writeWorkingFile(c.path, buildConflictContent(o, t, 'HEAD', branchName));
      } else {
        this.writeWorkingFile(c.path, (o ?? t) as string);
      }
    }
    this.saveMergeState({ mergeHead: theirs.hash, branch: branchName, message, conflicts });
    return { type: 'conflict', conflicts, autoMerged };
  }

  /** `git merge --abort`: drop the in-progress merge and restore HEAD. */
  abortMerge(): void {
    const state = this.getMergeState();
    if (!state) {
      throw new Error('fatal: There is no merge to abort (MERGE_HEAD missing).');
    }
    const headTree = this.getHeadCommit()?.tree ?? {};
    const index = this.getIndex();
    const paths = new Set([
      ...Object.keys(index),
      ...Object.keys(headTree),
      ...state.conflicts.map((c) => c.path),
    ]);
    const working = this.getWorkingFiles();
    for (const p of paths) {
      if (p in headTree) {
        if (working.get(p) !== headTree[p]) this.writeWorkingFile(p, headTree[p]);
      } else if (p in index || state.conflicts.some((c) => c.path === p)) {
        this.removeWorkingFile(p);
      }
    }
    this.saveIndex({ ...headTree });
    this.saveMergeState(null);
  }
}
