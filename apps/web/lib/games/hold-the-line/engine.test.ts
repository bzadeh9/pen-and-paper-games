import { describe, it, expect, beforeEach } from 'vitest';
import { HoldTheLineEngine } from './engine';

describe('HoldTheLineEngine', () => {
  let engine: HoldTheLineEngine;

  beforeEach(() => {
    engine = new HoldTheLineEngine(4);
  });

  describe('initialization', () => {
    it('should create a game with correct initial state', () => {
      const state = engine.getState();
      expect(state.gridSize).toBe(4);
      expect(state.visitedDots.size).toBe(0);
      expect(state.pathEnds).toBeNull();
      expect(state.currentPlayer).toBe(1);
      expect(state.status).toBe('playing');
      expect(state.winner).toBeNull();
      expect(state.moveHistory).toEqual([]);
    });
  });

  describe('first move', () => {
    it('should allow any valid position on the grid', () => {
      expect(engine.isValidMove({ row: 0, col: 0 })).toBe(true);
      expect(engine.isValidMove({ row: 3, col: 3 })).toBe(true);
      expect(engine.isValidMove({ row: 2, col: 1 })).toBe(true);
    });

    it('should reject out of bounds positions', () => {
      expect(engine.isValidMove({ row: -1, col: 0 })).toBe(false);
      expect(engine.isValidMove({ row: 4, col: 0 })).toBe(false);
      expect(engine.isValidMove({ row: 0, col: -1 })).toBe(false);
      expect(engine.isValidMove({ row: 0, col: 4 })).toBe(false);
    });

    it('should set path ends correctly after first move', () => {
      const pos = { row: 1, col: 1 };
      engine.makeMove(pos);
      const state = engine.getState();
      expect(state.pathEnds).not.toBeNull();
      expect(state.pathEnds![0]).toEqual(pos);
      expect(state.pathEnds![1]).toEqual(pos);
    });

    it('should switch player after first move', () => {
      engine.makeMove({ row: 1, col: 1 });
      const state = engine.getState();
      expect(state.currentPlayer).toBe(2);
    });
  });

  describe('subsequent moves', () => {
    beforeEach(() => {
      // Make first move at (1, 1)
      engine.makeMove({ row: 1, col: 1 });
    });

    it('should allow adjacent horizontal moves', () => {
      expect(engine.isValidMove({ row: 1, col: 0 })).toBe(true); // left
      expect(engine.isValidMove({ row: 1, col: 2 })).toBe(true); // right
    });

    it('should allow adjacent vertical moves', () => {
      expect(engine.isValidMove({ row: 0, col: 1 })).toBe(true); // up
      expect(engine.isValidMove({ row: 2, col: 1 })).toBe(true); // down
    });

    it('should allow adjacent diagonal moves', () => {
      expect(engine.isValidMove({ row: 0, col: 0 })).toBe(true); // top-left
      expect(engine.isValidMove({ row: 0, col: 2 })).toBe(true); // top-right
      expect(engine.isValidMove({ row: 2, col: 0 })).toBe(true); // bottom-left
      expect(engine.isValidMove({ row: 2, col: 2 })).toBe(true); // bottom-right
    });

    it('should reject non-adjacent moves', () => {
      expect(engine.isValidMove({ row: 3, col: 3 })).toBe(false);
      expect(engine.isValidMove({ row: 0, col: 3 })).toBe(false);
    });

    it('should reject already visited dots', () => {
      engine.makeMove({ row: 1, col: 2 });
      expect(engine.isValidMove({ row: 1, col: 1 })).toBe(false); // first move
      expect(engine.isValidMove({ row: 1, col: 2 })).toBe(false); // second move
    });

    it('should update path ends correctly', () => {
      engine.makeMove({ row: 1, col: 2 }); // Move to the right
      const state = engine.getState();
      expect(state.pathEnds).not.toBeNull();
      
      // One end should be the new position, the other should be the old position
      const ends = [state.pathEnds![0], state.pathEnds![1]];
      expect(ends).toContainEqual({ row: 1, col: 1 });
      expect(ends).toContainEqual({ row: 1, col: 2 });
    });

    it('should allow moves from both ends of the path', () => {
      engine.makeMove({ row: 1, col: 2 }); // Extend to the right
      // Now path is from (1,1) to (1,2)
      
      // Should allow moves adjacent to (1,1)
      expect(engine.isValidMove({ row: 0, col: 1 })).toBe(true);
      expect(engine.isValidMove({ row: 2, col: 1 })).toBe(true);
      
      // Should allow moves adjacent to (1,2)
      expect(engine.isValidMove({ row: 0, col: 2 })).toBe(true);
      expect(engine.isValidMove({ row: 2, col: 2 })).toBe(true);
    });
  });

  describe('winning condition (misere play)', () => {
    it('should end the game when no valid moves remain', () => {
      // Create a scenario where the game ends
      // Fill the grid in a way that traps the next player
      engine.makeMove({ row: 0, col: 0 });
      engine.makeMove({ row: 0, col: 1 });
      engine.makeMove({ row: 1, col: 1 });
      
      // Continue until no moves left
      let moves = engine.getValidMoves();
      while (moves.length > 0) {
        engine.makeMove(moves[0]);
        moves = engine.getValidMoves();
        if (engine.getState().status === 'ended') break;
      }
      
      const finalState = engine.getState();
      expect(finalState.status).toBe('ended');
      expect(finalState.winner).not.toBeNull();
    });

    it('should declare the other player as winner (misere)', () => {
      // Simulate a game where player 1 makes the last move
      engine.makeMove({ row: 0, col: 0 }); // Player 1
      
      let currentPlayer = engine.getState().currentPlayer;
      
      // Continue game
      let moves = engine.getValidMoves();
      while (moves.length > 0 && engine.getState().status === 'playing') {
        currentPlayer = engine.getState().currentPlayer;
        engine.makeMove(moves[0]);
        moves = engine.getValidMoves();
      }
      
      const finalState = engine.getState();
      if (finalState.status === 'ended') {
        // The player who made the last move should be the loser
        // So the winner should be the opposite player
        const lastMovePlayer = currentPlayer;
        const expectedWinner = lastMovePlayer === 1 ? 2 : 1;
        expect(finalState.winner).toBe(expectedWinner);
      }
    });
  });

  describe('game reset', () => {
    it('should reset the game to initial state', () => {
      engine.makeMove({ row: 1, col: 1 });
      engine.makeMove({ row: 1, col: 2 });
      
      engine.reset();
      
      const state = engine.getState();
      expect(state.visitedDots.size).toBe(0);
      expect(state.pathEnds).toBeNull();
      expect(state.currentPlayer).toBe(1);
      expect(state.status).toBe('playing');
      expect(state.winner).toBeNull();
      expect(state.moveHistory).toEqual([]);
    });
  });

  describe('getValidMoves', () => {
    it('should return all positions on first move', () => {
      const moves = engine.getValidMoves();
      expect(moves.length).toBe(16); // 4x4 grid
    });

    it('should return only adjacent positions after first move', () => {
      engine.makeMove({ row: 1, col: 1 });
      const moves = engine.getValidMoves();
      
      // Should have 8 adjacent positions (not on edge)
      expect(moves.length).toBe(8);
      
      // Verify all are adjacent to (1,1)
      moves.forEach((move) => {
        const rowDiff = Math.abs(move.row - 1);
        const colDiff = Math.abs(move.col - 1);
        expect(rowDiff <= 1 && colDiff <= 1).toBe(true);
      });
    });

    it('should exclude visited dots', () => {
      engine.makeMove({ row: 1, col: 1 });
      engine.makeMove({ row: 1, col: 2 });
      
      const moves = engine.getValidMoves();
      
      // Should not include already visited positions
      expect(moves).not.toContainEqual({ row: 1, col: 1 });
      expect(moves).not.toContainEqual({ row: 1, col: 2 });
    });
  });
});
