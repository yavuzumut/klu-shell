import { useCallback, useEffect, useMemo, useState } from 'react';
import { THEMES, type ThemeDefinition, type ThemeId } from './themes';
import {
  applyThemeToDocument,
  clearCustomAccent,
  getActiveTerminalTheme,
  getCustomAccent,
  getInitialThemeId,
  saveCustomAccent,
  saveThemeId,
} from './themeManager';
import type { ITheme } from '@xterm/xterm';

export interface UseThemeReturn {
  theme: ThemeDefinition;
  themeId: ThemeId;
  customAccent: string | null;
  selectTheme: (id: ThemeId) => void;
  setAccent: (color: string) => void;
  resetAccent: () => void;
  terminalTheme: ITheme;
}

export function useTheme(): UseThemeReturn {
  const [themeId, setThemeId] = useState<ThemeId>(() => getInitialThemeId());
  const [customAccent, setCustomAccentState] = useState<string | null>(() => {
    const initial = getInitialThemeId();
    return getCustomAccent(initial);
  });

  const theme = THEMES[themeId] ?? THEMES.dark;

  // Apply to DOM on state change
  useEffect(() => {
    applyThemeToDocument(theme, customAccent);
  }, [theme, customAccent]);

  const selectTheme = useCallback((newId: ThemeId) => {
    if (!(newId in THEMES)) return;
    setThemeId(newId);
    saveThemeId(newId);
    const savedAccent = getCustomAccent(newId);
    setCustomAccentState(savedAccent);
  }, []);

  const setAccent = useCallback(
    (color: string) => {
      setCustomAccentState(color);
      saveCustomAccent(themeId, color);
    },
    [themeId],
  );

  const resetAccent = useCallback(() => {
    setCustomAccentState(null);
    clearCustomAccent(themeId);
  }, [themeId]);

  const terminalTheme = useMemo(() => {
    return getActiveTerminalTheme(theme, customAccent);
  }, [theme, customAccent]);

  return {
    theme,
    themeId,
    customAccent,
    selectTheme,
    setAccent,
    resetAccent,
    terminalTheme,
  };
}
