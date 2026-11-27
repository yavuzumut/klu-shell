import type { Lang } from './types';
import { DEFAULT_LANG, SUPPORTED_LANGS } from './types';
import { translate } from './translate';

export const LANG_STORAGE_KEY = 'klu_lang';

export function isValidLang(value: unknown): value is Lang {
  return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

export function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isValidLang(saved)) {
      return saved;
    }
  } catch {
    // LocalStorage might be disabled or throw in restricted iframes
  }
  return DEFAULT_LANG;
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors
  }
}

export function applyDocumentLanguage(lang: Lang): void {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = lang;

  const title = translate(lang, 'meta.title');
  if (title) {
    document.title = title;
  }

  const description = translate(lang, 'meta.description');
  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description);
    }
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute('content', description);
    }
  }

  if (title) {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }
  }
}
