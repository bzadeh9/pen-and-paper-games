import { describe, it, expect, beforeEach } from 'vitest';
import { BlackHoleEngine } from './engine';

describe('BlackHoleEngine', () => {
  let engine: BlackHoleEngine;

  beforeEach(() => {
    engine = new BlackHoleEngine();
  });

  describe('initialization', () => {
    it('should create 21 circles in a pyramid', () => {
      const state = engine.getState();
      expect(state.circles).toHaveLength(21);
    });

    it('should start with player 1', () => {
      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
    });

    it('should initialize counters at 1', () => {
      const state = engine.getState();
      expect(state.player1Counter).toBe(1);
      expect(state.player2Counter).toBe(1);
    });

    it('should have all circles empty initially', () => {
      const state = engine.getState();
      expect(state.circles.every((c) => c.value === null)).toBe(true);
    });
  });

  describe('makeMove', () => {
    it('should place player 1 number on first move', () => {
      engine.makeMove(0);
      const state = engine.getState();
      expect(state.circles[0].value).toBe(1);
      expect(state.circles[0].owner).toBe(1);
    });

    it('should switch to player 2 after player 1 moves', () => {
      engine.makeMove(0);
      const state = engine.getState();
      expect(state.currentPlayer).toBe(2);
    });

    it('should increment player counters correctly', () => {
      engine.makeMove(0); // Player 1 places 1
      engine.makeMove(1); // Player 2 places 1
      engine.makeMove(2); // Player 1 places 2

      const state = engine.getState();
      expect(state.circles[0].value).toBe(1);
      expect(state.circles[1].value).toBe(1);
      expect(state.circles[2].value).toBe(2);
    });

    it('should not allow moves on occupied circles', () => {
      engine.makeMove(0);
      const result = engine.makeMove(0);
      expect(result).toBe(false);
    });

    it('should end game after 20 moves', () => {
      // Fill 20 circles
      for (let i = 0; i < 20; i++) {
        engine.makeMove(i);
      }
      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.blackHoleId).toBe(20);
    });
  });

  describe('scoring', () => {
    it('should calculate scores correctly', () => {
      // Place numbers such that we know the black hole location
      // Fill circles 0-19, leaving 20 as black hole
      for (let i = 0; i < 20; i++) {
        engine.makeMove(i);
      }

      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.blackHoleId).toBe(20);

      // Scores should be calculated based on adjacent circles
      expect(state.player1Score).toBeGreaterThanOrEqual(0);
      expect(state.player2Score).toBeGreaterThanOrEqual(0);
    });

    it('should declare winner with lower score in lowest mode', () => {
      // Simulate a game in lowest mode (default)
      for (let i = 0; i < 20; i++) {
        engine.makeMove(i);
      }

      const state = engine.getState();
      expect(state.mode).toBe('lowest');
      if (state.winner !== 'draw') {
        if (state.winner === 1) {
          expect(state.player1Score).toBeLessThan(state.player2Score);
        } else {
          expect(state.player2Score).toBeLessThan(state.player1Score);
        }
      } else {
        expect(state.player1Score).toBe(state.player2Score);
      }
    });

    it('should declare winner with higher score in highest mode', () => {
      // Create engine with highest mode
      const highestEngine = new BlackHoleEngine('highest');

      // Simulate a game
      for (let i = 0; i < 20; i++) {
        highestEngine.makeMove(i);
      }

      const state = highestEngine.getState();
      expect(state.mode).toBe('highest');
      if (state.winner !== 'draw') {
        if (state.winner === 1) {
          expect(state.player1Score).toBeGreaterThan(state.player2Score);
        } else {
          expect(state.player2Score).toBeGreaterThan(state.player1Score);
        }
      } else {
        expect(state.player1Score).toBe(state.player2Score);
      }
    });
  });

  describe('game modes', () => {
    it('should default to lowest mode', () => {
      const state = engine.getState();
      expect(state.mode).toBe('lowest');
    });

    it('should support highest mode', () => {
      const highestEngine = new BlackHoleEngine('highest');
      const state = highestEngine.getState();
      expect(state.mode).toBe('highest');
    });

    it('should allow mode changes', () => {
      engine.setMode('highest');
      const state = engine.getState();
      expect(state.mode).toBe('highest');
    });

    it('should preserve mode on reset', () => {
      engine.setMode('highest');
      engine.makeMove(0);
      engine.reset();

      const state = engine.getState();
      expect(state.mode).toBe('highest');
    });
  });

  describe('reset', () => {
    it('should reset game to initial state', () => {
      engine.makeMove(0);
      engine.makeMove(1);
      engine.reset();

      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
      expect(state.currentTurnNumber).toBe(1);
      expect(state.circles.every((c) => c.value === null)).toBe(true);
      expect(state.status).toBe('setup');
    });
  });
});
