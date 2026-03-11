import { describe, it, expect, beforeEach } from 'vitest';
import { RowCallEngine } from './engine';

describe('RowCallEngine', () => {
  let engine: RowCallEngine;

  beforeEach(() => {
    engine = new RowCallEngine();
  });

  describe('initialization', () => {
    it('should create a 4x4 empty board', () => {
      const state = engine.getState();
      expect(state.board).toHaveLength(4);
      expect(state.board[0]).toHaveLength(4);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          expect(state.board[row][col].owner).toBeNull();
        }
      }
    });

    it('should start with player1 as active player', () => {
      const state = engine.getState();
      expect(state.activePlayer).toBe('player1');
    });

    it('should start in choose-line phase', () => {
      const state = engine.getState();
      expect(state.turnPhase).toBe('choose-line');
    });

    it('should start in playing status', () => {
      const state = engine.getState();
      expect(state.status).toBe('playing');
    });

    it('should have no winner initially', () => {
      const state = engine.getState();
      expect(state.winner).toBeNull();
    });

    it('should have no selected line initially', () => {
      const state = engine.getState();
      expect(state.selectedLine).toBeNull();
    });
  });

  describe('selectLine', () => {
    it('should allow selecting a row', () => {
      const success = engine.selectLine({ type: 'row', index: 0 });
      expect(success).toBe(true);

      const state = engine.getState();
      expect(state.selectedLine).toEqual({ type: 'row', index: 0 });
      expect(state.turnPhase).toBe('place-piece');
    });

    it('should allow selecting a column', () => {
      const success = engine.selectLine({ type: 'column', index: 2 });
      expect(success).toBe(true);

      const state = engine.getState();
      expect(state.selectedLine).toEqual({ type: 'column', index: 2 });
      expect(state.turnPhase).toBe('place-piece');
    });

    it('should reject out-of-bounds line selection', () => {
      expect(engine.selectLine({ type: 'row', index: -1 })).toBe(false);
      expect(engine.selectLine({ type: 'row', index: 4 })).toBe(false);
      expect(engine.selectLine({ type: 'column', index: -1 })).toBe(false);
      expect(engine.selectLine({ type: 'column', index: 4 })).toBe(false);
    });

    it('should reject selection when not in choose-line phase', () => {
      engine.selectLine({ type: 'row', index: 0 });
      // Now in place-piece phase
      const success = engine.selectLine({ type: 'row', index: 1 });
      expect(success).toBe(false);
    });
  });

  describe('placePiece', () => {
    it('should place a piece in the selected row', () => {
      engine.selectLine({ type: 'row', index: 0 });
      const success = engine.placePiece(0, 2);
      expect(success).toBe(true);

      const state = engine.getState();
      expect(state.board[0][2].owner).toBe('player1');
    });

    it('should place a piece in the selected column', () => {
      engine.selectLine({ type: 'column', index: 1 });
      const success = engine.placePiece(3, 1);
      expect(success).toBe(true);

      const state = engine.getState();
      expect(state.board[3][1].owner).toBe('player1');
    });

    it('should reject placement outside the selected row', () => {
      engine.selectLine({ type: 'row', index: 0 });
      const success = engine.placePiece(1, 0); // row 1, not row 0
      expect(success).toBe(false);
    });

    it('should reject placement outside the selected column', () => {
      engine.selectLine({ type: 'column', index: 2 });
      const success = engine.placePiece(0, 0); // col 0, not col 2
      expect(success).toBe(false);
    });

    it('should reject placement on occupied cell', () => {
      engine.selectLine({ type: 'row', index: 0 });
      engine.placePiece(0, 0); // player1 piece at (0,0)

      // Now player2's turn: select row 0 again
      engine.selectLine({ type: 'row', index: 0 });
      const success = engine.placePiece(0, 0); // already occupied
      expect(success).toBe(false);
    });

    it('should reject placement when not in place-piece phase', () => {
      const success = engine.placePiece(0, 0);
      expect(success).toBe(false);
    });

    it('should increment moves count', () => {
      engine.selectLine({ type: 'row', index: 0 });
      engine.placePiece(0, 0);

      const state = engine.getState();
      expect(state.movesCount).toBe(1);
    });
  });

  describe('turn flow', () => {
    it('should alternate active player after each complete turn', () => {
      // Player 1 turn: choose line, then player 2 places player 1's dot
      engine.selectLine({ type: 'row', index: 0 });
      expect(engine.getActingPlayer()).toBe('player2'); // opponent places
      engine.placePiece(0, 0);

      let state = engine.getState();
      expect(state.activePlayer).toBe('player2');
      expect(state.turnPhase).toBe('choose-line');

      // Player 2 turn: choose line, then player 1 places player 2's dot
      engine.selectLine({ type: 'column', index: 1 });
      expect(engine.getActingPlayer()).toBe('player1'); // opponent places
      engine.placePiece(0, 1);

      state = engine.getState();
      expect(state.activePlayer).toBe('player1');
      expect(state.turnPhase).toBe('choose-line');
    });

    it('should track acting player correctly in choose-line phase', () => {
      expect(engine.getActingPlayer()).toBe('player1');
    });

    it('should track acting player correctly in place-piece phase', () => {
      engine.selectLine({ type: 'row', index: 0 });
      expect(engine.getActingPlayer()).toBe('player2');
    });

    it('should clear selected line after placement', () => {
      engine.selectLine({ type: 'row', index: 0 });
      engine.placePiece(0, 0);

      const state = engine.getState();
      expect(state.selectedLine).toBeNull();
    });
  });

  describe('win conditions', () => {
    it('should detect horizontal 3 in a row', () => {
      // Player 1 gets pieces at (0,0), (0,1), (0,2)
      engine.selectLine({ type: 'row', index: 0 });
      engine.placePiece(0, 0); // Player 1's dot at (0,0)

      engine.selectLine({ type: 'row', index: 0 });
      engine.placePiece(0, 1); // Player 2's dot at (0,1) -- won't help since it's player 2

      // Wait - this places player 2's dot. Let me re-think.
      // After first turn: player1 has dot at (0,0), activePlayer=player2
      // Player 2 selects, player 1 places player 2's dot
      // We need to be strategic about getting player 1 three in a row

      // Let me restart with a fresh engine and carefully plan
      const e = new RowCallEngine();

      // Turn 1: Player1 active, selects row 0. Player2 places player1's dot at (0,0)
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 0);

      // Turn 2: Player2 active, selects row 1. Player1 places player2's dot at (1,0)
      e.selectLine({ type: 'row', index: 1 });
      e.placePiece(1, 0);

      // Turn 3: Player1 active, selects row 0. Player2 places player1's dot at (0,1)
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 1);

      // Turn 4: Player2 active, selects row 1. Player1 places player2's dot at (1,1)
      e.selectLine({ type: 'row', index: 1 });
      e.placePiece(1, 1);

      // Turn 5: Player1 active, selects row 0. Player2 places player1's dot at (0,2)
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 2); // player1 now has (0,0), (0,1), (0,2) = 3 in a row!

      const state = e.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe('player1');
    });

    it('should detect vertical 3 in a row', () => {
      const e = new RowCallEngine();

      // Turn 1: Player1 selects col A(0). Player2 places player1's dot at (0,0)
      e.selectLine({ type: 'column', index: 0 });
      e.placePiece(0, 0);

      // Turn 2: Player2 selects col B(1). Player1 places player2's dot at (0,1)
      e.selectLine({ type: 'column', index: 1 });
      e.placePiece(0, 1);

      // Turn 3: Player1 selects col A(0). Player2 places player1's dot at (1,0)
      e.selectLine({ type: 'column', index: 0 });
      e.placePiece(1, 0);

      // Turn 4: Player2 selects col B(1). Player1 places player2's dot at (1,1)
      e.selectLine({ type: 'column', index: 1 });
      e.placePiece(1, 1);

      // Turn 5: Player1 selects col A(0). Player2 places player1's dot at (2,0)
      e.selectLine({ type: 'column', index: 0 });
      e.placePiece(2, 0); // player1 now has (0,0), (1,0), (2,0) = 3 in a column!

      const state = e.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe('player1');
    });

    it('should detect player 2 win', () => {
      const e = new RowCallEngine();

      // Turn 1: Player1 selects row 0. Player2 places player1's dot at (0,3)
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 3);

      // Turn 2: Player2 selects row 1. Player1 places player2's dot at (1,0)
      e.selectLine({ type: 'row', index: 1 });
      e.placePiece(1, 0);

      // Turn 3: Player1 selects row 2. Player2 places player1's dot at (2,3)
      e.selectLine({ type: 'row', index: 2 });
      e.placePiece(2, 3);

      // Turn 4: Player2 selects row 1. Player1 places player2's dot at (1,1)
      e.selectLine({ type: 'row', index: 1 });
      e.placePiece(1, 1);

      // Turn 5: Player1 selects row 3. Player2 places player1's dot at (3,3)
      e.selectLine({ type: 'row', index: 3 });
      e.placePiece(3, 3);

      // Turn 6: Player2 selects row 1. Player1 places player2's dot at (1,2)
      e.selectLine({ type: 'row', index: 1 });
      e.placePiece(1, 2); // player2 now has (1,0), (1,1), (1,2) = 3 in a row!

      const state = e.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe('player2');
    });

    it('should not detect 3 in a row diagonally', () => {
      const e = new RowCallEngine();

      // Place player1 dots diagonally: (0,0), (1,1), (2,2)
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 0); // p1 at (0,0)

      e.selectLine({ type: 'row', index: 3 });
      e.placePiece(3, 0); // p2 at (3,0)

      e.selectLine({ type: 'row', index: 1 });
      e.placePiece(1, 1); // p1 at (1,1)

      e.selectLine({ type: 'row', index: 3 });
      e.placePiece(3, 1); // p2 at (3,1)

      e.selectLine({ type: 'row', index: 2 });
      e.placePiece(2, 2); // p1 at (2,2) - diagonal but NOT a win

      const state = e.getState();
      expect(state.status).toBe('playing');
    });

    it('should detect draw when board is full with no winner', () => {
      const e = new RowCallEngine();

      // Fill the board in a pattern that avoids 3 in a row for either player
      // This is a checkerboard-like pattern:
      // Row 0: P1 P2 P1 P2
      // Row 1: P2 P1 P2 P1
      // Row 2: P1 P2 P1 P2
      // Row 3: P2 P1 P2 P1
      const moves: Array<{
        lineType: 'row' | 'column';
        lineIndex: number;
        placeRow: number;
        placeCol: number;
      }> = [];

      // We need to carefully construct 16 moves (each turn = selectLine + placePiece)
      // Player alternates: P1, P2, P1, P2, ...
      // Desired board: checkerboard so no 3 in a row

      // For a 4x4 checkerboard: (row+col)%2==0 → P1, (row+col)%2==1 → P2
      // P1 cells: (0,0),(0,2),(1,1),(1,3),(2,0),(2,2),(3,1),(3,3) = 8 cells
      // P2 cells: (0,1),(0,3),(1,0),(1,2),(2,1),(2,3),(3,0),(3,2) = 8 cells
      // Each player gets exactly 8 dots. With alternating turns, this works.

      // Let's sequence the moves carefully:
      // Turn 1: P1 active → selects row 0 → opponent places P1 at (0,0)
      // Turn 2: P2 active → selects row 0 → opponent places P2 at (0,1)
      // Turn 3: P1 active → selects row 0 → opponent places P1 at (0,2)
      // Turn 4: P2 active → selects row 0 → opponent places P2 at (0,3)
      // Turn 5: P1 active → selects row 1 → opponent places P1 at (1,1)
      // Turn 6: P2 active → selects row 1 → opponent places P2 at (1,0)
      // Turn 7: P1 active → selects row 1 → opponent places P1 at (1,3)
      // Turn 8: P2 active → selects row 1 → opponent places P2 at (1,2)
      // Turn 9: P1 active → selects row 2 → opponent places P1 at (2,0)
      // Turn 10: P2 active → selects row 2 → opponent places P2 at (2,1)
      // Turn 11: P1 active → selects row 2 → opponent places P1 at (2,2)
      // Turn 12: P2 active → selects row 2 → opponent places P2 at (2,3)
      // Turn 13: P1 active → selects row 3 → opponent places P1 at (3,1)
      // Turn 14: P2 active → selects row 3 → opponent places P2 at (3,0)
      // Turn 15: P1 active → selects row 3 → opponent places P1 at (3,3)
      // Turn 16: P2 active → selects row 3 → opponent places P2 at (3,2)

      const sequence: Array<[number, number, number]> = [
        [0, 0, 0], [0, 0, 1], [0, 0, 2], [0, 0, 3],
        [1, 1, 1], [1, 1, 0], [1, 1, 3], [1, 1, 2],
        [2, 2, 0], [2, 2, 1], [2, 2, 2], [2, 2, 3],
        [3, 3, 1], [3, 3, 0], [3, 3, 3], [3, 3, 2],
      ];

      for (const [lineIdx, placeRow, placeCol] of sequence) {
        const state = e.getState();
        if (state.status !== 'playing') break;
        e.selectLine({ type: 'row', index: lineIdx });
        e.placePiece(placeRow, placeCol);
      }

      const state = e.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBeNull(); // draw
      expect(state.movesCount).toBe(16);
    });
  });

  describe('line validation', () => {
    it('should reject selecting a full row', () => {
      const e = new RowCallEngine();

      // Fill row 0 completely
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 0);
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 1);
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 2);
      e.selectLine({ type: 'row', index: 0 });
      e.placePiece(0, 3);

      // Now row 0 is full
      const success = e.selectLine({ type: 'row', index: 0 });
      expect(success).toBe(false);
    });

    it('should reject selecting a full column', () => {
      const e = new RowCallEngine();

      // Fill column 0 completely
      e.selectLine({ type: 'column', index: 0 });
      e.placePiece(0, 0);
      e.selectLine({ type: 'column', index: 0 });
      e.placePiece(1, 0);
      e.selectLine({ type: 'column', index: 0 });
      e.placePiece(2, 0);

      // Check if game ended (player1 or player2 might have 3 in a row)
      const state = e.getState();
      if (state.status === 'playing') {
        e.selectLine({ type: 'column', index: 0 });
        e.placePiece(3, 0);

        const newState = e.getState();
        if (newState.status === 'playing') {
          const success = e.selectLine({ type: 'column', index: 0 });
          expect(success).toBe(false);
        }
      }
    });
  });

  describe('getValidPlacements', () => {
    it('should return empty cells in the selected line', () => {
      engine.selectLine({ type: 'row', index: 0 });

      const placements = engine.getValidPlacements();
      expect(placements).toHaveLength(4);
      expect(placements).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
    });

    it('should exclude occupied cells', () => {
      engine.selectLine({ type: 'row', index: 0 });
      engine.placePiece(0, 0);

      engine.selectLine({ type: 'row', index: 0 });
      const placements = engine.getValidPlacements();
      expect(placements).toHaveLength(3);
      expect(placements).toEqual([
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ]);
    });

    it('should return empty when not in place-piece phase', () => {
      const placements = engine.getValidPlacements();
      expect(placements).toHaveLength(0);
    });
  });

  describe('getSelectableLines', () => {
    it('should return all rows and columns when board is empty', () => {
      const lines = engine.getSelectableLines();
      expect(lines).toHaveLength(8); // 4 rows + 4 columns
    });

    it('should return empty when not in choose-line phase', () => {
      engine.selectLine({ type: 'row', index: 0 });
      const lines = engine.getSelectableLines();
      expect(lines).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset the game to initial state', () => {
      engine.selectLine({ type: 'row', index: 0 });
      engine.placePiece(0, 0);

      engine.reset();

      const state = engine.getState();
      expect(state.activePlayer).toBe('player1');
      expect(state.turnPhase).toBe('choose-line');
      expect(state.status).toBe('playing');
      expect(state.winner).toBeNull();
      expect(state.selectedLine).toBeNull();
      expect(state.movesCount).toBe(0);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          expect(state.board[row][col].owner).toBeNull();
        }
      }
    });
  });

  describe('game state immutability', () => {
    it('should return a deep copy of the state', () => {
      const state1 = engine.getState();
      state1.board[0][0].owner = 'player1';

      const state2 = engine.getState();
      expect(state2.board[0][0].owner).toBeNull();
    });
  });
});
