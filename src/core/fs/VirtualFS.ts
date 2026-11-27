/**
 * In-memory virtual file system.
 *
 * All public methods take absolute, normalized paths (use `resolve()` first).
 * Errors are thrown as `FsError` with POSIX-like codes so that commands can
 * translate them into familiar Linux error messages.
 */

export type FsErrorCode = 'ENOENT' | 'EEXIST' | 'ENOTDIR' | 'EISDIR' | 'ENOTEMPTY' | 'EINVAL' | 'EFBIG' | 'ENOSPC';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_TOTAL_NODES = 2000;
export const MAX_TOTAL_SIZE = 20 * 1024 * 1024;

const ERROR_MESSAGES: Record<FsErrorCode, string> = {
  ENOENT: 'No such file or directory',
  EEXIST: 'File exists',
  ENOTDIR: 'Not a directory',
  EISDIR: 'Is a directory',
  ENOTEMPTY: 'Directory not empty',
  EINVAL: 'Invalid argument',
  EFBIG: 'File too large',
  ENOSPC: 'No space left on device',
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

const utf8ByteLength = (content: string): number => new TextEncoder().encode(content).byteLength;

export type FsChangeAction = 'create' | 'modify' | 'delete' | 'move';

export interface FsChangeEvent {
  action: FsChangeAction;
  path: string;
  targetPath?: string;
}

export type FsChangeListener = (event: FsChangeEvent) => void;

export class VirtualFS {
  root: DirNode;
  readonly user: string;
  readonly home: string;
  readonly now: () => number;
  private changeListeners = new Set<FsChangeListener>();

  constructor(options: VirtualFSOptions = {}) {
    this.user = options.user ?? 'kullanici';
    this.home = options.home ?? `/home/${this.user}`;
    this.now = options.now ?? (() => Date.now());
    this.root = this.makeDir('', 'root');
  }

  subscribe(listener: FsChangeListener): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  private notify(event: FsChangeEvent): void {
    this.changeListeners.forEach((l) => l(event));
  }

  private totals(node: FsNode = this.root): { nodes: number; size: number } {
    if (node.type === 'file') return { nodes: 1, size: utf8ByteLength(node.content) };
    let nodes = 1;
    let size = 0;
    for (const child of Object.values(node.children)) {
      const next = this.totals(child);
      nodes += next.nodes;
      size += next.size;
    }
    return { nodes, size };
  }

  private ensureCapacity(abs: string, replacement: FsNode, existing?: FsNode | null): void {
    const current = this.totals();
    const old = existing ? this.totals(existing) : { nodes: 0, size: 0 };
    const next = this.totals(replacement);
    if (current.nodes - old.nodes + next.nodes > MAX_TOTAL_NODES) throw new FsError('ENOSPC', abs);
    if (current.size - old.size + next.size > MAX_TOTAL_SIZE) throw new FsError('ENOSPC', abs);
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
    const finalContent = options.append && existing?.type === 'file'
      ? existing.content + content
      : content;
    if (utf8ByteLength(finalContent) > MAX_FILE_SIZE) {
      throw new FsError('EFBIG', abs);
    }
    if (existing) {
      if (existing.type === 'dir') throw new FsError('EISDIR', abs);
      this.ensureCapacity(abs, this.makeFile(existing.name, options.append ? existing.content + content : content), existing);
      existing.content = options.append ? existing.content + content : content;
      existing.mtime = this.now();
      this.notify({ action: 'modify', path: abs });
      return;
    }
    const { parent, name } = this.parentOf(abs);
    this.ensureCapacity(abs, this.makeFile(name, content));
    parent.children[name] = this.makeFile(name, content);
    parent.mtime = this.now();
    this.notify({ action: 'create', path: abs });
  }

  /** Create an empty file or update the modification time of an existing node. */
  touch(abs: string): void {
    const existing = this.tryLookup(abs);
    if (existing) {
      existing.mtime = this.now();
      this.notify({ action: 'modify', path: abs });
      return;
    }
    this.writeFile(abs, '');
  }

  mkdir(abs: string, options: { parents?: boolean } = {}): void {
    if (options.parents) {
      let current = this.root;
      let path = '';
      let missingParent: DirNode | null = null;
      let firstMissingIndex = -1;
      const parts = splitPath(abs);
      const createdPaths: string[] = [];
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        path += '/' + part;
        if (missingParent) {
          createdPaths.push(path);
          continue;
        }
        const child: FsNode | undefined = current.children[part];
        if (!child) {
          missingParent = current;
          firstMissingIndex = i;
          createdPaths.push(path);
        } else if (child.type === 'dir') {
          current = child;
        } else {
          throw new FsError(i === parts.length - 1 ? 'EEXIST' : 'ENOTDIR', path);
        }
      }

      if (missingParent && firstMissingIndex >= 0) {
        if (this.totals().nodes + createdPaths.length > MAX_TOTAL_NODES) {
          throw new FsError('ENOSPC', createdPaths[createdPaths.length - 1]);
        }

        let firstCreated: DirNode | null = null;
        let previous: DirNode | null = null;
        for (let i = firstMissingIndex; i < parts.length; i++) {
          const dir = this.makeDir(parts[i]);
          if (previous) {
            const parentMtime = this.now();
            previous.children[dir.name] = dir;
            previous.mtime = parentMtime;
          } else {
            firstCreated = dir;
          }
          previous = dir;
        }
        if (firstCreated) {
          const parentMtime = this.now();
          missingParent.children[parts[firstMissingIndex]] = firstCreated;
          missingParent.mtime = parentMtime;
        }
      }
      for (const p of createdPaths) {
        this.notify({ action: 'create', path: p });
      }
      return;
    }
    if (this.exists(abs)) throw new FsError('EEXIST', abs);
    const { parent, name } = this.parentOf(abs);
    this.ensureCapacity(abs, this.makeDir(name));
    parent.children[name] = this.makeDir(name);
    parent.mtime = this.now();
    this.notify({ action: 'create', path: abs });
  }

  remove(abs: string, options: { recursive?: boolean } = {}): void {
    const node = this.lookup(abs);
    if (node.type === 'dir' && !options.recursive) throw new FsError('EISDIR', abs);
    const { parent, name } = this.parentOf(abs);
    delete parent.children[name];
    parent.mtime = this.now();
    this.notify({ action: 'delete', path: abs });
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
      const merged = cloneNode(existing);
      if (merged.type === 'dir') Object.assign(merged.children, clone.children);
      this.ensureCapacity(dest, merged, existing);
      Object.assign(existing.children, clone.children);
      existing.mtime = this.now();
    } else {
      this.ensureCapacity(dest, clone, existing);
      parent.children[name] = clone;
    }
    parent.mtime = this.now();
    this.notify({ action: 'create', path: dest });
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
    this.notify({ action: 'move', path: src, targetPath: dest });
  }

  // -------------------------------------------------------- serialization

  /** Apply a seed on top of the current tree (creates parents as needed). */
  seed(seed: FsSeed): void {
    if (seed.dirs !== undefined && (!Array.isArray(seed.dirs) || !seed.dirs.every((dir) => typeof dir === 'string'))) {
      throw new FsError('EINVAL', '/');
    }
    if (seed.files !== undefined && (!isRecord(seed.files) ||
      !Object.values(seed.files).every((content) => typeof content === 'string'))) {
      throw new FsError('EINVAL', '/');
    }

    const staged = VirtualFS.fromJSON(this.root, { user: this.user, home: this.home, now: this.now });
    const events: FsChangeEvent[] = [];
    staged.subscribe((event) => events.push(event));
    for (const dir of seed.dirs ?? []) staged.mkdir(staged.resolve(dir), { parents: true });
    for (const [path, content] of Object.entries(seed.files ?? {})) {
      const abs = staged.resolve(path);
      staged.mkdir(dirname(abs), { parents: true });
      staged.writeFile(abs, content);
    }
    this.root = staged.root;
    events.forEach((event) => this.notify(event));
  }

  /** Change file mode bits (and optionally all descendants). */
  chmod(
    abs: string,
    modeOrUpdater: number | ((current: number) => number),
    options: { recursive?: boolean } = {},
  ): void {
    const apply = (node: FsNode) => {
      node.mode = typeof modeOrUpdater === 'function' ? modeOrUpdater(node.mode) : modeOrUpdater;
      if (options.recursive && node.type === 'dir') Object.values(node.children).forEach(apply);
    };
    apply(this.lookup(abs));
    this.notify({ action: 'modify', path: abs });
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
    let validatedRoot: DirNode;
    try {
      validatedRoot = validateAndCloneRoot(root);
    } catch (error) {
      if (error instanceof FsError) throw error;
      throw new FsError('EINVAL', '/');
    }
    const fs = new VirtualFS(options);
    fs.root = validatedRoot;
    return fs;
  }

  clone(): VirtualFS {
    return VirtualFS.fromJSON(this.root, { user: this.user, home: this.home, now: this.now });
  }

  // ------------------------------------------------------------- helpers

  private makeDir(name: string, owner = this.user): DirNode {
    return { type: 'dir', name, children: Object.create(null), mode: 0o755, owner, group: owner, mtime: this.now() };
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

function cloneNode(node: FsNode, depth = 0): FsNode {
  if (depth > 64) throw new FsError('EINVAL', node.name);
  if (node.type === 'file') return { ...node };
  const children: Record<string, FsNode> = Object.create(null);
  for (const [k, v] of Object.entries(node.children)) {
    Object.defineProperty(children, k, {
      value: cloneNode(v, depth + 1),
      enumerable: true,
      configurable: true,
      writable: true,
    });
  }
  return { ...node, children };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateAndCloneRoot(root: unknown): DirNode {
  let nodeCount = 0;
  let totalSize = 0;

  const visit = (value: unknown, depth: number, path: string, expectedName?: string): FsNode => {
    if (depth > 64) throw new FsError('EINVAL', path);
    if (!isRecord(value)) throw new FsError('EINVAL', path);

    const name = value.name;
    const mode = value.mode;
    const owner = value.owner;
    const group = value.group;
    const mtime = value.mtime;
    if (typeof name !== 'string' || typeof owner !== 'string' || typeof group !== 'string' ||
        typeof mode !== 'number' || !Number.isSafeInteger(mode) || mode < 0 ||
        typeof mtime !== 'number' || !Number.isFinite(mtime)) {
      throw new FsError('EINVAL', path);
    }
    if (expectedName === undefined) {
      if (name !== '' || value.type !== 'dir') throw new FsError('EINVAL', path);
    } else if (name !== expectedName || !name || name === '.' || name === '..' || name.includes('/') || name.includes('\0')) {
      throw new FsError('EINVAL', path);
    }

    nodeCount++;
    if (nodeCount > MAX_TOTAL_NODES) throw new FsError('ENOSPC', path);

    if (value.type === 'file') {
      if (Object.hasOwn(value, 'children') || typeof value.content !== 'string') throw new FsError('EINVAL', path);
      const size = utf8ByteLength(value.content);
      if (size > MAX_FILE_SIZE) throw new FsError('EFBIG', path);
      totalSize += size;
      if (totalSize > MAX_TOTAL_SIZE) throw new FsError('ENOSPC', path);
      return { type: 'file', name, content: value.content, mode, owner, group, mtime };
    }

    if (value.type !== 'dir' || Object.hasOwn(value, 'content') || !isRecord(value.children)) {
      throw new FsError('EINVAL', path);
    }
    const children: Record<string, FsNode> = Object.create(null);
    for (const key in value.children) {
      if (!Object.hasOwn(value.children, key)) continue;
      const childPath = path === '/' ? `/${key}` : `${path}/${key}`;
      Object.defineProperty(children, key, {
        value: visit(value.children[key], depth + 1, childPath, key),
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
    return { type: 'dir', name, children, mode, owner, group, mtime };
  };

  const cloned = visit(root, 0, '/') as DirNode;
  return cloned;
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
