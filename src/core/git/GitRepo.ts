import { dirname, joinPath, type FsNode, type VirtualFS } from '../fs/VirtualFS';
import { buildConflictContent } from './diff';
import { GitIgnore } from './gitignore';
import type {
  GitBranchConfig,
  GitBranchInfo,
  GitCommit,
  GitConflict,
  GitFileDiff,
  GitIndex,
  GitMergeResult,
  GitMergeState,
  GitPullResult,
  GitPushResult,
  GitRemoteInfo,
  GitRepoConfig,
  GitStatusResult,
} from './types';

/** Map remote URL or local path to a deterministic virtual remote path under /var/klu-remotes. */
export function urlToRemotePath(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('/var/klu-remotes/')) {
    return trimmed;
  }
  let host = '';
  let owner = '';
  let repo = '';
  try {
    const parsedUrl = new URL(trimmed);
    host = parsedUrl.host;
    const parts = parsedUrl.pathname.split('/').filter(Boolean);
    owner = parts.at(-2) ?? '';
    repo = (parts.at(-1) ?? '').replace(/\.git$/i, '');
  } catch {
    // SCP-style Git URLs and virtual paths are parsed below.
    const scp = trimmed.match(/^(?:[^@]+@)?([^:]+):/);
    host = scp?.[1] ?? '';
    const path = trimmed.slice(trimmed.indexOf(':') + 1).replace(/\.git\/?$/i, '');
    const parts = path.split('/').filter(Boolean);
    owner = parts.at(-2) ?? '';
    repo = parts.at(-1) ?? '';
  }
  if (!owner || !repo) {
    const fallback = trimmed.split('/').filter(Boolean).at(-1)?.replace(/\.git$/i, '') || 'klu-repo';
    return `/var/klu-remotes/${encodeURIComponent(fallback)}`;
  }
  const safeSegment = (part: string) => encodeURIComponent(part).replace(/%2F/gi, '%252F');
  return `/var/klu-remotes/${safeSegment(host || 'local')}/${safeSegment(owner)}/${safeSegment(repo)}`;
}

