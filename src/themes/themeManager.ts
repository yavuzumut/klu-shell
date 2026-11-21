import { THEMES, type ThemeDefinition, type ThemeId } from './themes';
import type { ITheme } from '@xterm/xterm';

export const THEME_STORAGE_KEY = 'termi_theme';
export const ACCENT_STORAGE_PREFIX = 'termi_accent_';

/**
 * Returns initial theme ID by checking localStorage, then prefers-color-scheme.
 * Safely falls back to 'dark' if invalid or not found.
 */
export function getInitialThemeId(storage?: Storage): ThemeId {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);

  if (store) {
    try {
      const saved = store.getItem(THEME_STORAGE_KEY);
      if (saved && saved in THEMES) {
        return saved as ThemeId;
      }
    } catch {
      // localStorage may fail in restricted iframes
    }
  }

  // Check prefers-color-scheme
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      if (prefersLight) return 'light';
    } catch {
      // fallback
    }
  }

  return 'dark';
}

/**
 * Saves selected theme ID to localStorage.
 */
export function saveThemeId(themeId: ThemeId, storage?: Storage): void {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  try {
    store.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // ignore
  }
}

/**
 * Retrieves custom accent color for a specific theme if set.
 */
export function getCustomAccent(themeId: ThemeId, storage?: Storage): string | null {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return null;
  try {
    return store.getItem(`${ACCENT_STORAGE_PREFIX}${themeId}`);
  } catch {
    return null;
  }
}

/**
 * Saves custom accent color for a specific theme.
 */
export function saveCustomAccent(themeId: ThemeId, color: string, storage?: Storage): void {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  try {
    store.setItem(`${ACCENT_STORAGE_PREFIX}${themeId}`, color);
  } catch {
    // ignore
  }
}

/**
 * Clears custom accent color for a specific theme (resets to theme default).
 */
export function clearCustomAccent(themeId: ThemeId, storage?: Storage): void {
  const store = storage ?? (typeof window !== 'undefined' ? window.localStorage : undefined);
  if (!store) return;
  try {
    store.removeItem(`${ACCENT_STORAGE_PREFIX}${themeId}`);
  } catch {
    // ignore
  }
}

/**
 * Computes contrast text color (dark or light) for a given hex color.
 */
export function getContrastColor(hexColor: string): string {
  const clean = hexColor.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) {
    return '#ffffff';
  }
  const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.slice(0, 2), 16);
  const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.slice(2, 4), 16);
  const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.slice(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#05080c' : '#ffffff';
}

/**
 * Converts hex to rgba string.
 */
export function hexToRgba(hexColor: string, alpha: number): string {
  const clean = hexColor.replace('#', '');
  if (clean.length !== 6 && clean.length !== 3) {
    return `rgba(126, 231, 135, ${alpha})`;
  }
  const r = parseInt(clean.length === 3 ? clean[0] + clean[0] : clean.slice(0, 2), 16);
  const g = parseInt(clean.length === 3 ? clean[1] + clean[1] : clean.slice(2, 4), 16);
  const b = parseInt(clean.length === 3 ? clean[2] + clean[2] : clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Applies theme CSS variables to document.documentElement.
 */
export function applyThemeToDocument(theme: ThemeDefinition, customAccent: string | null): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.dataset.theme = theme.id;
  root.style.colorScheme = theme.isDark ? 'dark' : 'light';

  // Apply default theme vars
  for (const [key, val] of Object.entries(theme.cssVars)) {
    root.style.setProperty(key, val);
  }

  // Override accent if custom
  if (customAccent) {
    root.style.setProperty('--accent', customAccent);
    root.style.setProperty('--accent-dim', hexToRgba(customAccent, theme.isDark ? 0.16 : 0.12));
    root.style.setProperty('--accent-contrast', getContrastColor(customAccent));
    root.style.setProperty('--tree-flash-start', hexToRgba(customAccent, 0.4));
    root.style.setProperty('--tree-flash-glow', hexToRgba(customAccent, 0.5));
  }
}

/**
 * Prepares active xterm.js theme, updating cursor with accent color.
 */
export function getActiveTerminalTheme(theme: ThemeDefinition, customAccent: string | null): ITheme {
  const base = { ...theme.terminalTheme };
  if (customAccent) {
    base.cursor = customAccent;
    base.green = customAccent;
    base.brightGreen = customAccent;
  }
  return base;
}
