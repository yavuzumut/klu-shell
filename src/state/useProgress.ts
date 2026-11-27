import { useCallback, useEffect, useMemo, useState } from 'react';

export const STORAGE_KEY = 'klu.progress.v1';
export const GIT_STORAGE_KEY = 'klu.git.progress.v1';
const EXPORT_FORMAT = 'klu.progress.export.v1';
const MAX_SAVED_HISTORY = 200;

export interface ProgressState {
  version: 1;
  currentLessonId: string;
  /** lessonId -> completed task ids */
  completed: Record<string, string[]>;
  /** "lessonId/taskId" -> wrong attempt count */
  attempts: Record<string, number>;
  /** "lessonId/taskId" -> solution revealed */
  revealed: Record<string, boolean>;
  /** Saved shell history (for ↑ across reloads) */
  history: string[];
}

export const taskKey = (lessonId: string, taskId: string) => `${lessonId}/${taskId}`;

export function initialProgress(firstLessonId: string): ProgressState {
  return { version: 1, currentLessonId: firstLessonId, completed: {}, attempts: {}, revealed: {}, history: [] };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function sanitizeProgress(data: unknown, firstLessonId: string): ProgressState {
  const fresh = initialProgress(firstLessonId);
  if (!isRecord(data) || data.version !== 1) return fresh;
  const completed: Record<string, string[]> = {};
  if (isRecord(data.completed)) {
    for (const [k, v] of Object.entries(data.completed)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      if (Array.isArray(v)) completed[k] = v.filter((id): id is string => typeof id === 'string');
    }
  }
  const attempts: Record<string, number> = {};
  if (isRecord(data.attempts)) {
    for (const [k, v] of Object.entries(data.attempts)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      if (typeof v === 'number' && Number.isFinite(v) && v >= 0) attempts[k] = Math.floor(v);
    }
  }
  const revealed: Record<string, boolean> = {};
  if (isRecord(data.revealed)) {
    for (const [k, v] of Object.entries(data.revealed)) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      if (typeof v === 'boolean') revealed[k] = v;
    }
  }
  return {
    version: 1,
    currentLessonId: typeof data.currentLessonId === 'string' ? data.currentLessonId : firstLessonId,
    completed,
    attempts,
    revealed,
    history: Array.isArray(data.history) ? data.history.filter((h): h is string => typeof h === 'string').slice(-MAX_SAVED_HISTORY) : [],
  };
}

export interface ProgressPayload {
  format: typeof EXPORT_FORMAT;
  linux: ProgressState;
  git: ProgressState;
}

/** Build a portable JSON backup without reading browser state. */
export function exportProgressPayload(linux: ProgressState, git: ProgressState): string {
  return JSON.stringify({ format: EXPORT_FORMAT, linux: sanitizeProgress(linux, linux.currentLessonId), git: sanitizeProgress(git, git.currentLessonId) }, null, 2);
}

/** Parse and deeply sanitize a portable backup; invalid envelopes return null. */
export function importProgressPayload(json: string): ProgressPayload | null {
  try {
    const payload: unknown = JSON.parse(json);
    if (!isRecord(payload) || payload.format !== EXPORT_FORMAT || !isRecord(payload.linux) || !isRecord(payload.git)) return null;
    if (payload.linux.version !== 1 || payload.git.version !== 1) return null;
    return {
      format: EXPORT_FORMAT,
      linux: sanitizeProgress(payload.linux, 'l0-intro'),
      git: sanitizeProgress(payload.git, 'git-1-init'),
    };
  } catch {
    return null;
  }
}

/** Load progress, falling back to a fresh state if storage is missing or corrupt. */
export function loadProgress(
  firstLessonId: string,
  storageOrKey?: Pick<Storage, 'getItem'> | string,
  maybeStorage?: Pick<Storage, 'getItem'>,
): ProgressState {
  let storageKey = STORAGE_KEY;
  let storage = globalThis.localStorage as Pick<Storage, 'getItem'> | undefined;

  if (typeof storageOrKey === 'string') {
    storageKey = storageOrKey;
    storage = maybeStorage ?? (globalThis.localStorage as Pick<Storage, 'getItem'> | undefined);
  } else if (storageOrKey) {
    storage = storageOrKey;
  }

  try {
    const raw = storage?.getItem(storageKey);
      if (!raw) return initialProgress(firstLessonId);
      return sanitizeProgress(JSON.parse(raw) as unknown, firstLessonId);
  } catch {
      return initialProgress(firstLessonId);
  }
}

export function useProgress(firstLessonId: string, storageKey: string = STORAGE_KEY) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress(firstLessonId, storageKey));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      /* storage full or disabled: progress is kept in memory only */
    }
  }, [progress, storageKey]);

  const setCurrentLesson = useCallback((lessonId: string) => {
    setProgress((p) => ({ ...p, currentLessonId: lessonId }));
  }, []);

  const completeTask = useCallback((lessonId: string, taskId: string) => {
    setProgress((p) => {
      const done = p.completed[lessonId] ?? [];
      if (done.includes(taskId)) return p;
      return { ...p, completed: { ...p.completed, [lessonId]: [...done, taskId] } };
    });
  }, []);

  const addAttempt = useCallback((lessonId: string, taskId: string) => {
    const key = taskKey(lessonId, taskId);
    setProgress((p) => ({ ...p, attempts: { ...p.attempts, [key]: (p.attempts[key] ?? 0) + 1 } }));
  }, []);

  const revealSolution = useCallback((lessonId: string, taskId: string) => {
    const key = taskKey(lessonId, taskId);
    setProgress((p) => ({ ...p, revealed: { ...p.revealed, [key]: true } }));
  }, []);

  /** Forget completion/attempts of one lesson (to practise it again). */
  const restartLesson = useCallback((lessonId: string) => {
    setProgress((p) => {
      const prefix = lessonId + '/';
      const strip = <T,>(obj: Record<string, T>) =>
        Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith(prefix)));
      const completed = { ...p.completed };
      delete completed[lessonId];
      return { ...p, completed, attempts: strip(p.attempts), revealed: strip(p.revealed) };
    });
  }, []);

  const setHistory = useCallback((history: string[]) => {
    setProgress((p) => ({ ...p, history: history.slice(-MAX_SAVED_HISTORY) }));
  }, []);

  const resetAll = useCallback(() => setProgress(initialProgress(firstLessonId)), [firstLessonId]);

  const actions = useMemo(
    () => ({ setCurrentLesson, completeTask, addAttempt, revealSolution, restartLesson, setHistory, resetAll }),
    [setCurrentLesson, completeTask, addAttempt, revealSolution, restartLesson, setHistory, resetAll],
  );

  return {
    progress,
    actions,
  };
}
