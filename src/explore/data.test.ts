import { describe, expect, it } from 'vitest';
import { EXPLORE_TOOLS, type ExploreCategory } from './data';

const VALID_CATEGORIES: ExploreCategory[] = ['media', 'system', 'files', 'productivity', 'fun'];

describe('Explore Data (EXPLORE_TOOLS)', () => {
  it('kart sayısı en az 15 olmalı', () => {
    expect(EXPLORE_TOOLS.length).toBeGreaterThanOrEqual(15);
  });

  it('tüm kartların id değerleri benzersiz olmalı', () => {
    const ids = EXPLORE_TOOLS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('her kartta id, name, description ve exampleCommand dolu olmalı', () => {
    for (const tool of EXPLORE_TOOLS) {
      expect(tool.id, `ID missing for tool`).toBeTruthy();
      expect(typeof tool.id).toBe('string');
      expect(tool.id.trim().length).toBeGreaterThan(0);

      expect(tool.name, `name missing for ${tool.id}`).toBeTruthy();
      expect(typeof tool.name).toBe('string');
      expect(tool.name.trim().length).toBeGreaterThan(0);

      expect(tool.description, `description missing for ${tool.id}`).toBeTruthy();
      expect(typeof tool.description).toBe('string');
      expect(tool.description.trim().length).toBeGreaterThan(0);

      expect(tool.exampleCommand, `exampleCommand missing for ${tool.id}`).toBeTruthy();
      expect(typeof tool.exampleCommand).toBe('string');
      expect(tool.exampleCommand.trim().length).toBeGreaterThan(0);
    }
  });

  it('her kartın category değeri geçerli kategorilerden biri olmalı', () => {
    for (const tool of EXPLORE_TOOLS) {
      expect(
        VALID_CATEGORIES.includes(tool.category),
        `Invalid category "${tool.category}" for ${tool.id}`
      ).toBe(true);
    }
  });

  it('tips alanı tanımlıysa dizi olmalı ve elemanları boş olmayan metin olmalı', () => {
    for (const tool of EXPLORE_TOOLS) {
      if (tool.tips !== undefined) {
        expect(Array.isArray(tool.tips), `tips must be an array for ${tool.id}`).toBe(true);
        expect(tool.tips.length, `tips array cannot be empty if defined for ${tool.id}`).toBeGreaterThan(0);
        for (const tip of tool.tips) {
          expect(typeof tip, `tip must be string for ${tool.id}`).toBe('string');
          expect(tip.trim().length, `tip cannot be empty string for ${tool.id}`).toBeGreaterThan(0);
        }
      }
    }
  });
});
