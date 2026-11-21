import { useState, useEffect, useRef } from 'react';
import type { VirtualFS, FsNode } from '../core/fs/VirtualFS';

interface FileTreeProps {
  fs: VirtualFS;
  cwd: string;
  onSelectPath?: (path: string) => void;
  onResetFs?: () => void;
  highlightedPath?: string | null;
}

interface TreeNodeProps {
  name: string;
  absPath: string;
  node: FsNode;
  fs: VirtualFS;
  cwd: string;
  level: number;
  openDirs: Set<string>;
  toggleDir: (path: string) => void;
  onSelectPath?: (path: string) => void;
  highlightedPath?: string | null;
}

function TreeNode({
  name,
  absPath,
  node,
  fs,
  cwd,
  level,
  openDirs,
  toggleDir,
  onSelectPath,
  highlightedPath,
}: TreeNodeProps) {
  const isDir = node.type === 'dir';
  const isOpen = openDirs.has(absPath);
  const isCwd = cwd === absPath;
  const isHighlighted = highlightedPath === absPath;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDir) {
      toggleDir(absPath);
    }
    if (onSelectPath) {
      onSelectPath(absPath);
    }
  };

  const children = isDir && isOpen ? fs.readdir(absPath) : [];

  return (
    <div className="tree-node-wrapper">
      <div
        className={`tree-node ${isCwd ? 'tree-node-cwd' : ''} ${isHighlighted ? 'tree-node-highlight' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        title={absPath}
      >
        <span className="tree-icon">
          {isDir ? (
            <span className="tree-arrow">{isOpen ? '▼' : '▶'}</span>
          ) : (
            <span className="tree-spacer" />
          )}
          {isDir ? '📁' : '📄'}
        </span>
        <span className="tree-label">{name || '/'}</span>
        {isCwd && <span className="tree-cwd-badge">cwd</span>}
      </div>
      {isDir && isOpen && (
        <div className="tree-children">
          {children.map((child) => {
            const childPath = absPath === '/' ? `/${child.name}` : `${absPath}/${child.name}`;
            return (
              <TreeNode
                key={childPath}
                name={child.name}
                absPath={childPath}
                node={child}
                fs={fs}
                cwd={cwd}
                level={level + 1}
                openDirs={openDirs}
                toggleDir={toggleDir}
                onSelectPath={onSelectPath}
                highlightedPath={highlightedPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function FileTree({ fs, cwd, onSelectPath, onResetFs, highlightedPath: externalHighlight }: FileTreeProps) {
  const [, setVersion] = useState(0);
  const [internalHighlight, setInternalHighlight] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);

  // Default open folders: / and /home and /home/kullanici
  const [openDirs, setOpenDirs] = useState<Set<string>>(() => {
    return new Set<string>(['/', '/home', fs.home]);
  });

  // Ensure current directory ancestors are open when cwd changes
  useEffect(() => {
    const parts = cwd.split('/').filter(Boolean);
    const pathsToOpen = ['/'];
    let cur = '';
    for (const part of parts) {
      cur += '/' + part;
      pathsToOpen.push(cur);
    }
    setOpenDirs((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const p of pathsToOpen) {
        if (!next.has(p)) {
          next.add(p);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [cwd]);

  // Subscribe to VirtualFS changes
  useEffect(() => {
    const unsubscribe = fs.subscribe((event) => {
      setVersion((v) => v + 1);

      if (event.action === 'create' || event.action === 'move') {
        const target = event.targetPath ?? event.path;
        setInternalHighlight(target);
        if (highlightTimeoutRef.current) {
          clearTimeout(highlightTimeoutRef.current);
        }
        highlightTimeoutRef.current = window.setTimeout(() => {
          setInternalHighlight(null);
        }, 1800);

        // Auto-open parent of created node
        const parts = target.split('/').filter(Boolean);
        parts.pop();
        if (parts.length > 0) {
          let cur = '';
          const ancestors: string[] = ['/'];
          for (const p of parts) {
            cur += '/' + p;
            ancestors.push(cur);
          }
          setOpenDirs((prev) => {
            const next = new Set(prev);
            ancestors.forEach((a) => next.add(a));
            return next;
          });
        }
      }
    });

    return () => {
      unsubscribe();
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, [fs]);

  const toggleDir = (path: string) => {
    setOpenDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const activeHighlight = externalHighlight ?? internalHighlight;

  return (
    <div className="file-tree-container">
      <div className="file-tree-header">
        <span className="file-tree-title">🗂️ Dosya Sistemi</span>
        {onResetFs && (
          <button className="btn btn-small btn-ghost" onClick={onResetFs} title="Sanal dosya sistemini sıfırla">
            ↺ Sıfırla
          </button>
        )}
      </div>
      <div className="file-tree-body">
        <TreeNode
          name="/"
          absPath="/"
          node={fs.root}
          fs={fs}
          cwd={cwd}
          level={0}
          openDirs={openDirs}
          toggleDir={toggleDir}
          onSelectPath={onSelectPath}
          highlightedPath={activeHighlight}
        />
      </div>
    </div>
  );
}
