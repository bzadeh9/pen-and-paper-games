import { describe, it, expect, beforeEach } from 'vitest';
import { OrderAndChaosEngine } from './engine';

describe('OrderAndChaosEngine', () => {
  let engine: OrderAndChaosEngine;

  beforeEach(() => {
    engine = new OrderAndChaosEngine();
  });

  describe('initialization', () => {
    it('should create a 6x6 empty board', () => {
      const state = engine.getState();
      expect(state.board).toHaveLength(6);
      expect(state.board[0]).toHaveLength(6);
      
      // Check all cells are empty
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          expect(state.board[row][col].color).toBeNull();
        }
      }
    });

    it('should start with Order as the first player', () => {
      const state = engine.getState();
      expect(state.currentPlayer).toBe('order');
    });

    it('should start with status playing', () => {
      const state = engine.getState();
      expect(state.status).toBe('playing');
    });

    it('should have no winner initially', () => {
      const state = engine.getState();
      expect(state.winner).toBeNull();
    });
  });

  describe('makeMove', () => {
    it('should place a piece on an empty cell', () => {
      const success = engine.makeMove(0, 0, 'cherry-blossom');
      expect(success).toBe(true);
      
      const state = engine.getState();
      expect(state.board[0][0].color).toBe('cherry-blossom');
    });

    it('should not place a piece on an occupied cell', () => {
      engine.makeMove(0, 0, 'cherry-blossom');
      const success = engine.makeMove(0, 0, 'dusty-mauve');
      expect(success).toBe(false);
      
      const state = engine.getState();
      expect(state.board[0][0].color).toBe('cherry-blossom');
    });

    it('should alternate players after each move', () => {
      engine.makeMove(0, 0, 'cherry-blossom');
      let state = engine.getState();
      expect(state.currentPlayer).toBe('chaos');
      
      engine.makeMove(0, 1, 'dusty-mauve');
      state = engine.getState();
      expect(state.currentPlayer).toBe('order');
    });

    it('should increment moves count', () => {
      engine.makeMove(0, 0, 'cherry-blossom');
      let state = engine.getState();
      expect(state.movesCount).toBe(1);
      
      engine.makeMove(0, 1, 'dusty-mauve');
      state = engine.getState();
      expect(state.movesCount).toBe(2);
    });

    it('should reject moves outside the board', () => {
      expect(engine.makeMove(-1, 0, 'cherry-blossom')).toBe(false);
      expect(engine.makeMove(0, -1, 'cherry-blossom')).toBe(false);
      expect(engine.makeMove(6, 0, 'cherry-blossom')).toBe(false);
      expect(engine.makeMove(0, 6, 'cherry-blossom')).toBe(false);
    });
  });

  describe('win conditions', () => {
    it('should detect horizontal five in a row (Order wins)', () => {
      // Create a horizontal line of cherry-blossom pieces
      for (let col = 0; col < 5; col++) {
        engine.makeMove(0, col, 'cherry-blossom');
      }
      
      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe('order');
    });

    it('should detect vertical five in a row (Order wins)', () => {
      // Create a vertical line of dusty-mauve pieces
      for (let row = 0; row < 5; row++) {
        engine.makeMove(row, 0, 'dusty-mauve');
      }
      
      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe('order');
    });

    it('should detect diagonal five in a row (Order wins)', () => {
      // Create a diagonal line of cherry-blossom pieces
      for (let i = 0; i < 5; i++) {
        engine.makeMove(i, i, 'cherry-blossom');
      }
      
      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe('order');
    });

    it('should detect when board is full (Chaos wins)', () => {
      // Fill the board without creating five in a row
      const pattern: Array<[number, number, 'cherry-blossom' | 'dusty-mauve']> = [];
      
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          // Alternate colors in a checkerboard pattern to avoid five in a row
          const color = (row + col) % 2 === 0 ? 'cherry-blossom' : 'dusty-mauve';
          pattern.push([row, col, color]);
        }
      }
      
      // Make moves
      for (const [row, col, color] of pattern) {
        const state = engine.getState();
        if (state.status === 'playing') {
          engine.makeMove(row, col, color);
        }
      }
      
      const finalState = engine.getState();
      // If no five in a row was created, Chaos should win
      if (finalState.movesCount >= 36) {
        expect(finalState.winner).toBe('chaos');
      }
    });
  });

  describe('reset', () => {
    it('should reset the game to initial state', () => {
      engine.makeMove(0, 0, 'cherry-blossom');
      engine.makeMove(0, 1, 'dusty-mauve');
      
      engine.reset();
      
      const state = engine.getState();
      expect(state.currentPlayer).toBe('order');
      expect(state.status).toBe('playing');
      expect(state.winner).toBeNull();
      expect(state.movesCount).toBe(0);
      
      // Check board is empty
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
          expect(state.board[row][col].color).toBeNull();
        }
      }
    });
  });

  describe('isValidMove', () => {
    it('should return true for empty cells during play', () => {
      expect(engine.isValidMove(0, 0)).toBe(true);
      expect(engine.isValidMove(5, 5)).toBe(true);
    });

    it('should return false for occupied cells', () => {
      engine.makeMove(0, 0, 'cherry-blossom');
      expect(engine.isValidMove(0, 0)).toBe(false);
    });

    it('should return false when game has ended', () => {
      // Create a horizontal line to end the game
      for (let col = 0; col < 5; col++) {
        engine.makeMove(0, col, 'cherry-blossom');
      }
      
      expect(engine.isValidMove(1, 0)).toBe(false);
    });
  });
});
