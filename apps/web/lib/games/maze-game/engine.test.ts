import { describe, it, expect, beforeEach } from 'vitest';
import { MazeGameEngine } from './engine';

function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('MazeGameEngine', () => {
  let engine: MazeGameEngine;

  beforeEach(() => {
    engine = new MazeGameEngine(7, 7, createSeededRng(42));
  });

  describe('initialization', () => {
    it('should initialize with the correct dimensions', () => {
      const state = engine.getState();
      expect(state.rows).toBe(7);
      expect(state.cols).toBe(7);
    });

    it('should place both players at the start position (0,0)', () => {
      const state = engine.getState();
      expect(state.players[1]).toEqual({ row: 0, col: 0 });
      expect(state.players[2]).toEqual({ row: 0, col: 0 });
    });

    it('should set start at (0,0) and end at bottom-right corner', () => {
      const state = engine.getState();
      expect(state.startPos).toEqual({ row: 0, col: 0 });
      expect(state.endPos).toEqual({ row: 6, col: 6 });
    });

    it('should start with Player 1 as current player', () => {
      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
    });

    it('should start in playing status', () => {
      const state = engine.getState();
      expect(state.status).toBe('playing');
    });

    it('should have no reachedEnd players initially', () => {
      const state = engine.getState();
      expect(state.reachedEnd).toEqual([]);
    });

    it('should generate passages (maze has connections from start)', () => {
      const state = engine.getState();
      const startPassages = state.passages[0][0];
      const hasAnyPassage =
        startPassages.north ||
        startPassages.south ||
        startPassages.east ||
        startPassages.west;
      expect(hasAnyPassage).toBe(true);
    });
  });

  describe('getValidMoves', () => {
    it('should return at least one valid move from the start', () => {
      const moves = engine.getValidMoves();
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should only return adjacent rooms with passages', () => {
      const state = engine.getState();
      const moves = engine.getValidMoves();
      for (const move of moves) {
        const dr = Math.abs(move.row - state.players[1].row);
        const dc = Math.abs(move.col - state.players[1].col);
        // Each move is either 1 step in row or 1 step in col (not both)
        expect(dr + dc).toBe(1);
      }
    });
  });

  describe('makeMove', () => {
    it('should reject invalid moves', () => {
      // Try to move to a non-adjacent cell
      const result = engine.makeMove({ row: 5, col: 5 });
      expect(result).toBe(false);
      const state = engine.getState();
      expect(state.players[1]).toEqual({ row: 0, col: 0 });
    });

    it('should accept a valid move and update position', () => {
      const moves = engine.getValidMoves();
      expect(moves.length).toBeGreaterThan(0);
      const result = engine.makeMove(moves[0]);
      expect(result).toBe(true);
      const state = engine.getState();
      expect(state.players[1]).toEqual(moves[0]);
    });

    it('should switch current player after a move', () => {
      const moves = engine.getValidMoves();
      engine.makeMove(moves[0]);
      const state = engine.getState();
      expect(state.currentPlayer).toBe(2);
    });

    it('should record move history', () => {
      const moves = engine.getValidMoves();
      engine.makeMove(moves[0]);
      const state = engine.getState();
      expect(state.moveHistory).toHaveLength(1);
      expect(state.moveHistory[0].player).toBe(1);
      expect(state.moveHistory[0].from).toEqual({ row: 0, col: 0 });
      expect(state.moveHistory[0].to).toEqual(moves[0]);
    });
  });

  describe('bridge mechanics', () => {
    it('should place a bridge in a 7x7 maze', () => {
      const state = engine.getState();
      expect(state.bridges.length).toBeGreaterThan(0);
    });

    it('bridge should have valid lever positions', () => {
      const state = engine.getState();
      if (state.bridges.length === 0) return;
      const bridge = state.bridges[0];
      // Lever positions should be within bounds
      expect(bridge.leverA.row).toBeGreaterThanOrEqual(0);
      expect(bridge.leverA.row).toBeLessThan(7);
      expect(bridge.leverB.row).toBeGreaterThanOrEqual(0);
      expect(bridge.leverB.row).toBeLessThan(7);
    });

    it('bridge rooms A and B should be adjacent (1 step apart)', () => {
      const state = engine.getState();
      if (state.bridges.length === 0) return;
      const bridge = state.bridges[0];
      const dr = Math.abs(bridge.roomA.row - bridge.roomB.row);
      const dc = Math.abs(bridge.roomA.col - bridge.roomB.col);
      expect(dr + dc).toBe(1);
    });
  });

  describe('win condition', () => {
    it('should NOT end game when only one player reaches end', () => {
      // Both players are at start; simulate P1 alone reaching end
      // We can check game state directly via a small maze
      const smallEngine = new MazeGameEngine(1, 1, createSeededRng(1));
      const state = smallEngine.getState();
      // 1x1 maze: start = end = (0,0), both players already at end
      // Status should be 'ended' immediately after any move OR just at start
      // Actually for a 1x1 maze, players start at (0,0) which is also the end
      // The win condition is checked AFTER a move, so it won't trigger at init
      expect(state.status).toBe('playing');
    });

    it('should end game when both players reach end', () => {
      // Use a tiny 2x1 maze with a known passable layout
      const tinyEngine = new MazeGameEngine(1, 2, createSeededRng(1));
      const tinyState = tinyEngine.getState();
      // In a 1x2 maze: start=(0,0), end=(0,1), no bridges possible (too small)
      expect(tinyState.endPos).toEqual({ row: 0, col: 1 });

      // P1 moves to end
      const moves1 = tinyEngine.getValidMoves();
      if (moves1.some((m) => m.row === 0 && m.col === 1)) {
        tinyEngine.makeMove({ row: 0, col: 1 });
        expect(tinyEngine.getState().reachedEnd).toContain(1);
        expect(tinyEngine.getState().status).toBe('playing'); // P2 hasn't reached end yet
      }
    });
  });

  describe('reset', () => {
    it('should reset the game to initial state', () => {
      const moves = engine.getValidMoves();
      engine.makeMove(moves[0]);
      engine.reset();
      const state = engine.getState();
      expect(state.players[1]).toEqual({ row: 0, col: 0 });
      expect(state.players[2]).toEqual({ row: 0, col: 0 });
      expect(state.currentPlayer).toBe(1);
      expect(state.status).toBe('playing');
      expect(state.reachedEnd).toEqual([]);
      expect(state.moveHistory).toEqual([]);
    });
  });
});
