/**
 * Line-based diff utilities for the Virtual Git engine.
 *
 * Uses a classic LCS (longest common subsequence) table which is perfectly
 * adequate for the small, educational files found in the virtual filesystem.
 */

export type DiffOpType = 'equal' | 'add' | 'remove';

export interface DiffOp {
  type: DiffOpType;
  line: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  ops: DiffOp[];
}

/** Split file content into lines, ignoring a single trailing newline. */
export function splitLines(content: string): string[] {
  if (content === '') return [];
  const trimmed = content.endsWith('\n') ? content.slice(0, -1) : content;
  return trimmed.split('\n');
}

/** Compute a line-by-line edit script turning `oldText` into `newText`. */
export function diffLines(oldText: string, newText: string): DiffOp[] {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  const n = a.length;
  const m = b.length;

  // lcs[i][j] = LCS length of a[i..] and b[j..]
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: 'equal', line: a[i] });
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ type: 'remove', line: a[i++] });
    } else {
      ops.push({ type: 'add', line: b[j++] });
    }
  }
  while (i < n) ops.push({ type: 'remove', line: a[i++] });
  while (j < m) ops.push({ type: 'add', line: b[j++] });
  return ops;
}

/** Group an edit script into unified-diff hunks with `context` lines around changes. */
export function buildHunks(ops: DiffOp[], context = 3): DiffHunk[] {
  const changeIdx: number[] = [];
  ops.forEach((op, idx) => {
    if (op.type !== 'equal') changeIdx.push(idx);
  });
  if (changeIdx.length === 0) return [];

  // Merge change positions into [start, end) ranges including context.
  const ranges: Array<[number, number]> = [];
  for (const idx of changeIdx) {
    const start = Math.max(0, idx - context);
    const end = Math.min(ops.length, idx + context + 1);
    const last = ranges[ranges.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      ranges.push([start, end]);
    }
  }

  // Precompute old/new line numbers (1-based) at each op position.
  const oldPos: number[] = [];
  const newPos: number[] = [];
  let o = 1;
  let nn = 1;
  for (const op of ops) {
    oldPos.push(o);
    newPos.push(nn);
    if (op.type !== 'add') o++;
    if (op.type !== 'remove') nn++;
  }

  return ranges.map(([start, end]) => {
    const slice = ops.slice(start, end);
    const oldLines = slice.filter((op) => op.type !== 'add').length;
    const newLines = slice.filter((op) => op.type !== 'remove').length;
    return {
      oldStart: oldLines === 0 ? oldPos[start] - 1 : oldPos[start],
      oldLines,
      newStart: newLines === 0 ? newPos[start] - 1 : newPos[start],
      newLines,
      ops: slice,
    };
  });
}

/**
 * Build file content with conflict markers. Common leading/trailing lines are
 * kept outside the markers so that only the truly conflicting block is shown.
 */
export function buildConflictContent(
  ours: string,
  theirs: string,
  oursLabel: string,
  theirsLabel: string,
): string {
  const a = splitLines(ours);
  const b = splitLines(theirs);
  let pre = 0;
  while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
  let suf = 0;
  while (
    suf < a.length - pre &&
    suf < b.length - pre &&
    a[a.length - 1 - suf] === b[b.length - 1 - suf]
  ) {
    suf++;
  }
  const lines = [
    ...a.slice(0, pre),
    `<<<<<<< ${oursLabel}`,
    ...a.slice(pre, a.length - suf),
    '=======',
    ...b.slice(pre, b.length - suf),
    `>>>>>>> ${theirsLabel}`,
    ...a.slice(a.length - suf),
  ];
  return lines.join('\n') + '\n';
}
