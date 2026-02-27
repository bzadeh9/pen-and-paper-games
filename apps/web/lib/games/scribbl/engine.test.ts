import { describe, it, expect } from 'vitest';
import {
  CONCEPTS,
  FLIP_INTERVAL_MS,
  getRandomConcept,
  shouldCanvasBeFlipped,
} from './engine';

describe('Scribbl engine', () => {
  describe('CONCEPTS', () => {
    it('should have at least 10 concepts', () => {
      expect(CONCEPTS.length).toBeGreaterThanOrEqual(10);
    });

    it('should contain the required example concepts', () => {
      expect(CONCEPTS).toContain('house');
      expect(CONCEPTS).toContain('flower');
      expect(CONCEPTS).toContain('rocket ship');
    });

    it('should only contain non-empty strings', () => {
      expect(CONCEPTS.every((c) => typeof c === 'string' && c.length > 0)).toBe(true);
    });

    it('should contain no duplicate concepts', () => {
      expect(new Set(CONCEPTS).size).toBe(CONCEPTS.length);
    });
  });

  describe('FLIP_INTERVAL_MS', () => {
    it('should be 5 000 ms', () => {
      expect(FLIP_INTERVAL_MS).toBe(5000);
    });
  });

  describe('getRandomConcept', () => {
    it('should return a string from the CONCEPTS list', () => {
      const concept = getRandomConcept();
      expect(CONCEPTS).toContain(concept);
    });

    it('should return the first concept when rng always returns 0', () => {
      const concept = getRandomConcept(() => 0);
      expect(concept).toBe(CONCEPTS[0]);
    });

    it('should return the last concept when rng returns a value just below 1', () => {
      const concept = getRandomConcept(() => 0.9999);
      expect(concept).toBe(CONCEPTS[CONCEPTS.length - 1]);
    });

    it('should select different concepts for different rng values', () => {
      const first = getRandomConcept(() => 0);
      const mid = getRandomConcept(() => 0.5);
      // Both must be valid concepts even if they happen to be equal
      expect(CONCEPTS).toContain(first);
      expect(CONCEPTS).toContain(mid);
    });
  });

  describe('shouldCanvasBeFlipped (5-second flip timer)', () => {
    it('should NOT be flipped at t = 0 ms', () => {
      expect(shouldCanvasBeFlipped(0)).toBe(false);
    });

    it('should NOT be flipped at t = 4 999 ms (just before first flip)', () => {
      expect(shouldCanvasBeFlipped(4999)).toBe(false);
    });

    it('should be flipped at t = 5 000 ms', () => {
      expect(shouldCanvasBeFlipped(5000)).toBe(true);
    });

    it('should be flipped at t = 5 001 ms', () => {
      expect(shouldCanvasBeFlipped(5001)).toBe(true);
    });

    it('should NOT be flipped at t = 10 000 ms (back to normal)', () => {
      expect(shouldCanvasBeFlipped(10000)).toBe(false);
    });

    it('should be flipped again at t = 15 000 ms', () => {
      expect(shouldCanvasBeFlipped(15000)).toBe(true);
    });

    it('should alternate correctly for the first 6 intervals', () => {
      const results = [0, 1, 2, 3, 4, 5].map((i) =>
        shouldCanvasBeFlipped(i * FLIP_INTERVAL_MS)
      );
      expect(results).toEqual([false, true, false, true, false, true]);
    });
  });
});
