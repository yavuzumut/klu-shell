import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearCustomAccent,
  getContrastColor,
  getCustomAccent,
  getInitialThemeId,
  saveCustomAccent,
  saveThemeId,
  THEME_STORAGE_KEY,
  getActiveTerminalTheme,
} from './themeManager';
import { THEMES } from './themes';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();

  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  key(index: number): string | null {
    return Array.from(this.map.keys())[index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe('Theme Manager', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    mockStorage = new MemoryStorage();
  });

  describe('getInitialThemeId', () => {
    it('returns saved theme if valid in localStorage', () => {
      mockStorage.setItem(THEME_STORAGE_KEY, 'dracula');
      expect(getInitialThemeId(mockStorage)).toBe('dracula');

      mockStorage.setItem(THEME_STORAGE_KEY, 'solarized');
      expect(getInitialThemeId(mockStorage)).toBe('solarized');

      mockStorage.setItem(THEME_STORAGE_KEY, 'retro');
      expect(getInitialThemeId(mockStorage)).toBe('retro');

      mockStorage.setItem(THEME_STORAGE_KEY, 'light');
      expect(getInitialThemeId(mockStorage)).toBe('light');
    });

    it('falls back to default (dark) when stored value is invalid', () => {
      mockStorage.setItem(THEME_STORAGE_KEY, 'non_existent_theme');
      expect(getInitialThemeId(mockStorage)).toBe('dark');

      mockStorage.setItem(THEME_STORAGE_KEY, 'null');
      expect(getInitialThemeId(mockStorage)).toBe('dark');
    });

    it('falls back to dark when storage is empty and no matchMedia matches', () => {
      expect(getInitialThemeId(mockStorage)).toBe('dark');
    });
  });

  describe('saveThemeId', () => {
    it('correctly persists theme to storage', () => {
      saveThemeId('dracula', mockStorage);
      expect(mockStorage.getItem(THEME_STORAGE_KEY)).toBe('dracula');
    });
  });

  describe('custom accent colors', () => {
    it('saves, retrieves, and clears custom accent color', () => {
      expect(getCustomAccent('dark', mockStorage)).toBeNull();

      saveCustomAccent('dark', '#ff0077', mockStorage);
      expect(getCustomAccent('dark', mockStorage)).toBe('#ff0077');

      clearCustomAccent('dark', mockStorage);
      expect(getCustomAccent('dark', mockStorage)).toBeNull();
    });
  });

  describe('getContrastColor', () => {
    it('returns dark text for high-luminance colors and white text for dark colors', () => {
      expect(getContrastColor('#ffffff')).toBe('#05080c');
      expect(getContrastColor('#7ee787')).toBe('#05080c');
      expect(getContrastColor('#33ff33')).toBe('#05080c');

      expect(getContrastColor('#000000')).toBe('#ffffff');
      expect(getContrastColor('#0969da')).toBe('#ffffff');
      expect(getContrastColor('#1a1a1a')).toBe('#ffffff');
    });
  });

  describe('getActiveTerminalTheme', () => {
    it('returns default terminal theme when customAccent is null', () => {
      const active = getActiveTerminalTheme(THEMES.dark, null);
      expect(active.cursor).toBe(THEMES.dark.terminalTheme.cursor);
    });

    it('overrides cursor and green with custom accent when provided', () => {
      const active = getActiveTerminalTheme(THEMES.dark, '#ff5599');
      expect(active.cursor).toBe('#ff5599');
      expect(active.green).toBe('#ff5599');
    });
  });
});
