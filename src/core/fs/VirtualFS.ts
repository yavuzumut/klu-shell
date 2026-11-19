/**
 * In-memory virtual file system.
 *
 * All public methods take absolute, normalized paths (use `resolve()` first).
 * Errors are thrown as `FsError` with POSIX-like codes so that commands can
 * translate them into familiar Linux error messages.
 */

export type FsErrorCode = 'ENOENT' | 'EEXIST' | 'ENOTDIR' | 'EISDIR' | 'ENOTEMPTY' | 'EINVAL';

const ERROR_MESSAGES: Record<FsErrorCode, string> = {
  ENOENT: 'No such file or directory',
  EEXIST: 'File exists',
  ENOTDIR: 'Not a directory',
  EISDIR: 'Is a directory',
  ENOTEMPTY: 'Directory not empty',
  EINVAL: 'Invalid argument',
};

export class FsError extends Error {
  constructor(
    public readonly code: FsErrorCode,
    public readonly path: string,
  ) {
    super(`${code}: ${path}`);
    this.name = 'FsError';
  }

  /** Human readable, Linux style message, e.g. "No such file or directory". */
  get description(): string {
    return ERROR_MESSAGES[this.code];
  }
}

export function fsErrorMessage(err: unknown): string {
  if (err instanceof FsError) return err.description;
  return err instanceof Error ? err.message : String(err);
}

interface BaseNode {
  name: string;
  /** Permission bits, e.g. 0o755. Not enforced yet (reserved for chmod). */
  mode: number;
  owner: string;
  group: string;
  /** Last modification time (ms since epoch). */
  mtime: number;
}

export interface FileNode extends BaseNode {
  type: 'file';
  content: string;
}

export interface DirNode extends BaseNode {
  type: 'dir';
  children: Record<string, FsNode>;
}

export type FsNode = FileNode | DirNode;

/** Declarative description used to seed a file system (lessons, defaults). */
export interface FsSeed {
  dirs?: string[];
  files?: Record<string, string>;
}

export interface VirtualFSOptions {
  user?: string;
  home?: string;
  now?: () => number;
}

export function splitPath(abs: string): string[] {
  return abs.split('/').filter(Boolean);
}

export function dirname(abs: string): string {
  const parts = splitPath(abs);
  parts.pop();
  return '/' + parts.join('/');
}

export function basename(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '/';
}

export function joinPath(...parts: string[]): string {
  return parts.join('/').replace(/\/+/g, '/');
}

export class VirtualFS {
  root: DirNode;
  readonly user: string;
  readonly home: string;
  private readonly now: () => number;

  constructor(options: VirtualFSOptions = {}) {
    this.user = options.user ?? 'kullanici';
    this.home = options.home ?? `/home/${this.user}`;
    this.now = options.now ?? (() => Date.now());
    this.root = this.makeDir('', 'root');
  }

  // ---------------------------------------------------------------- paths

  /**
   * Resolve `path` against `cwd` into an absolute normalized path.
   * Supports `.`, `..`, `~` and `~/...`.
   */
  resolve(path: string, cwd = '/'): string {
    let p = path;
    if (p === '~' || p.startsWith('~/')) p = this.home + p.slice(1);
    const stack = p.startsWith('/') ? [] : splitPath(cwd);
    for (const part of p.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
    }
    return '/' + stack.join('/');
  }

  /** Display a path with the home directory abbreviated as `~`. */
  prettyPath(abs: string): string {
    if (abs === this.home) return '~';
    if (abs.startsWith(this.home + '/')) return '~' + abs.slice(this.home.length);
    return abs;
  }

  // --------------------------------------------------------------- lookup

  /** Return the node at `abs` or throw ENOENT / ENOTDIR. */
  lookup(abs: string): FsNode {
    let node: FsNode = this.root;
    for (const part of splitPath(abs)) {
      if (node.type !== 'dir') throw new FsError('ENOTDIR', abs);
      const child: FsNode | undefined = node.children[part];
      if (!child) throw new FsError('ENOENT', abs);
      node = child;
    }
    return node;
  }

  tryLookup(abs: string): FsNode | null {
    try {
      return this.lookup(abs);
    } catch {
      return null;
    }
  }

