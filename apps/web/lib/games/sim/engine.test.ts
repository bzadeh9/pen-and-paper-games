import { describe, it, expect, beforeEach } from 'vitest';
import { SimEngine, NUM_VERTICES, TOTAL_EDGES } from './engine';

describe('SimEngine', () => {
  let engine: SimEngine;

  beforeEach(() => {
    engine = new SimEngine();
  });

  describe('initialization', () => {
    it('should start with 6 vertices', () => {
      const state = engine.getState();
      expect(state.vertices).toBe(NUM_VERTICES);
    });

    it('should start with player 1', () => {
      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
    });

    it('should start with no edges', () => {
      const state = engine.getState();
      expect(state.edges).toHaveLength(0);
    });

    it('should start in playing status', () => {
      const state = engine.getState();
      expect(state.status).toBe('playing');
    });

    it('should have no winner or loser initially', () => {
      const state = engine.getState();
      expect(state.winner).toBeNull();
      expect(state.loser).toBeNull();
      expect(state.losingTriangle).toBeNull();
    });

    it('should have 15 total possible edges', () => {
      const state = engine.getState();
      expect(state.totalEdges).toBe(TOTAL_EDGES);
    });
  });

  describe('makeMove', () => {
    it('should place an edge between two vertices', () => {
      engine.makeMove(0, 1);
      const state = engine.getState();
      expect(state.edges).toHaveLength(1);
      expect(state.edges[0]).toMatchObject({ v1: 0, v2: 1, owner: 1 });
    });

    it('should normalize edge so v1 < v2', () => {
      engine.makeMove(3, 1);
      const state = engine.getState();
      expect(state.edges[0]).toMatchObject({ v1: 1, v2: 3, owner: 1 });
    });

    it('should switch to player 2 after player 1 moves', () => {
      engine.makeMove(0, 1);
      const state = engine.getState();
      expect(state.currentPlayer).toBe(2);
    });

    it('should alternate players', () => {
      engine.makeMove(0, 1); // P1
      engine.makeMove(2, 3); // P2
      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
    });

    it('should not allow duplicate edges', () => {
      engine.makeMove(0, 1);
      const result = engine.makeMove(0, 1);
      expect(result).toBe(false);
    });

    it('should not allow duplicate edges with reversed vertices', () => {
      engine.makeMove(0, 1);
      const result = engine.makeMove(1, 0);
      expect(result).toBe(false);
    });

    it('should not allow same vertex edges', () => {
      const result = engine.makeMove(2, 2);
      expect(result).toBe(false);
    });

    it('should not allow vertices out of range', () => {
      expect(engine.isValidMove(-1, 3)).toBe(false);
      expect(engine.isValidMove(0, 6)).toBe(false);
      expect(engine.isValidMove(6, 0)).toBe(false);
    });

    it('should return true for valid moves', () => {
      const result = engine.makeMove(0, 1);
      expect(result).toBe(true);
    });
  });

  describe('triangle detection', () => {
    it('should detect a triangle and end the game', () => {
      // P1 draws edges forming a triangle: 0-1, 1-2, 0-2
      engine.makeMove(0, 1); // P1
      engine.makeMove(3, 4); // P2
      engine.makeMove(1, 2); // P1
      engine.makeMove(3, 5); // P2
      engine.makeMove(0, 2); // P1 completes triangle 0-1-2 → P1 loses

      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.loser).toBe(1);
      expect(state.winner).toBe(2);
    });

    it('should identify the losing triangle', () => {
      engine.makeMove(0, 1); // P1
      engine.makeMove(3, 4); // P2
      engine.makeMove(1, 2); // P1
      engine.makeMove(3, 5); // P2
      engine.makeMove(0, 2); // P1 completes triangle

      const state = engine.getState();
      expect(state.losingTriangle).not.toBeNull();
      const tri = state.losingTriangle!;
      const vertices = [tri.a, tri.b, tri.c].sort();
      expect(vertices).toEqual([0, 1, 2]);
    });

    it('should detect player 2 losing', () => {
      engine.makeMove(0, 1); // P1
      engine.makeMove(2, 3); // P2
      engine.makeMove(4, 5); // P1
      engine.makeMove(2, 4); // P2
      engine.makeMove(0, 3); // P1
      engine.makeMove(3, 4); // P2 completes triangle 2-3-4 → P2 loses

      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.loser).toBe(2);
      expect(state.winner).toBe(1);
    });

    it('should not detect a triangle with mixed colors', () => {
      // Edges 0-1 (P1), 1-2 (P2), 0-2 (P1) — no monochromatic triangle
      engine.makeMove(0, 1); // P1
      engine.makeMove(1, 2); // P2
      engine.makeMove(0, 2); // P1

      const state = engine.getState();
      expect(state.status).toBe('playing');
      expect(state.loser).toBeNull();
    });

    it('should not allow moves after game ends', () => {
      engine.makeMove(0, 1); // P1
      engine.makeMove(3, 4); // P2
      engine.makeMove(1, 2); // P1
      engine.makeMove(3, 5); // P2
      engine.makeMove(0, 2); // P1 loses

      const result = engine.makeMove(4, 5);
      expect(result).toBe(false);
    });
  });

  describe('edge queries', () => {
    it('should report edge existence', () => {
      engine.makeMove(0, 1);
      expect(engine.hasEdge(0, 1)).toBe(true);
      expect(engine.hasEdge(1, 0)).toBe(true);
      expect(engine.hasEdge(0, 2)).toBe(false);
    });

    it('should report edge owner', () => {
      engine.makeMove(0, 1); // P1
      engine.makeMove(2, 3); // P2
      expect(engine.getEdgeOwner(0, 1)).toBe(1);
      expect(engine.getEdgeOwner(2, 3)).toBe(2);
      expect(engine.getEdgeOwner(0, 3)).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      engine.makeMove(0, 1);
      engine.makeMove(2, 3);
      engine.reset();

      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
      expect(state.edges).toHaveLength(0);
      expect(state.status).toBe('playing');
      expect(state.winner).toBeNull();
      expect(state.loser).toBeNull();
      expect(state.losingTriangle).toBeNull();
    });

    it('should allow playing after reset', () => {
      engine.makeMove(0, 1);
      engine.makeMove(3, 4);
      engine.makeMove(1, 2);
      engine.makeMove(3, 5);
      engine.makeMove(0, 2); // P1 loses

      engine.reset();
      const result = engine.makeMove(0, 1);
      expect(result).toBe(true);
    });
  });

  describe('state immutability', () => {
    it('should return a copy of edges', () => {
      engine.makeMove(0, 1);
      const state1 = engine.getState();
      const state2 = engine.getState();
      expect(state1.edges).not.toBe(state2.edges);
      expect(state1.edges).toEqual(state2.edges);
    });

    it('should return a copy of losingTriangle', () => {
      engine.makeMove(0, 1);
      engine.makeMove(3, 4);
      engine.makeMove(1, 2);
      engine.makeMove(3, 5);
      engine.makeMove(0, 2);

      const state1 = engine.getState();
      const state2 = engine.getState();
      expect(state1.losingTriangle).not.toBe(state2.losingTriangle);
      expect(state1.losingTriangle).toEqual(state2.losingTriangle);
    });
  });
});
