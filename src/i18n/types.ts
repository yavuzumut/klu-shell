export type Lang = 'tr' | 'en';

export const SUPPORTED_LANGS: readonly Lang[] = ['tr', 'en'] as const;
export const DEFAULT_LANG: Lang = 'tr';

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends object
      ? DeepPartial<T[P]>
      : T[P];
};

export interface TaskTranslation {
  description?: string;
  hints?: string[];
  solution?: string;
}

export interface LessonTranslation {
  title?: string;
  summary?: string;
  content?: string;
  examples?: string[];
  tasks?: Record<string, TaskTranslation>;
}

export interface LevelTranslation {
  title?: string;
  description?: string;
}

export interface CommandDocTranslation {
  summary?: string;
  usage?: string;
  manPage?: string;
}