/** Resolve older GitHub lesson fixtures while new remotes use collision-safe paths. */
function remotePathFor(fs: VirtualFS, url: string): string {
  const canonical = urlToRemotePath(url);
  if (fs.exists(canonical)) return canonical;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase() === 'github.com') {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const owner = parts.at(-2);
      const repo = parts.at(-1)?.replace(/\.git$/i, '');
      if (owner && repo) {
        const legacy = `/var/klu-remotes/${`${owner}-${repo}`.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        if (fs.exists(legacy)) return legacy;
      }
    }
  } catch { /* Invalid URLs simply use the canonical mapping. */ }
  return canonical;
}

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
  public readonly isBare: boolean;

  constructor(
    public readonly fs: VirtualFS,
    public readonly repoRoot: string,
    isBare = false,
  ) {
    this.isBare = isBare;
  }

  get gitDir(): string {
    return this.isBare ? this.repoRoot : joinPath(this.repoRoot, '.git');
  }

  // ---------------------------------------------------------------- discovery

  /**
   * Search upwards from `cwd` towards root `/` to find a repository.
   */
  static find(fs: VirtualFS, cwd: string): GitRepo | null {
    let curr = fs.resolve(cwd);
    // Check if current directory itself is a bare repo
    if (fs.exists(joinPath(curr, 'HEAD')) && fs.exists(joinPath(curr, 'commits.json')) && !fs.exists(joinPath(curr, '.git'))) {
      return new GitRepo(fs, curr, true);
    }
    while (true) {
      const gitPath = joinPath(curr, '.git');
      if (fs.exists(gitPath) && fs.isDir(gitPath)) {
        return new GitRepo(fs, curr, false);
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
   * Open a repository directly at a known path (bare or normal).
   */
  static open(fs: VirtualFS, path: string): GitRepo | null {
    const abs = fs.resolve(path);
    if (!fs.exists(abs) || !fs.isDir(abs)) return null;
    const dotGit = joinPath(abs, '.git');
    if (fs.exists(dotGit) && fs.isDir(dotGit)) {
      return new GitRepo(fs, abs, false);
    }
    if (fs.exists(joinPath(abs, 'HEAD')) && fs.exists(joinPath(abs, 'commits.json'))) {
      return new GitRepo(fs, abs, true);
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
    options: { bare?: boolean } = {},
  ): { repo: GitRepo; isReinit: boolean } {
    const absTarget = fs.resolve(targetDir);
    const isBare = !!options.bare;
    const gitDir = isBare ? absTarget : joinPath(absTarget, '.git');

    if (fs.exists(gitDir) && fs.isDir(gitDir)) {
      if (fs.exists(joinPath(gitDir, 'commits.json'))) {
        return { repo: new GitRepo(fs, absTarget, isBare), isReinit: true };
      }
    }

    fs.mkdir(gitDir, { parents: true });
    fs.mkdir(joinPath(gitDir, 'refs/heads'), { parents: true });
    fs.mkdir(joinPath(gitDir, 'refs/remotes'), { parents: true });
    fs.writeFile(joinPath(gitDir, 'HEAD'), `ref: refs/heads/${defaultBranch}\n`);
    fs.writeFile(joinPath(gitDir, 'index.json'), '{}');
    fs.writeFile(joinPath(gitDir, 'commits.json'), '[]');
    fs.writeFile(joinPath(gitDir, 'config.json'), JSON.stringify({ remotes: {}, branches: {} }, null, 2));

    return { repo: new GitRepo(fs, absTarget, isBare), isReinit: false };
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
      const parsed: unknown = JSON.parse(this.fs.readFile(commitsPath));
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is GitCommit => {
        if (!item || typeof item !== 'object') return false;
        const c = item as Record<string, unknown>;
        return typeof c.hash === 'string' && typeof c.shortHash === 'string' &&
          typeof c.message === 'string' && typeof c.author === 'string' &&
          typeof c.timestamp === 'number' && (c.parent === null || typeof c.parent === 'string') &&
          !!c.tree && typeof c.tree === 'object' && !Array.isArray(c.tree) &&
          Object.entries(c.tree as Record<string, unknown>).every(([path, value]) =>
            typeof value === 'string' && !path.startsWith('/') &&
            !path.split('/').some((part) => part === '..' || part === '.git')) &&
          (c.mergeParent === undefined || c.mergeParent === null || typeof c.mergeParent === 'string');
      });
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
    const result: GitIndex = Object.create(null);
    if (!this.fs.exists(indexPath)) return result;
    try {
      const parsed = JSON.parse(this.fs.readFile(indexPath));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const [k, v] of Object.entries(parsed)) {
          if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
          if (typeof v === 'string') {
            result[k] = v;
          }
        }
      }
      return result;
    } catch {
      return result;
    }
  }

  saveIndex(index: GitIndex): void {
    this.fs.writeFile(joinPath(this.gitDir, 'index.json'), JSON.stringify(index, null, 2));
  }

  saveCommits(commits: GitCommit[]): void {
    this.fs.writeFile(joinPath(this.gitDir, 'commits.json'), JSON.stringify(commits, null, 2));
  }

  addCommits(newCommits: GitCommit[]): void {
    const existing = this.getCommits();
    const map = new Map<string, GitCommit>();
    for (const c of existing) map.set(c.hash, c);
    for (const c of newCommits) map.set(c.hash, c);
    this.saveCommits(Array.from(map.values()));
  }

  setBranchHead(branch: string, commitHash: string): void {
    const branchPath = joinPath(this.gitDir, `refs/heads/${branch}`);
    const parent = dirname(branchPath);
    if (!this.fs.exists(parent)) {
      this.fs.mkdir(parent, { parents: true });
    }
    this.fs.writeFile(branchPath, commitHash + '\n');
  }

  /** Point HEAD at `refs/heads/<branch>`. */
  setHeadRef(branch: string): void {
    this.fs.writeFile(joinPath(this.gitDir, 'HEAD'), `ref: refs/heads/${branch}\n`);
  }

  // ------------------------------------------------------------- remote tracking

  getRemoteTrackingBranchHash(remote: string, branch: string): string | null {
    const refPath = joinPath(this.gitDir, `refs/remotes/${remote}/${branch}`);
    if (!this.fs.isFile(refPath)) return null;
    const hash = this.fs.readFile(refPath).trim();
    return hash || null;
  }

  setRemoteTrackingBranchHead(remote: string, branch: string, commitHash: string): void {
    const refPath = joinPath(this.gitDir, `refs/remotes/${remote}/${branch}`);
    const parent = dirname(refPath);
    if (!this.fs.exists(parent)) {
      this.fs.mkdir(parent, { parents: true });
    }
    this.fs.writeFile(refPath, commitHash + '\n');
  }

  // ------------------------------------------------------------- config & remotes

  getConfig(): GitRepoConfig {
    const configPath = joinPath(this.gitDir, 'config.json');
    const remotes: Record<string, { url: string }> = Object.create(null);
    const branches: Record<string, GitBranchConfig> = Object.create(null);
    if (!this.fs.exists(configPath)) {
      return { remotes, branches };
    }
    try {
      const parsed = JSON.parse(this.fs.readFile(configPath));
      if (parsed && typeof parsed === 'object') {
        if (parsed.remotes && typeof parsed.remotes === 'object') {
          for (const [k, v] of Object.entries(parsed.remotes)) {
            if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype' && v && typeof v === 'object' && 'url' in v) {
              if (typeof (v as { url: unknown }).url === 'string') remotes[k] = { url: (v as { url: string }).url };
            }
          }
        }
        if (parsed.branches && typeof parsed.branches === 'object') {
          for (const [k, v] of Object.entries(parsed.branches)) {
            if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype' && v && typeof v === 'object') {
              const b = v as { remote?: unknown; merge?: unknown };
              if (typeof b.remote === 'string' && typeof b.merge === 'string') {
                branches[k] = {
                  remote: b.remote,
                  merge: b.merge,
                };
              }
            }
          }
        }
      }
      return { remotes, branches };
    } catch {
      return { remotes, branches };
    }
  }

  saveConfig(config: GitRepoConfig): void {
    this.fs.writeFile(joinPath(this.gitDir, 'config.json'), JSON.stringify(config, null, 2));
  }

  getRemotes(): GitRemoteInfo[] {
    const conf = this.getConfig();
    return Object.entries(conf.remotes).map(([name, r]) => ({ name, url: r.url }));
  }

  addRemote(name: string, url: string): void {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName || !trimmedUrl) {
      throw new Error('fatal: remote name and URL are required');
    }
    if (trimmedName === '__proto__' || trimmedName === 'constructor' || trimmedName === 'prototype') {
      throw new Error(`fatal: '${trimmedName}' is not a valid remote name`);
    }
    const conf = this.getConfig();
    if (Object.hasOwn(conf.remotes, trimmedName)) {
      throw new Error(`fatal: remote ${trimmedName} already exists.`);
    }
    conf.remotes[trimmedName] = { url: trimmedUrl };
    this.saveConfig(conf);
  }

  removeRemote(name: string): void {
    const trimmedName = name.trim();
    const conf = this.getConfig();
    if (!Object.hasOwn(conf.remotes, trimmedName)) {
      throw new Error(`fatal: No such remote: '${trimmedName}'`);
    }
    delete conf.remotes[trimmedName];
    for (const [branch, bConf] of Object.entries(conf.branches)) {
      if (bConf.remote === trimmedName) {
        delete conf.branches[branch];
      }
    }
    this.saveConfig(conf);
    const remoteRefDir = joinPath(this.gitDir, 'refs/remotes', trimmedName);
    if (this.fs.exists(remoteRefDir)) {
      this.fs.remove(remoteRefDir);
    }
  }

  setUpstream(branch: string, remote: string, mergeRef = `refs/heads/${branch}`): void {
    const conf = this.getConfig();
    conf.branches[branch] = { remote, merge: mergeRef };
    this.saveConfig(conf);
  }

  getUpstream(branch: string): { remote: string; merge: string } | null {
    const conf = this.getConfig();
    return conf.branches[branch] || null;
  }

  // ------------------------------------------------------------ merge state

  private get mergeStatePath(): string {
    return joinPath(this.gitDir, 'MERGE_STATE.json');
  }

  getMergeState(): GitMergeState | null {
    if (!this.fs.isFile(this.mergeStatePath)) return null;
    try {
      const parsed: unknown = JSON.parse(this.fs.readFile(this.mergeStatePath));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
      const state = parsed as Record<string, unknown>;
      if (typeof state.mergeHead !== 'string' || typeof state.branch !== 'string' ||
          typeof state.message !== 'string' || !Array.isArray(state.conflicts)) return null;
      if (!state.conflicts.every((c) => !!c && typeof c === 'object' &&
          typeof (c as Record<string, unknown>).path === 'string' &&
          typeof (c as Record<string, unknown>).kind === 'string')) return null;
      return parsed as GitMergeState;
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
          if (Object.hasOwn(headTree, p)) index[p] = headTree[p];
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

  /** Core merge logic by commit hash. */
  mergeCommitHash(
    theirsHash: string,
    displayName: string,
    author?: string,
    customMessage?: string,
  ): GitMergeResult {
    if (this.getMergeState()) {
      throw new Error(
        'fatal: You have not concluded your merge (MERGE_HEAD exists).\n' +
          'Please, commit your changes before you merge.',
      );
    }
    const theirs = this.getCommit(theirsHash);
    if (!theirs) {
      throw new Error(`merge: ${displayName} - not something we can merge`);
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

    const message = customMessage ?? `Merge branch '${displayName}'`;

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
        this.writeWorkingFile(c.path, buildConflictContent(o, t, 'HEAD', displayName));
      } else {
        this.writeWorkingFile(c.path, (o ?? t) as string);
      }
    }
    this.saveMergeState({ mergeHead: theirs.hash, branch: displayName, message, conflicts });
    return { type: 'conflict', conflicts, autoMerged };
  }

  /** `git merge <branch>`: fast-forward, three-way merge commit, or conflict. */
  merge(branchName: string, author?: string): GitMergeResult {
    const theirsHash = this.getBranchCommitHash(branchName);
    if (!theirsHash) {
      throw new Error(`merge: ${branchName} - not something we can merge`);
    }
    return this.mergeCommitHash(theirsHash, branchName, author);
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

  // ---------------------------------------------------------------- remote ops

  push(
    remoteName?: string,
    branchName?: string,
    options: { setUpstream?: boolean } = {},
  ): GitPushResult {
    const currentBranch = this.getCurrentBranch() ?? 'main';
    const localHash = (branchName ? this.getBranchCommitHash(branchName) : null) ?? this.getHeadCommitHash();

    if (!localHash) {
      throw new Error(
        `error: src refspec ${branchName ?? currentBranch} does not match any\n` +
          `error: failed to push some refs to remote`,
      );
    }

    let targetRemote = remoteName;
    let targetBranch = branchName;

    if (!targetRemote) {
      const upstream = this.getUpstream(currentBranch);
      if (!upstream) {
        throw new Error(
          `fatal: The current branch ${currentBranch} has no upstream branch.\n` +
            `To push the current branch and set the remote as upstream, use\n\n` +
            `    git push --set-upstream origin ${currentBranch}\n`,
        );
      }
      targetRemote = upstream.remote;
      targetBranch = targetBranch ?? upstream.merge.replace(/^refs\/heads\//, '');
    }

    if (!targetBranch) {
      targetBranch = currentBranch;
    }

    const conf = this.getConfig();
    const rConfig = conf.remotes[targetRemote];
    if (!rConfig) {
      throw new Error(
        `fatal: '${targetRemote}' does not appear to be a git repository\n` +
          `fatal: Could not read from remote repository.`,
      );
    }

    const remotePath = remotePathFor(this.fs, rConfig.url);
    const remoteRepo = GitRepo.open(this.fs, remotePath);
    if (!remoteRepo) {
      throw new Error(
        `fatal: repository '${rConfig.url}' does not exist\n` +
          `fatal: Could not read from remote repository.`,
      );
    }

    const remoteHash = remoteRepo.getBranchCommitHash(targetBranch);
    const isNewBranch = !remoteHash;

    if (remoteHash && remoteHash !== localHash) {
      if (!this.isAncestor(remoteHash, localHash)) {
        throw new Error(
          `To ${rConfig.url}\n` +
            ` ! [rejected]        ${targetBranch} -> ${targetBranch} (fetch first)\n` +
            `error: failed to push some refs to '${rConfig.url}'\n` +
            `hint: Updates were rejected because the remote contains work that you do\n` +
            `hint: not have locally. This is usually caused by another repository pushing\n` +
            `hint: to the same ref. You may want to first integrate the remote changes\n` +
            `hint: (e.g., 'git pull ...') before pushing again.\n` +
            `hint: See the 'Note about fast-forwards' in 'git push --help' for details.`,
        );
      }
    }

    // Transfer commits
    remoteRepo.addCommits(this.getCommits());
    remoteRepo.setBranchHead(targetBranch, localHash);

    // If remote is bare and unborn HEAD, point to branch
    if (remoteRepo.isBare) {
      const headBranch = remoteRepo.getCurrentBranch();
      if (!headBranch) {
        remoteRepo.setHeadRef(targetBranch);
      }
    }

    // Update local remote-tracking branch
    this.setRemoteTrackingBranchHead(targetRemote, targetBranch, localHash);

    // Save upstream tracking
    if (options.setUpstream) {
      this.setUpstream(targetBranch, targetRemote, `refs/heads/${targetBranch}`);
    }

    return {
      remote: targetRemote,
      branch: targetBranch,
      url: rConfig.url,
      isNewBranch,
      oldHash: remoteHash,
      newHash: localHash,
      setUpstream: !!options.setUpstream,
    };
  }

  pull(remoteName?: string, branchName?: string, author?: string): GitPullResult {
    const currentBranch = this.getCurrentBranch() ?? 'main';
    let targetRemote = remoteName;
    let targetBranch = branchName;

    if (!targetRemote) {
      const upstream = this.getUpstream(currentBranch);
      if (!upstream) {
        throw new Error(
          `There is no tracking information for the current branch.\n` +
            `Please specify which branch you want to merge with.\n` +
            `See git-pull(1) for details.\n\n` +
            `    git pull <remote> <branch>\n\n` +
            `If you wish to set tracking information for this branch you can do so with:\n\n` +
            `    git branch --set-upstream-to=<remote>/<branch> ${currentBranch}\n`,
        );
      }
      targetRemote = upstream.remote;
      targetBranch = targetBranch ?? upstream.merge.replace(/^refs\/heads\//, '');
    }

    if (!targetBranch) {
      targetBranch = currentBranch;
    }

    const conf = this.getConfig();
    const rConfig = conf.remotes[targetRemote];
    if (!rConfig) {
      throw new Error(
        `fatal: '${targetRemote}' does not appear to be a git repository\n` +
          `fatal: Could not read from remote repository.`,
      );
    }

    const remotePath = remotePathFor(this.fs, rConfig.url);
    const remoteRepo = GitRepo.open(this.fs, remotePath);
    if (!remoteRepo) {
      throw new Error(
        `fatal: repository '${rConfig.url}' does not exist\n` +
          `fatal: Could not read from remote repository.`,
      );
    }

    const remoteHash = remoteRepo.getBranchCommitHash(targetBranch);
    if (!remoteHash) {
      throw new Error(`fatal: couldn't find remote ref ${targetBranch}`);
    }

    // Transfer remote commits to local
    this.addCommits(remoteRepo.getCommits());
    this.setRemoteTrackingBranchHead(targetRemote, targetBranch, remoteHash);

    // Merge remote branch into current branch
    return this.mergeCommitHash(
      remoteHash,
      `${targetRemote}/${targetBranch}`,
      author ?? this.fs.user,
      `Merge branch '${targetBranch}' of ${rConfig.url}`,
    );
  }

  static clone(
    fs: VirtualFS,
    url: string,
    targetDir?: string,
    cwd = '/',
  ): { repo: GitRepo; branch: string; targetDir: string; commitCount: number } {
    let resolvedDir = targetDir;
    if (!resolvedDir) {
      const noGit = url.trim().replace(/\.git\/?$/, '');
      const parts = noGit.split(/[/:]+/).filter(Boolean);
      resolvedDir = parts[parts.length - 1] || 'repo';
    }

    const absTarget = fs.resolve(resolvedDir, cwd);

    if (fs.exists(absTarget)) {
      if (!fs.isDir(absTarget) || fs.readdir(absTarget).length > 0) {
        throw new Error(
          `fatal: destination path '${resolvedDir}' already exists and is not an empty directory.`,
        );
      }
    }

    const remotePath = remotePathFor(fs, url);
    const remoteRepo = GitRepo.open(fs, remotePath);
    if (!remoteRepo) {
      throw new Error(`fatal: repository '${url}' does not exist`);
    }

    const remoteBranch = remoteRepo.getCurrentBranch() ?? 'main';
    const remoteHash = remoteRepo.getBranchCommitHash(remoteBranch);

    const { repo } = GitRepo.init(fs, absTarget, remoteBranch);
    const remoteCommits = remoteRepo.getCommits();
    repo.addCommits(remoteCommits);

    // Configure origin remote and branch tracking
    repo.addRemote('origin', url);
    repo.setUpstream(remoteBranch, 'origin', `refs/heads/${remoteBranch}`);

    if (remoteHash) {
      repo.setBranchHead(remoteBranch, remoteHash);
      repo.setRemoteTrackingBranchHead('origin', remoteBranch, remoteHash);
      repo.setHeadRef(remoteBranch);

      const commit = repo.getCommit(remoteHash);
      if (commit) {
        repo.applyTree({}, commit.tree);
        repo.saveIndex({ ...commit.tree });
      }
    }

    return {
      repo,
      branch: remoteBranch,
      targetDir: absTarget,
      commitCount: remoteCommits.length,
    };
  }
}
