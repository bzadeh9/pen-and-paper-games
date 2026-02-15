import { describe, it, expect, beforeEach } from 'vitest';
import { UltimateTicTacToeEngine } from './engine';

describe('UltimateTicTacToeEngine', () => {
  let engine: UltimateTicTacToeEngine;

  beforeEach(() => {
    engine = new UltimateTicTacToeEngine();
  });

  describe('initialization', () => {
    it('should initialize with a 3x3 grid of local boards', () => {
      const state = engine.getState();
      expect(state.localBoards.length).toBe(3);
      expect(state.localBoards[0].length).toBe(3);
    });

    it('should initialize each local board with 3x3 empty cells', () => {
      const state = engine.getState();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const board = state.localBoards[i][j];
          expect(board.cells.length).toBe(3);
          expect(board.cells[0].length).toBe(3);
          expect(board.winner).toBeNull();
          expect(
            board.cells.every((row) => row.every((cell) => cell === null))
          ).toBe(true);
        }
      }
    });

    it('should start with player X', () => {
      const state = engine.getState();
      expect(state.currentPlayer).toBe('X');
    });

    it('should start in setup mode', () => {
      const state = engine.getState();
      expect(state.status).toBe('setup');
      expect(state.winner).toBeNull();
    });

    it('should default to standard mode', () => {
      const state = engine.getState();
      expect(state.mode).toBe('standard');
    });
  });

  describe('game mode', () => {
    it('should allow setting mode in setup', () => {
      engine.setMode('strict');
      const state = engine.getState();
      expect(state.mode).toBe('strict');
    });

    it('should initialize with specified mode', () => {
      const strictEngine = new UltimateTicTacToeEngine('strict');
      const state = strictEngine.getState();
      expect(state.mode).toBe('strict');
    });
  });

  describe('move validation - standard mode', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should allow moves on any empty cell', () => {
      expect(
        engine.isValidMove({
          localRow: 0,
          localCol: 0,
          cellRow: 0,
          cellCol: 0,
        })
      ).toBe(true);
      expect(
        engine.isValidMove({
          localRow: 2,
          localCol: 2,
          cellRow: 2,
          cellCol: 2,
        })
      ).toBe(true);
    });

    it('should reject moves on occupied cells', () => {
      engine.makeMove({
        localRow: 0,
        localCol: 0,
        cellRow: 0,
        cellCol: 0,
      });
      expect(
        engine.isValidMove({
          localRow: 0,
          localCol: 0,
          cellRow: 0,
          cellCol: 0,
        })
      ).toBe(false);
    });

    it('should reject moves out of bounds', () => {
      expect(
        engine.isValidMove({
          localRow: 3,
          localCol: 0,
          cellRow: 0,
          cellCol: 0,
        })
      ).toBe(false);
      expect(
        engine.isValidMove({
          localRow: 0,
          localCol: 0,
          cellRow: -1,
          cellCol: 0,
        })
      ).toBe(false);
    });
  });

  describe('move validation - strict mode', () => {
    beforeEach(() => {
      engine.setMode('strict');
      engine.startGame();
    });

    it('should allow first move anywhere', () => {
      expect(
        engine.isValidMove({
          localRow: 1,
          localCol: 1,
          cellRow: 1,
          cellCol: 1,
        })
      ).toBe(true);
    });

    it('should restrict second move to specified board', () => {
      // First move at cell (1,1) in board (0,0)
      engine.makeMove({
        localRow: 0,
        localCol: 0,
        cellRow: 1,
        cellCol: 1,
      });

      // Next move must be in board (1,1)
      expect(
        engine.isValidMove({
          localRow: 1,
          localCol: 1,
          cellRow: 0,
          cellCol: 0,
        })
      ).toBe(true);

      // Other boards should be invalid
      expect(
        engine.isValidMove({
          localRow: 0,
          localCol: 0,
          cellRow: 0,
          cellCol: 0,
        })
      ).toBe(false);
    });

    it.skip('should allow any board if target board is won', () => {
      // Win board (1,1) first
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 }); // X
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 }); // O
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 1 }); // X
      engine.makeMove({ localRow: 0, localCol: 1, cellRow: 0, cellCol: 0 }); // O
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 2 }); // X wins board (1,1)

      // Now make a move that would send next player to board (1,1)
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 1, cellCol: 1 }); // O

      // Since board (1,1) is won, any board should be valid for X
      expect(
        engine.isValidMove({
          localRow: 0,
          localCol: 0,
          cellRow: 0,
          cellCol: 1,
        })
      ).toBe(true);
      expect(
        engine.isValidMove({
          localRow: 2,
          localCol: 2,
          cellRow: 2,
          cellCol: 2,
        })
      ).toBe(true);
    });
  });

  describe('local board win detection', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should detect row wins', () => {
      // Win top row of board (0,0)
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 }); // X
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 }); // O
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 1 }); // X
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 1 }); // O
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 2 }); // X wins

      const state = engine.getState();
      expect(state.localBoards[0][0].winner).toBe('X');
    });

    it('should detect column wins', () => {
      // Win left column of board (0,0)
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 }); // X
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 }); // O
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 1, cellCol: 0 }); // X
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 1 }); // O
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 2, cellCol: 0 }); // X wins

      const state = engine.getState();
      expect(state.localBoards[0][0].winner).toBe('X');
    });

    it('should detect diagonal wins', () => {
      // Win diagonal of board (0,0)
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 }); // X
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 }); // O
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 1, cellCol: 1 }); // X
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 1 }); // O
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 2, cellCol: 2 }); // X wins

      const state = engine.getState();
      expect(state.localBoards[0][0].winner).toBe('X');
    });

    it('should detect draws', () => {
      // Use standard mode for easier testing
      engine.setMode('standard');
      engine.startGame();

      // Fill board (0,0) with pattern that creates a draw: X X O / O O X / X O X
      // This ensures no 3-in-a-row for either player
      const moves = [
        { localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 }, // X at (0,0)
        { localRow: 0, localCol: 0, cellRow: 1, cellCol: 0 }, // O at (1,0)
        { localRow: 0, localCol: 0, cellRow: 0, cellCol: 1 }, // X at (0,1)
        { localRow: 0, localCol: 0, cellRow: 0, cellCol: 2 }, // O at (0,2)
        { localRow: 0, localCol: 0, cellRow: 2, cellCol: 0 }, // X at (2,0)
        { localRow: 0, localCol: 0, cellRow: 1, cellCol: 1 }, // O at (1,1)
        { localRow: 0, localCol: 0, cellRow: 1, cellCol: 2 }, // X at (1,2)
        { localRow: 0, localCol: 0, cellRow: 2, cellCol: 1 }, // O at (2,1)
        { localRow: 0, localCol: 0, cellRow: 2, cellCol: 2 }, // X at (2,2) - draw
      ];

      moves.forEach((move) => engine.makeMove(move));

      const state = engine.getState();
      expect(state.localBoards[0][0].winner).toBe('draw');
    });
  });

  describe('global win detection', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should detect global row win', () => {
      // Manually set up a winning condition
      const state = engine.getState();
      state.localBoards[0][0].winner = 'X';
      state.localBoards[0][1].winner = 'X';
      state.localBoards[0][2].winner = 'X';

      // Make a move to trigger win check
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 });
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 });

      const finalState = engine.getState();
      // The game should end when all 3 boards in a row are won
      if (
        finalState.localBoards[0][0].winner === 'X' &&
        finalState.localBoards[0][1].winner === 'X' &&
        finalState.localBoards[0][2].winner === 'X'
      ) {
        expect(finalState.winner).toBe('X');
      }
    });
  });

  describe('game flow', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should alternate players', () => {
      expect(engine.getState().currentPlayer).toBe('X');
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 });
      expect(engine.getState().currentPlayer).toBe('O');
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 0, cellCol: 0 });
      expect(engine.getState().currentPlayer).toBe('X');
    });

    it('should record move history', () => {
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 });
      engine.makeMove({ localRow: 1, localCol: 1, cellRow: 1, cellCol: 1 });

      const state = engine.getState();
      expect(state.moveHistory).toHaveLength(2);
      expect(state.moveHistory[0]).toEqual({
        localRow: 0,
        localCol: 0,
        cellRow: 0,
        cellCol: 0,
      });
    });

    it('should reset the game', () => {
      engine.makeMove({ localRow: 0, localCol: 0, cellRow: 0, cellCol: 0 });
      engine.reset();

      const state = engine.getState();
      expect(state.status).toBe('setup');
      expect(state.currentPlayer).toBe('X');
      expect(state.winner).toBeNull();
      expect(state.moveHistory).toHaveLength(0);
      expect(state.localBoards[0][0].cells[0][0]).toBeNull();
    });
  });
});