  exists(abs: string): boolean {
    return this.tryLookup(abs) !== null;
  }

  isDir(abs: string): boolean {
    return this.tryLookup(abs)?.type === 'dir';
  }

  isFile(abs: string): boolean {
    return this.tryLookup(abs)?.type === 'file';
  }

  private lookupDir(abs: string): DirNode {
    const node = this.lookup(abs);
    if (node.type !== 'dir') throw new FsError('ENOTDIR', abs);
    return node;
  }

  /** Parent directory node of `abs` (must exist and be a directory). */
  private parentOf(abs: string): { parent: DirNode; name: string } {
    const name = basename(abs);
    if (abs === '/' || !name) throw new FsError('EINVAL', abs);
    return { parent: this.lookupDir(dirname(abs)), name };
  }

  // ----------------------------------------------------------- operations

  /** Children of a directory sorted by name. */
  readdir(abs: string): FsNode[] {
    const dir = this.lookupDir(abs);
    return Object.values(dir.children).sort((a, b) => a.name.localeCompare(b.name));
  }

  readFile(abs: string): string {
    const node = this.lookup(abs);
    if (node.type === 'dir') throw new FsError('EISDIR', abs);
    return node.content;
  }

  writeFile(abs: string, content: string, options: { append?: boolean } = {}): void {
    const existing = this.tryLookup(abs);
    if (existing) {
      if (existing.type === 'dir') throw new FsError('EISDIR', abs);
      existing.content = options.append ? existing.content + content : content;
      existing.mtime = this.now();
      return;
    }
    const { parent, name } = this.parentOf(abs);
    parent.children[name] = this.makeFile(name, content);
    parent.mtime = this.now();
  }

  /** Create an empty file or update the modification time of an existing node. */
  touch(abs: string): void {
    const existing = this.tryLookup(abs);
    if (existing) {
      existing.mtime = this.now();
      return;
    }
    this.writeFile(abs, '');
  }

