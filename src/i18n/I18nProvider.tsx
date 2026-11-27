import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Lang } from './types';
import { loadLang, saveLang, applyDocumentLanguage } from './storage';
import { translate } from './translate';

export interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadLang());

  useEffect(() => {
    applyDocumentLanguage(lang);
  }, [lang]);

  const setLang = useCallback((nextLang: Lang) => {
    setLangState(nextLang);
    saveLang(nextLang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translate(lang, key, params);
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return ctx;
}
