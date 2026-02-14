import type { GameState, Cell, PieceColor } from './types';

export class OrderAndChaosEngine {
  private state: GameState;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    // Create a 6x6 grid
    const board: Cell[][] = [];
    for (let row = 0; row < 6; row++) {
      board[row] = [];
      for (let col = 0; col < 6; col++) {
        board[row][col] = {
          row,
          col,
          color: null,
        };
      }
    }

    return {
      board,
      currentPlayer: 'order',
      status: 'playing',
      winner: null,
      movesCount: 0,
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      board: this.state.board.map((row) => row.map((cell) => ({ ...cell }))),
    };
  }

  isValidMove(row: number, col: number): boolean {
    if (this.state.status !== 'playing') return false;
    if (row < 0 || row >= 6 || col < 0 || col >= 6) return false;
    return this.state.board[row][col].color === null;
  }

  makeMove(row: number, col: number, color: PieceColor): boolean {
    if (!this.isValidMove(row, col)) return false;

    // Place the piece
    this.state.board[row][col].color = color;
    this.state.movesCount++;

    // Check for win condition (five in a row)
    if (this.checkForFiveInARow()) {
      this.state.status = 'ended';
      this.state.winner = 'order';
      return true;
    }

    // Check if board is full (Chaos wins)
    if (this.state.movesCount >= 36) {
      this.state.status = 'ended';
      this.state.winner = 'chaos';
      return true;
    }

    // Switch players
    this.state.currentPlayer =
      this.state.currentPlayer === 'order' ? 'chaos' : 'order';

    return true;
  }

  private checkForFiveInARow(): boolean {
    const colors: PieceColor[] = ['cherry-blossom', 'dusty-mauve'];

    for (const color of colors) {
      // Check horizontal
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col <= 1; col++) {
          if (this.checkLine(row, col, 0, 1, color, 5)) return true;
        }
      }

      // Check vertical
      for (let col = 0; col < 6; col++) {
        for (let row = 0; row <= 1; row++) {
          if (this.checkLine(row, col, 1, 0, color, 5)) return true;
        }
      }

      // Check diagonal (top-left to bottom-right)
      for (let row = 0; row <= 1; row++) {
        for (let col = 0; col <= 1; col++) {
          if (this.checkLine(row, col, 1, 1, color, 5)) return true;
        }
      }

      // Check diagonal (top-right to bottom-left)
      for (let row = 0; row <= 1; row++) {
        for (let col = 4; col < 6; col++) {
          if (this.checkLine(row, col, 1, -1, color, 5)) return true;
        }
      }
    }

    return false;
  }

  private checkLine(
    startRow: number,
    startCol: number,
    rowDelta: number,
    colDelta: number,
    color: PieceColor,
    length: number
  ): boolean {
    for (let i = 0; i < length; i++) {
      const row = startRow + i * rowDelta;
      const col = startCol + i * colDelta;

      if (row < 0 || row >= 6 || col < 0 || col >= 6) return false;
      if (this.state.board[row][col].color !== color) return false;
    }
    return true;
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