  mkdir(abs: string, options: { parents?: boolean } = {}): void {
    if (options.parents) {
      let current = this.root;
      let path = '';
      const parts = splitPath(abs);
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        path += '/' + part;
        const child: FsNode | undefined = current.children[part];
        if (!child) {
          const dir = this.makeDir(part);
          current.children[part] = dir;
          current.mtime = this.now();
          current = dir;
        } else if (child.type === 'dir') {
          current = child;
        } else {
          throw new FsError(i === parts.length - 1 ? 'EEXIST' : 'ENOTDIR', path);
        }
      }
      return;
    }
    if (this.exists(abs)) throw new FsError('EEXIST', abs);
    const { parent, name } = this.parentOf(abs);
    parent.children[name] = this.makeDir(name);
    parent.mtime = this.now();
  }

  remove(abs: string, options: { recursive?: boolean } = {}): void {
    const node = this.lookup(abs);
    if (node.type === 'dir' && !options.recursive) throw new FsError('EISDIR', abs);
    const { parent, name } = this.parentOf(abs);
    delete parent.children[name];
    parent.mtime = this.now();
  }

  /** Remove an empty directory. */
  rmdir(abs: string): void {
    const node = this.lookup(abs);
    if (node.type !== 'dir') throw new FsError('ENOTDIR', abs);
    if (Object.keys(node.children).length) throw new FsError('ENOTEMPTY', abs);
    this.remove(abs, { recursive: true });
  }

  /**
   * Copy the node at `src` to exactly `dest` (dest is the final path, not
   * the containing directory). Overwrites an existing file at `dest`.
   */
  copy(src: string, dest: string, options: { recursive?: boolean } = {}): void {
    const node = this.lookup(src);
    if (node.type === 'dir' && !options.recursive) throw new FsError('EISDIR', src);
    if (node.type === 'dir' && isSubPath(dest, src)) throw new FsError('EINVAL', dest);
    const existing = this.tryLookup(dest);
    if (existing?.type === 'dir' && node.type === 'file') throw new FsError('EISDIR', dest);
    const { parent, name } = this.parentOf(dest);
    const clone = cloneNode(node);
    clone.name = name;
    touchTree(clone, this.now());
    if (existing?.type === 'dir' && clone.type === 'dir') {
      // Merge into the existing directory, like `cp -r a b` when b/a exists.
      Object.assign(existing.children, clone.children);
      existing.mtime = this.now();
    } else {
      parent.children[name] = clone;
    }
    parent.mtime = this.now();
  }

  /** Move/rename `src` to exactly `dest`. */
  move(src: string, dest: string): void {
    const node = this.lookup(src);
    if (src === dest) return;
    if (node.type === 'dir' && isSubPath(dest, src)) throw new FsError('EINVAL', dest);
    const existing = this.tryLookup(dest);
    if (existing) {
      if (existing.type === 'dir' && node.type === 'file') throw new FsError('EISDIR', dest);
      if (existing.type === 'file' && node.type === 'dir') throw new FsError('ENOTDIR', dest);
      if (existing.type === 'dir' && Object.keys(existing.children).length) {
        throw new FsError('ENOTEMPTY', dest);
      }
    }
    const { parent: destParent, name } = this.parentOf(dest);
    const { parent: srcParent, name: srcName } = this.parentOf(src);
    delete srcParent.children[srcName];
    node.name = name;
    destParent.children[name] = node;
    srcParent.mtime = destParent.mtime = this.now();
  }

  // -------------------------------------------------------- serialization

  /** Apply a seed on top of the current tree (creates parents as needed). */
  seed(seed: FsSeed): void {
    for (const dir of seed.dirs ?? []) this.mkdir(this.resolve(dir), { parents: true });
    for (const [path, content] of Object.entries(seed.files ?? {})) {
      const abs = this.resolve(path);
      this.mkdir(dirname(abs), { parents: true });
      this.writeFile(abs, content);
    }
  }

  /** Set the owner of a node (and optionally all descendants). */
  chown(abs: string, owner: string, options: { recursive?: boolean; mode?: number } = {}): void {
    const apply = (node: FsNode) => {
      node.owner = owner;
      node.group = owner;
      if (options.mode !== undefined) node.mode = options.mode;
      if (options.recursive && node.type === 'dir') Object.values(node.children).forEach(apply);
    };
    apply(this.lookup(abs));
  }

  toJSON(): DirNode {
    return cloneNode(this.root) as DirNode;
  }

  static fromJSON(root: DirNode, options: VirtualFSOptions = {}): VirtualFS {
    const fs = new VirtualFS(options);
    fs.root = cloneNode(root) as DirNode;
    return fs;
  }

  clone(): VirtualFS {
    return VirtualFS.fromJSON(this.root, { user: this.user, home: this.home, now: this.now });
  }

  // ------------------------------------------------------------- helpers

  private makeDir(name: string, owner = this.user): DirNode {
    return { type: 'dir', name, children: {}, mode: 0o755, owner, group: owner, mtime: this.now() };
  }

  private makeFile(name: string, content: string, owner = this.user): FileNode {
    return { type: 'file', name, content, mode: 0o644, owner, group: owner, mtime: this.now() };
  }
}

/** True if `path` equals `ancestor` or lies inside it. */
export function isSubPath(path: string, ancestor: string): boolean {
  if (ancestor === '/') return true;
  return path === ancestor || path.startsWith(ancestor + '/');
}

function cloneNode(node: FsNode): FsNode {
  if (node.type === 'file') return { ...node };
  const children: Record<string, FsNode> = {};
  for (const [k, v] of Object.entries(node.children)) children[k] = cloneNode(v);
  return { ...node, children };
}

function touchTree(node: FsNode, time: number): void {
  node.mtime = time;
  if (node.type === 'dir') Object.values(node.children).forEach((c) => touchTree(c, time));
}

/** Size in bytes as reported by `ls -l`. */
export function nodeSize(node: FsNode): number {
  return node.type === 'dir' ? 4096 : new TextEncoder().encode(node.content).length;
}

/** Permission string like `drwxr-xr-x`. */
export function modeString(node: FsNode): string {
  const chars = 'rwxrwxrwx';
  let out = node.type === 'dir' ? 'd' : '-';
  for (let i = 0; i < 9; i++) out += node.mode & (1 << (8 - i)) ? chars[i] : '-';
  return out;
}
