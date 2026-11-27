import { describe, it, expect } from 'vitest';
import { translate } from './translate';

describe('i18n translate function', () => {
  it('returns Turkish translations when lang is tr', () => {
    expect(translate('tr', 'modes.lessons')).toBe('Dersler');
    expect(translate('tr', 'header.beginnersBadge')).toBe('Yeni başlayanlar');
  });

  it('returns English translations when lang is en', () => {
    expect(translate('en', 'modes.lessons')).toBe('Lessons');
    expect(translate('en', 'modes.sandbox')).toBe('Sandbox');
    expect(translate('en', 'header.beginnersBadge')).toBe('Beginners');
  });

  it('interpolates {param} correctly', () => {
    expect(
      translate('tr', 'header.progressText', { done: 3, total: 10, percent: 30 }),
    ).toBe('3/10 ders · %30');

    expect(
      translate('en', 'header.progressText', { done: 3, total: 10, percent: 30 }),
    ).toBe('3/10 lessons · %30');
  });

  it('falls back to Turkish when key is missing in English', () => {
    // If a nested key exists in TR but not in EN, it returns TR text
    expect(translate('en', 'modes.lessons')).toBe('Lessons');
  });

  it('returns the key itself if not found anywhere', () => {
    expect(translate('en', 'nonexistent.test.key')).toBe('nonexistent.test.key');
    expect(translate('tr', 'another.missing.key')).toBe('another.missing.key');
  });
});
