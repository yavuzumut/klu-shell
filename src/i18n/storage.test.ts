import { describe, it, expect, beforeEach } from 'vitest';
import { loadLang, saveLang, isValidLang, applyDocumentLanguage, LANG_STORAGE_KEY } from './storage';

describe('i18n storage and document synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = 'tr';
  });

  it('validates supported languages', () => {
    expect(isValidLang('tr')).toBe(true);
    expect(isValidLang('en')).toBe(true);
    expect(isValidLang('de')).toBe(false);
    expect(isValidLang(null)).toBe(false);
    expect(isValidLang(123)).toBe(false);
  });

  it('defaults to tr when nothing or invalid in localStorage', () => {
    expect(loadLang()).toBe('tr');
    localStorage.setItem(LANG_STORAGE_KEY, 'invalid-lang');
    expect(loadLang()).toBe('tr');
  });

  it('saves and loads language from localStorage', () => {
    saveLang('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(loadLang()).toBe('en');

    saveLang('tr');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('tr');
    expect(loadLang()).toBe('tr');
  });

  it('updates document.documentElement.lang, document.title and meta description', () => {
    // Setup head meta tags
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }

    applyDocumentLanguage('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toContain('KLU');
    expect(descMeta.getAttribute('content')).toContain('browser');

    applyDocumentLanguage('tr');
    expect(document.documentElement.lang).toBe('tr');
    expect(descMeta.getAttribute('content')).toContain('tarayıcı');
  });
});
