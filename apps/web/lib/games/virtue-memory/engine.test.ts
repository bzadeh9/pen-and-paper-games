import { describe, it, expect, beforeEach } from 'vitest';
import { VirtueMemoryEngine } from './engine';
import { VIRTUES } from './types';

describe('VirtueMemoryEngine', () => {
  let engine: VirtueMemoryEngine;

  beforeEach(() => {
    engine = new VirtueMemoryEngine();
  });

  describe('initialization', () => {
    it('should start in playing status', () => {
      expect(engine.getState().status).toBe('playing');
    });

    it('should start with player 1', () => {
      expect(engine.getState().currentPlayer).toBe(1);
    });

    it('should create 16 cards (8 pairs)', () => {
      expect(engine.getState().cards).toHaveLength(16);
    });

    it('should have exactly 2 cards per virtue', () => {
      const counts: Record<string, number> = {};
      for (const card of engine.getState().cards) {
        counts[card.virtue] = (counts[card.virtue] ?? 0) + 1;
      }
      for (const virtue of VIRTUES) {
        expect(counts[virtue]).toBe(2);
      }
    });

    it('should start with all cards face down', () => {
      const state = engine.getState();
      expect(state.cards.every((c) => !c.isFlipped)).toBe(true);
    });

    it('should start with no matched cards', () => {
      const state = engine.getState();
      expect(state.cards.every((c) => !c.isMatched)).toBe(true);
    });

    it('should start with zero scores', () => {
      const state = engine.getState();
      expect(state.scores[1]).toBe(0);
      expect(state.scores[2]).toBe(0);
    });

    it('should start with no pending flips', () => {
      const state = engine.getState();
      expect(state.firstFlippedIndex).toBeNull();
      expect(state.isChecking).toBe(false);
    });
  });

  describe('flipCard', () => {
    it('should flip the first card successfully', () => {
      const result = engine.flipCard(0);
      expect(result).toBe(true);
      expect(engine.getState().cards[0].isFlipped).toBe(true);
    });

    it('should store firstFlippedIndex after first flip', () => {
      engine.flipCard(0);
      expect(engine.getState().firstFlippedIndex).toBe(0);
    });

    it('should reject flipping an already-flipped card', () => {
      engine.flipCard(0);
      const result = engine.flipCard(0);
      expect(result).toBe(false);
    });

    it('should reject flipping when isChecking is true', () => {
      // Find two cards with different virtues
      const cards = engine.getState().cards;
      const firstIdx = 0;
      const diffIdx = cards.findIndex((c, i) => i !== firstIdx && c.virtue !== cards[firstIdx].virtue);
      engine.flipCard(firstIdx);
      engine.flipCard(diffIdx);
      expect(engine.getState().isChecking).toBe(true);
      // Third flip should be rejected
      const unusedIdx = cards.findIndex((c, i) => !c.isFlipped && i !== firstIdx && i !== diffIdx);
      expect(engine.flipCard(unusedIdx)).toBe(false);
    });

    it('should reject out-of-range index', () => {
      expect(engine.flipCard(-1)).toBe(false);
      expect(engine.flipCard(16)).toBe(false);
    });
  });

  describe('matching', () => {
    /** Helper: find indices of two cards sharing the same virtue. */
    function findMatchingPair(eng: VirtueMemoryEngine): [number, number] {
      const cards = eng.getState().cards;
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          if (cards[i].virtue === cards[j].virtue) return [i, j];
        }
      }
      throw new Error('No matching pair found');
    }

    it('should mark both cards as matched when virtues match', () => {
      const [i, j] = findMatchingPair(engine);
      engine.flipCard(i);
      engine.flipCard(j);
      const state = engine.getState();
      expect(state.cards[i].isMatched).toBe(true);
      expect(state.cards[j].isMatched).toBe(true);
    });

    it('should award a point to the current player on a match', () => {
      const [i, j] = findMatchingPair(engine);
      engine.flipCard(i);
      engine.flipCard(j);
      expect(engine.getState().scores[1]).toBe(1);
    });

    it('should not change the current player after a match', () => {
      const [i, j] = findMatchingPair(engine);
      engine.flipCard(i);
      engine.flipCard(j);
      expect(engine.getState().currentPlayer).toBe(1);
    });

    it('should not enter isChecking state on a match', () => {
      const [i, j] = findMatchingPair(engine);
      engine.flipCard(i);
      engine.flipCard(j);
      expect(engine.getState().isChecking).toBe(false);
    });

    it('should increment totalTurns after a match', () => {
      const [i, j] = findMatchingPair(engine);
      engine.flipCard(i);
      engine.flipCard(j);
      expect(engine.getState().totalTurns).toBe(1);
    });
  });

  describe('non-match', () => {
    /** Helper: find indices of two cards with different virtues. */
    function findNonMatchingPair(eng: VirtueMemoryEngine): [number, number] {
      const cards = eng.getState().cards;
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          if (cards[i].virtue !== cards[j].virtue) return [i, j];
        }
      }
      throw new Error('No non-matching pair found');
    }

    it('should enter isChecking state on mismatch', () => {
      const [i, j] = findNonMatchingPair(engine);
      engine.flipCard(i);
      engine.flipCard(j);
      expect(engine.getState().isChecking).toBe(true);
    });

    it('should not mark cards as matched on mismatch', () => {
      const [i, j] = findNonMatchingPair(engine);
      engine.flipCard(i);
      engine.flipCard(j);
      const state = engine.getState();
      expect(state.cards[i].isMatched).toBe(false);
      expect(state.cards[j].isMatched).toBe(false);
    });
  });

  describe('closeCards', () => {
    function flipNonMatching(eng: VirtueMemoryEngine): [number, number] {
      const cards = eng.getState().cards;
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          if (cards[i].virtue !== cards[j].virtue) {
            eng.flipCard(i);
            eng.flipCard(j);
            return [i, j];
          }
        }
      }
      throw new Error('No non-matching pair found');
    }

    it('should flip both cards back down', () => {
      const [i, j] = flipNonMatching(engine);
      engine.closeCards();
      const state = engine.getState();
      expect(state.cards[i].isFlipped).toBe(false);
      expect(state.cards[j].isFlipped).toBe(false);
    });

    it('should clear isChecking after closeCards', () => {
      flipNonMatching(engine);
      engine.closeCards();
      expect(engine.getState().isChecking).toBe(false);
    });

    it('should advance to player 2 after closeCards', () => {
      flipNonMatching(engine);
      engine.closeCards();
      expect(engine.getState().currentPlayer).toBe(2);
    });

    it('should increment totalTurns after closeCards', () => {
      flipNonMatching(engine);
      engine.closeCards();
      expect(engine.getState().totalTurns).toBe(1);
    });

    it('should not score a point on mismatch', () => {
      flipNonMatching(engine);
      engine.closeCards();
      const state = engine.getState();
      expect(state.scores[1]).toBe(0);
      expect(state.scores[2]).toBe(0);
    });

    it('should do nothing if not in checking state', () => {
      const stateBefore = engine.getState();
      engine.closeCards();
      expect(engine.getState().currentPlayer).toBe(stateBefore.currentPlayer);
    });
  });

  describe('game end', () => {
    /**
     * Automatically plays until all pairs are matched.
     * Returns the final state.
     */
    function playToEnd(eng: VirtueMemoryEngine) {
      const cards = eng.getState().cards;
      // Build a list of matching index pairs
      const pairs: [number, number][] = [];
      const used = new Set<number>();
      for (let i = 0; i < cards.length; i++) {
        if (used.has(i)) continue;
        for (let j = i + 1; j < cards.length; j++) {
          if (!used.has(j) && cards[i].virtue === cards[j].virtue) {
            pairs.push([i, j]);
            used.add(i);
            used.add(j);
            break;
          }
        }
      }
      for (const [i, j] of pairs) {
        eng.flipCard(i);
        eng.flipCard(j);
        // Matches don't need closeCards
      }
    }

    it('should end the game when all pairs are matched', () => {
      playToEnd(engine);
      expect(engine.getState().status).toBe('ended');
    });

    it('should declare a winner when scores differ', () => {
      // Force player 1 to win by matching all pairs as player 1
      playToEnd(engine);
      const state = engine.getState();
      // All 8 pairs matched by player 1 → winner is 1
      expect(state.winner).toBe(1);
    });

    it('should not allow further flips after game ends', () => {
      playToEnd(engine);
      const state = engine.getState();
      // All cards are matched, so flipCard should return false
      const result = engine.flipCard(0);
      expect(result).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset the game to the initial state', () => {
      engine.flipCard(0);
      engine.reset();
      const state = engine.getState();
      expect(state.status).toBe('playing');
      expect(state.currentPlayer).toBe(1);
      expect(state.scores[1]).toBe(0);
      expect(state.scores[2]).toBe(0);
      expect(state.firstFlippedIndex).toBeNull();
      expect(state.isChecking).toBe(false);
      expect(state.cards.every((c) => !c.isFlipped && !c.isMatched)).toBe(true);
    });

    it('should reshuffle the deck on reset', () => {
      const before = engine.getState().cards.map((c) => c.virtue);
      // Reset multiple times and check that at least one order differs
      let differentFound = false;
      for (let attempt = 0; attempt < 10; attempt++) {
        engine.reset();
        const after = engine.getState().cards.map((c) => c.virtue);
        if (before.join(',') !== after.join(',')) {
          differentFound = true;
          break;
        }
      }
      // With 16! shuffles it's astronomically unlikely to stay the same 10 times
      expect(differentFound).toBe(true);
    });
  });

  describe('getState returns defensive copy', () => {
    it('should not allow mutation of cards through getState', () => {
      engine.flipCard(0);
      const state = engine.getState();
      state.cards[0].isFlipped = false;
      expect(engine.getState().cards[0].isFlipped).toBe(true);
    });

    it('should not allow mutation of scores through getState', () => {
      const state = engine.getState();
      state.scores[1] = 99;
      expect(engine.getState().scores[1]).toBe(0);
    });
  });
});
