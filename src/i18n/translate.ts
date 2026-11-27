import { tr } from './dictionaries/tr';
import { en } from './dictionaries/en';
import type { Lang } from './types';

const DICTIONARIES = { tr, en };

function getNestedValue(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function translate(
  lang: Lang,
  key: string,
  params?: Record<string, string | number>,
): string {
  // 1. Try selected language
  let text = getNestedValue(DICTIONARIES[lang], key);

  // 2. Fallback to Turkish if selected language missing or empty
  if (text === undefined && lang !== 'tr') {
    text = getNestedValue(DICTIONARIES.tr, key);
  }

  // 3. Fallback to key itself
  if (text === undefined) {
    return key;
  }

  // 4. Interpolate {param}
  if (params) {
    return text.replace(/\{(\w+)\}/g, (_, match) => {
      return match in params ? String(params[match]) : `{${match}}`;
    });
  }

  return text;
}
