import { describe, it, expect, beforeEach } from 'vitest';
import { NimEngine, DEFAULT_ROWS } from './engine';

describe('NimEngine', () => {
  let engine: NimEngine;

  beforeEach(() => {
    engine = new NimEngine();
  });

  describe('initialization', () => {
    it('should start with default rows [1, 3, 5, 7]', () => {
      const state = engine.getState();
      expect(state.rows).toEqual(DEFAULT_ROWS);
      expect(state.rowStates).toEqual([[true], [true, true, true], [true, true, true, true, true], [true, true, true, true, true, true, true]]);
    });

    it('should start with player 1', () => {
      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
    });

    it('should start in playing status', () => {
      const state = engine.getState();
      expect(state.status).toBe('playing');
    });

    it('should have no winner or loser initially', () => {
      const state = engine.getState();
      expect(state.winner).toBeNull();
      expect(state.loser).toBeNull();
    });

    it('should have correct total remaining (16 for default)', () => {
      const state = engine.getState();
      expect(state.totalRemaining).toBe(16);
    });

    it('should accept custom row configuration', () => {
      const custom = new NimEngine([2, 4, 6]);
      const state = custom.getState();
      expect(state.rows).toEqual([2, 4, 6]);
      expect(state.totalRemaining).toBe(12);
    });
  });

  describe('isValidMove', () => {
    it('should allow removing 1 item from a non-empty row', () => {
      expect(engine.isValidMove(1, 1)).toBe(true);
    });

    it('should allow removing all items from a row', () => {
      expect(engine.isValidMove(3, 7)).toBe(true);
    });

    it('should reject removing 0 items', () => {
      expect(engine.isValidMove(1, 0)).toBe(false);
    });

    it('should reject negative count', () => {
      expect(engine.isValidMove(1, -1)).toBe(false);
    });

    it('should reject non-integer count', () => {
      expect(engine.isValidMove(1, 1.5)).toBe(false);
    });

    it('should reject removing more items than available', () => {
      expect(engine.isValidMove(0, 2)).toBe(false); // row 0 has 1
    });

    it('should reject invalid row index (negative)', () => {
      expect(engine.isValidMove(-1, 1)).toBe(false);
    });

    it('should reject invalid row index (too large)', () => {
      expect(engine.isValidMove(4, 1)).toBe(false);
    });

    it('should reject move from empty row', () => {
      engine.makeMove(0, 1); // empties row 0
      expect(engine.isValidMove(0, 1)).toBe(false);
    });

    it('should validate selected contiguous segment start index', () => {
      const game = new NimEngine([5]);
      expect(game.isValidMove(0, 2, 2)).toBe(true);
      expect(game.isValidMove(0, 2, 4)).toBe(false);
    });
  });

  describe('makeMove', () => {
    it('should remove items from the specified row', () => {
      engine.makeMove(1, 2);
      const state = engine.getState();
      expect(state.rows[1]).toBe(1); // was 3, removed 2
    });

    it('should update total remaining', () => {
      engine.makeMove(1, 2);
      const state = engine.getState();
      expect(state.totalRemaining).toBe(14); // 16 - 2
    });

    it('should switch to player 2 after player 1 moves', () => {
      engine.makeMove(1, 1);
      const state = engine.getState();
      expect(state.currentPlayer).toBe(2);
    });

    it('should alternate players', () => {
      engine.makeMove(1, 1); // P1
      engine.makeMove(2, 1); // P2
      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
    });

    it('should return true for valid moves', () => {
      expect(engine.makeMove(1, 1)).toBe(true);
    });

    it('should return false for invalid moves', () => {
      expect(engine.makeMove(0, 2)).toBe(false);
    });

    it('should cross out only the chosen contiguous segment', () => {
      const game = new NimEngine([5]);
      game.makeMove(0, 2, 1); // crosses out indexes 1 and 2
      const state = game.getState();
      expect(state.rows[0]).toBe(3);
      expect(state.rowStates[0]).toEqual([true, false, false, true, true]);
    });
  });

  describe('win/loss detection', () => {
    it('should detect loss when player takes the last item', () => {
      // Use a simple 2-row game: [1, 2]
      const small = new NimEngine([1, 2]);
      small.makeMove(0, 1); // P1 takes 1 from row 0 → [0, 2]
      small.makeMove(1, 2); // P2 takes 2 from row 1 → [0, 0] → P2 loses

      const state = small.getState();
      expect(state.status).toBe('ended');
      expect(state.loser).toBe(2);
      expect(state.winner).toBe(1);
    });

    it('should detect player 1 losing', () => {
      // [1] single-row game
      const single = new NimEngine([1]);
      single.makeMove(0, 1); // P1 forced to take the only item → P1 loses

      const state = single.getState();
      expect(state.status).toBe('ended');
      expect(state.loser).toBe(1);
      expect(state.winner).toBe(2);
    });

    it('should not end game when items remain', () => {
      engine.makeMove(3, 6); // take 6 from row 3 (was 7) → 1 remaining in row 3
      const state = engine.getState();
      expect(state.status).toBe('playing');
      expect(state.totalRemaining).toBe(10);
    });

    it('should not allow moves after game ends', () => {
      const small = new NimEngine([1]);
      small.makeMove(0, 1); // P1 loses
      expect(small.makeMove(0, 1)).toBe(false);
    });

    it('should handle taking last item from row 0 in multi-row game', () => {
      // [1, 1]: P1 takes from row 0, P2 takes from row 1 → P2 loses
      const game = new NimEngine([1, 1]);
      game.makeMove(0, 1); // P1
      game.makeMove(1, 1); // P2 takes last → P2 loses

      const state = game.getState();
      expect(state.loser).toBe(2);
      expect(state.winner).toBe(1);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      engine.makeMove(1, 2);
      engine.makeMove(2, 3);
      engine.reset();

      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
      expect(state.rows).toEqual(DEFAULT_ROWS);
      expect(state.status).toBe('playing');
      expect(state.winner).toBeNull();
      expect(state.loser).toBeNull();
      expect(state.totalRemaining).toBe(16);
    });

    it('should allow playing after reset', () => {
      const small = new NimEngine([1]);
      small.makeMove(0, 1); // game ends

      small.reset();
      const result = small.makeMove(0, 1);
      expect(result).toBe(true);
    });
  });

  describe('state immutability', () => {
    it('should return a copy of rows', () => {
      const state1 = engine.getState();
      const state2 = engine.getState();
      expect(state1.rows).not.toBe(state2.rows);
      expect(state1.rows).toEqual(state2.rows);
    });

    it('should not allow external mutation of rows', () => {
      const state = engine.getState();
      state.rows[0] = 99;

      const freshState = engine.getState();
      expect(freshState.rows[0]).toBe(1);
    });
  });
});
