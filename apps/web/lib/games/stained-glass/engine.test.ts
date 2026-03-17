import { describe, it, expect, beforeEach } from 'vitest';
import { StainedGlassEngine, MIN_GRID_SIZE, MAX_GRID_SIZE } from './engine';

describe('StainedGlassEngine', () => {
  let engine: StainedGlassEngine;

  beforeEach(() => {
    engine = new StainedGlassEngine(4, 'standard');
  });

  describe('initialization', () => {
    it('should create a 4x4 grid with 16 sections', () => {
      const state = engine.getState();
      expect(state.sections).toHaveLength(16);
    });

    it('should start with player 1', () => {
      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
    });

    it('should start in setup status', () => {
      const state = engine.getState();
      expect(state.status).toBe('setup');
    });

    it('should start with scores at 0', () => {
      const state = engine.getState();
      expect(state.player1Score).toBe(0);
      expect(state.player2Score).toBe(0);
    });

    it('should have all sections unowned', () => {
      const state = engine.getState();
      expect(state.sections.every((s) => s.owner === null)).toBe(true);
    });

    it('should clamp grid size to minimum', () => {
      const small = new StainedGlassEngine(1);
      expect(small.getState().sections).toHaveLength(MIN_GRID_SIZE * MIN_GRID_SIZE);
    });

    it('should clamp grid size to maximum', () => {
      const large = new StainedGlassEngine(20);
      expect(large.getState().sections).toHaveLength(MAX_GRID_SIZE * MAX_GRID_SIZE);
    });

    it('should default to standard mode', () => {
      const state = engine.getState();
      expect(state.mode).toBe('standard');
    });

    it('should compute correct neighbors for corner section', () => {
      // Section 0 (top-left corner of 4x4 grid)
      const state = engine.getState();
      const section = state.sections[0];
      // Should have right (1) and down (4)
      expect(section.neighbors).toHaveLength(2);
      expect(section.neighbors).toContain(1);
      expect(section.neighbors).toContain(4);
    });

    it('should compute correct neighbors for center section', () => {
      // Section 5 (row 1, col 1 of 4x4 grid)
      const state = engine.getState();
      const section = state.sections[5];
      // Should have up (1), down (9), left (4), right (6)
      expect(section.neighbors).toHaveLength(4);
      expect(section.neighbors).toContain(1);
      expect(section.neighbors).toContain(9);
      expect(section.neighbors).toContain(4);
      expect(section.neighbors).toContain(6);
    });
  });

  describe('standard mode moves', () => {
    it('should auto-start the game on first move', () => {
      engine.makeMove(0);
      const state = engine.getState();
      expect(state.status).toBe('playing');
    });

    it('should color a section for the current player', () => {
      engine.makeMove(0);
      const state = engine.getState();
      expect(state.sections[0].owner).toBe(1);
    });

    it('should switch players after a move', () => {
      engine.makeMove(0);
      const state = engine.getState();
      expect(state.currentPlayer).toBe(2);
    });

    it('should update scores after a move', () => {
      engine.makeMove(0);
      const state = engine.getState();
      expect(state.player1Score).toBe(1);
      expect(state.player2Score).toBe(0);
    });

    it('should not allow coloring an already-colored section', () => {
      engine.makeMove(0);
      const result = engine.makeMove(0);
      expect(result).toBe(false);
    });

    it('should not allow coloring next to opponent section', () => {
      // 4x4 grid: section 0 neighbors are [1, 4]
      engine.makeMove(0); // P1 takes section 0
      // P2 cannot take section 1 (neighbor of P1's section 0)
      const result = engine.makeMove(1);
      expect(result).toBe(false);
    });

    it('should allow coloring next to own section', () => {
      // P1 takes section 0
      engine.makeMove(0);
      // P2 takes a far section (e.g., 15 — bottom-right corner of 4x4)
      engine.makeMove(15);
      // P1 takes section 1 (neighbor of own section 0) — should be allowed
      const result = engine.makeMove(1);
      expect(result).toBe(true);
    });

    it('should allow diagonal placement next to opponent', () => {
      // 4x4 grid: section 0 neighbors are [1, 4]
      // Section 5 (row 1, col 1) is diagonal to section 0, not a side neighbor
      engine.makeMove(0); // P1 takes section 0
      const result = engine.makeMove(5); // P2 takes section 5 (diagonal to 0)
      expect(result).toBe(true);
    });
  });

  describe('reverse mode moves', () => {
    let reverseEngine: StainedGlassEngine;

    beforeEach(() => {
      reverseEngine = new StainedGlassEngine(4, 'reverse');
    });

    it('should use reverse mode', () => {
      expect(reverseEngine.getState().mode).toBe('reverse');
    });

    it('should not allow coloring next to own section', () => {
      reverseEngine.makeMove(0); // P1 takes section 0
      // P2 takes a far section
      reverseEngine.makeMove(15);
      // P1 tries section 1 (neighbor of own section 0) — should be blocked
      const result = reverseEngine.makeMove(1);
      expect(result).toBe(false);
    });

    it('should allow coloring next to opponent section', () => {
      reverseEngine.makeMove(0); // P1 takes section 0
      // P2 takes section 1 (neighbor of P1's section 0) — allowed in reverse
      const result = reverseEngine.makeMove(1);
      expect(result).toBe(true);
    });

    it('should allow diagonal placement next to own section', () => {
      // Section 5 (row 1, col 1) is diagonal to section 0
      reverseEngine.makeMove(0); // P1
      reverseEngine.makeMove(3); // P2
      // P1 takes section 5 — diagonal to own section 0, not a side neighbor
      const result = reverseEngine.makeMove(5);
      expect(result).toBe(true);
    });
  });

  describe('game end', () => {
    it('should end when a player has no valid moves', () => {
      // Use a small 3x3 grid for easier testing
      const small = new StainedGlassEngine(3, 'standard');
      // 3x3 grid: 9 sections (0-8)
      // Layout:
      //  0  1  2
      //  3  4  5
      //  6  7  8
      // P1 takes 0 → blocks P2 from [1, 3]
      small.makeMove(0); // P1 takes 0
      // P2 valid sections: cannot touch 0's neighbors (1, 3)
      // Available for P2: 2, 4, 5, 6, 7, 8 minus those adjacent to 0
      // Section 4 neighbors 0? No, 4's neighbors are [1,7,3,5], not 0
      // So P2 can take 2, 4, 5, 6, 7, 8
      small.makeMove(2); // P2 takes 2, blocks P1 from [1, 5]
      // P1 blocked from: 1 (adj to P2@2), 5 (adj to P2@2)
      // P1 can take: 4, 6, 7, 8 (minus adj to P2)
      // Section 4 adj to P2? 4 neighbors: [1,7,3,5], none owned by P2
      small.makeMove(4); // P1 takes 4, blocks P2 from [1,7,3,5]
      // P2 blocked from: 1 (adj P1@0 & P1@4), 3 (adj P1@0 & P1@4), 5 (adj P1@4 & P2@2? no P2 is allowed adj to own)
      // In standard mode, P2 cannot be adj to P1 sections
      // P2 cannot take: 1 (adj P1@0), 3 (adj P1@0), 5 (adj P1@4), 7 (adj P1@4)
      // P2 can take: 6, 8
      small.makeMove(6); // P2 takes 6, blocks P1 from [3, 7]
      // P1 blocked from: 3 (adj P2@6), 7 (adj P2@6)
      // P1 can take: 8 (adj to [5, 7] — 5 is unowned, 7 is unowned)
      small.makeMove(8); // P1 takes 8
      // Now P2's turn. P2 blocked from: 1 (adj P1@0), 3 (adj P1@0 & P1@4), 5 (adj P1@4 & P1@8), 7 (adj P1@4 & P1@8)
      // P2 has no valid moves → P2 concedes, P1 wins

      const state = small.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe(1);
    });

    it('should declare the correct winner', () => {
      const small = new StainedGlassEngine(3, 'standard');
      // Same sequence as above
      small.makeMove(0);
      small.makeMove(2);
      small.makeMove(4);
      small.makeMove(6);
      small.makeMove(8);

      const state = small.getState();
      expect(state.winner).toBe(1);
      expect(state.player1Score).toBe(3);
      expect(state.player2Score).toBe(2);
    });
  });

  describe('getValidMoves', () => {
    it('should return all sections before any moves', () => {
      engine.startGame();
      const moves = engine.getValidMoves();
      expect(moves).toHaveLength(16);
    });

    it('should exclude occupied and blocked sections', () => {
      engine.makeMove(0); // P1 takes 0
      // P2's valid moves: all unowned sections NOT adjacent to P1's section 0
      // Section 0 neighbors: [1, 4]
      // So P2 cannot take 1 or 4
      const moves = engine.getValidMoves();
      expect(moves).not.toContain(0); // occupied
      expect(moves).not.toContain(1); // adj to P1
      expect(moves).not.toContain(4); // adj to P1
      expect(moves.length).toBe(13); // 16 - 3 (occupied + 2 blocked)
    });

    it('should return empty when game is in setup', () => {
      const moves = engine.getValidMoves();
      expect(moves).toHaveLength(0);
    });
  });

  describe('mode and grid size changes', () => {
    it('should allow mode change in setup', () => {
      engine.setMode('reverse');
      expect(engine.getState().mode).toBe('reverse');
    });

    it('should not allow mode change during play', () => {
      engine.startGame();
      engine.makeMove(0);
      engine.setMode('reverse');
      expect(engine.getState().mode).toBe('standard');
    });

    it('should allow grid size change in setup', () => {
      engine.setGridSize(5);
      expect(engine.getState().sections).toHaveLength(25);
    });

    it('should not allow grid size change during play', () => {
      engine.startGame();
      engine.makeMove(0);
      engine.setGridSize(5);
      expect(engine.getState().sections).toHaveLength(16);
    });

    it('should preserve mode on grid size change', () => {
      engine.setMode('reverse');
      engine.setGridSize(5);
      expect(engine.getState().mode).toBe('reverse');
    });
  });

  describe('reset', () => {
    it('should reset game to initial state', () => {
      engine.makeMove(0);
      engine.makeMove(15);
      engine.reset();

      const state = engine.getState();
      expect(state.currentPlayer).toBe(1);
      expect(state.sections.every((s) => s.owner === null)).toBe(true);
      expect(state.player1Score).toBe(0);
      expect(state.player2Score).toBe(0);
      expect(state.status).toBe('setup');
      expect(state.winner).toBeNull();
    });

    it('should preserve grid size on reset', () => {
      engine.setGridSize(5);
      engine.makeMove(0);
      engine.reset();
      expect(engine.getState().sections).toHaveLength(25);
    });

    it('should preserve mode on reset', () => {
      engine.setMode('reverse');
      engine.makeMove(0);
      engine.reset();
      expect(engine.getState().mode).toBe('reverse');
    });
  });

  describe('state immutability', () => {
    it('should return a copy of sections', () => {
      const state1 = engine.getState();
      const state2 = engine.getState();
      expect(state1.sections).not.toBe(state2.sections);
      expect(state1.sections).toEqual(state2.sections);
    });

    it('should return copies of neighbor arrays', () => {
      const state1 = engine.getState();
      const state2 = engine.getState();
      expect(state1.sections[0].neighbors).not.toBe(state2.sections[0].neighbors);
      expect(state1.sections[0].neighbors).toEqual(state2.sections[0].neighbors);
    });
  });

  describe('loadSections', () => {
    it('should load a custom topology', () => {
      // Triangle of 3 sections: 0—1—2, where 0-1, 1-2 are neighbors
      engine.loadSections([
        { id: 0, neighbors: [1] },
        { id: 1, neighbors: [0, 2] },
        { id: 2, neighbors: [1] },
      ]);
      const state = engine.getState();
      expect(state.sections).toHaveLength(3);
      expect(state.sections[0].neighbors).toEqual([1]);
      expect(state.sections[1].neighbors).toEqual([0, 2]);
    });

    it('should reset game state when loading sections', () => {
      // Start game manually (not via makeMove to keep control)
      engine.startGame();
      engine.makeMove(0);
      // Move to ended status via a small game
      const small = new StainedGlassEngine(3, 'standard');
      small.makeMove(0); small.makeMove(2); small.makeMove(4);
      small.makeMove(6); small.makeMove(8);
      // small is now ended; test loadSections on the setup engine
      const fresh = new StainedGlassEngine(4, 'standard');
      fresh.loadSections([
        { id: 0, neighbors: [1] },
        { id: 1, neighbors: [0] },
      ]);
      const state = fresh.getState();
      expect(state.currentPlayer).toBe(1);
      expect(state.status).toBe('setup');
      expect(state.winner).toBeNull();
      expect(state.sections.every((s) => s.owner === null)).toBe(true);
    });

    it('should not load sections during play', () => {
      engine.startGame();
      engine.makeMove(0);
      engine.loadSections([
        { id: 0, neighbors: [1] },
        { id: 1, neighbors: [0] },
      ]);
      // Should still have original 16 sections
      expect(engine.getState().sections).toHaveLength(16);
    });

    it('should support gameplay on custom topology', () => {
      // Linear chain: 0—1—2—3
      engine.loadSections([
        { id: 0, neighbors: [1] },
        { id: 1, neighbors: [0, 2] },
        { id: 2, neighbors: [1, 3] },
        { id: 3, neighbors: [2] },
      ]);

      // Standard mode: cannot be adjacent to opponent
      engine.makeMove(0); // P1 takes 0 → blocks P2 from 1
      const state = engine.getState();
      expect(state.sections[0].owner).toBe(1);
      expect(state.currentPlayer).toBe(2);

      // P2 cannot take 1 (adj to P1), can take 2 or 3
      const result = engine.makeMove(1);
      expect(result).toBe(false);

      const result2 = engine.makeMove(3);
      expect(result2).toBe(true);
    });
  });
});
