import { describe, expect, it } from 'vitest';
import { gameColors } from './game-icon';

/**
 * The nine unified palette colour names that must be available as
 * Tailwind utilities (defined in globals.css via CSS custom properties).
 */
const PALETTE_NAMES = [
  'powder-blush',
  'apricot-cream',
  'cream',
  'tea-green',
  'electric-aqua',
  'baby-blue-ice',
  'periwinkle',
  'mauve',
  'porcelain',
] as const;

describe('Theme palette', () => {
  it('every game colour references a palette colour', () => {
    for (const [gameId, { bg, text }] of Object.entries(gameColors)) {
      const bgMatch = PALETTE_NAMES.some((name) => bg.includes(name));
      const textMatch = PALETTE_NAMES.some((name) => text.includes(name));

      expect(bgMatch, `${gameId} bg class "${bg}" must use a palette colour`).toBe(true);
      expect(textMatch, `${gameId} text class "${text}" must use a palette colour`).toBe(true);
    }
  });

  it('uses at least 5 distinct palette colours across all games', () => {
    const usedColours = new Set<string>();
    for (const { text } of Object.values(gameColors)) {
      const match = PALETTE_NAMES.find((name) => text.includes(name));
      if (match) usedColours.add(match);
    }

    expect(usedColours.size).toBeGreaterThanOrEqual(5);
  });
});
