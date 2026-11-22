import { useCallback, useEffect, useState } from 'react';

export const STORAGE_KEY = 'klu.progress.v1';
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

/** Load progress, falling back to a fresh state if storage is missing or corrupt. */
export function loadProgress(firstLessonId: string, storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): ProgressState {
  const fresh = initialProgress(firstLessonId);
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const data = JSON.parse(raw) as unknown;
    if (!isRecord(data) || data.version !== 1) return fresh;
    return {
      version: 1,
      currentLessonId: typeof data.currentLessonId === 'string' ? data.currentLessonId : firstLessonId,
      completed: isRecord(data.completed) ? (data.completed as ProgressState['completed']) : {},
      attempts: isRecord(data.attempts) ? (data.attempts as ProgressState['attempts']) : {},
      revealed: isRecord(data.revealed) ? (data.revealed as ProgressState['revealed']) : {},
      history: Array.isArray(data.history) ? data.history.filter((h): h is string => typeof h === 'string') : [],
    };
  } catch {
    return fresh;
  }
}

export function useProgress(firstLessonId: string) {
  const [progress, setProgress] = useState<ProgressState>(() => loadProgress(firstLessonId));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage full or disabled: progress is kept in memory only */
    }
  }, [progress]);

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

  return {
    progress,
    actions: { setCurrentLesson, completeTask, addAttempt, revealSolution, restartLesson, setHistory, resetAll },
  };
}
