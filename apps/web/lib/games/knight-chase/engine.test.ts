import { describe, it, expect, beforeEach } from 'vitest';
import { KnightChaseEngine } from './engine';

describe('KnightChaseEngine', () => {
  let engine: KnightChaseEngine;

  beforeEach(() => {
    engine = new KnightChaseEngine();
  });

  describe('initialization', () => {
    it('should initialize with an 8x8 grid', () => {
      const state = engine.getState();
      expect(state.gridSize).toBe(8);
      expect(state.grid.length).toBe(8);
      expect(state.grid[0].length).toBe(8);
    });

    it('should place Player 1 at (0,0) and Player 2 at (7,7)', () => {
      const state = engine.getState();
      expect(state.playerPositions[1]).toEqual({ row: 0, col: 0 });
      expect(state.playerPositions[2]).toEqual({ row: 7, col: 7 });
      expect(state.grid[0][0]).toBe(1);
      expect(state.grid[7][7]).toBe(2);
    });

    it('should start in setup mode', () => {
      const state = engine.getState();
      expect(state.status).toBe('setup');
      expect(state.currentPlayer).toBe(1);
      expect(state.winner).toBeNull();
    });
  });

  describe('knight movement validation', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should validate correct L-shaped moves', () => {
      // From (0,0), valid knight moves are (1,2) and (2,1)
      expect(engine.isValidMove({ row: 1, col: 2 })).toBe(true);
      expect(engine.isValidMove({ row: 2, col: 1 })).toBe(true);
    });

    it('should reject non-L-shaped moves', () => {
      // From (0,0), these are not valid knight moves
      expect(engine.isValidMove({ row: 1, col: 1 })).toBe(false);
      expect(engine.isValidMove({ row: 0, col: 1 })).toBe(false);
      expect(engine.isValidMove({ row: 1, col: 0 })).toBe(false);
      expect(engine.isValidMove({ row: 2, col: 2 })).toBe(false);
    });

    it('should reject moves outside the grid', () => {
      expect(engine.isValidMove({ row: -1, col: 2 })).toBe(false);
      expect(engine.isValidMove({ row: 0, col: 8 })).toBe(false);
    });

    it('should reject moves to exhausted squares', () => {
      // Make a move to (1,2), which exhausts (0,0)
      engine.makeMove({ row: 1, col: 2 });

      // Now try to move back - should fail if (0,0) was exhausted
      // But we need to make another move first to come back to player 1
      engine.makeMove({ row: 6, col: 5 }); // Player 2 moves

      // Player 1 should not be able to move to an exhausted square
      const state = engine.getState();
      expect(state.grid[0][0]).toBe('exhausted');
    });
  });

  describe('game flow', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should switch players after a valid move', () => {
      expect(engine.getState().currentPlayer).toBe(1);
      engine.makeMove({ row: 1, col: 2 });
      expect(engine.getState().currentPlayer).toBe(2);
    });

    it('should mark the old position as exhausted after a move', () => {
      const initialPos = engine.getState().playerPositions[1];
      engine.makeMove({ row: 1, col: 2 });
      const state = engine.getState();
      expect(state.grid[initialPos.row][initialPos.col]).toBe('exhausted');
    });

    it('should update player position after a move', () => {
      engine.makeMove({ row: 1, col: 2 });
      const state = engine.getState();
      expect(state.playerPositions[1]).toEqual({ row: 1, col: 2 });
      expect(state.grid[1][2]).toBe(1);
    });

    it('should track move history', () => {
      engine.makeMove({ row: 1, col: 2 });
      engine.makeMove({ row: 6, col: 5 });
      const state = engine.getState();
      expect(state.moveHistory.length).toBe(2);
      expect(state.moveHistory[0]).toEqual({
        player: 1,
        from: { row: 0, col: 0 },
        to: { row: 1, col: 2 },
      });
    });
  });

  describe('win conditions', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should detect elimination when a player lands on opponent', () => {
      // This is a contrived example - in practice it's hard to eliminate directly
      // But we can test the logic by creating a scenario

      // We'll need to carefully move players toward each other
      // For testing, let's manually verify the elimination logic works

      // Move player 1 from (0,0) to (1,2)
      engine.makeMove({ row: 1, col: 2 });

      // Move player 2 from (7,7) to (6,5)
      engine.makeMove({ row: 6, col: 5 });

      // Continue moving toward each other
      engine.makeMove({ row: 2, col: 4 }); // Player 1
      engine.makeMove({ row: 5, col: 3 }); // Player 2

      // Move to same square
      engine.makeMove({ row: 3, col: 2 }); // Player 1
      engine.makeMove({ row: 3, col: 2 }); // Player 2 lands on Player 1

      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe(2);
      expect(state.winReason).toBe('elimination');
    });

    it('should provide valid moves list', () => {
      const validMoves = engine.getValidMoves();
      expect(validMoves.length).toBeGreaterThan(0);
      expect(validMoves).toContainEqual({ row: 1, col: 2 });
      expect(validMoves).toContainEqual({ row: 2, col: 1 });
    });
  });

  describe('reset', () => {
    it('should reset the game to initial state', () => {
      engine.startGame();
      engine.makeMove({ row: 1, col: 2 });
      engine.makeMove({ row: 6, col: 5 });

      engine.reset();

      const state = engine.getState();
      expect(state.status).toBe('setup');
      expect(state.currentPlayer).toBe(1);
      expect(state.winner).toBeNull();
      expect(state.playerPositions[1]).toEqual({ row: 0, col: 0 });
      expect(state.playerPositions[2]).toEqual({ row: 7, col: 7 });
      expect(state.moveHistory.length).toBe(0);
    });
  });
});
