import type { GameState, Cell, PieceColor, DisplayMode } from './types';

export class OrderAndChaosEngine {
  private state: GameState;

  constructor(displayMode: DisplayMode = 'color') {
    this.state = this.createInitialState(displayMode);
  }

  private createInitialState(displayMode: DisplayMode): GameState {
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
      status: 'setup',
      winner: null,
      movesCount: 0,
      displayMode,
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      board: this.state.board.map((row) => row.map((cell) => ({ ...cell }))),
    };
  }

  startGame(): void {
    this.state.status = 'playing';
  }

  setDisplayMode(mode: DisplayMode): void {
    this.state.displayMode = mode;
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

    // Check if the game is unwinnable (Chaos wins early)
    if (this.isGameUnwinnable()) {
      this.state.status = 'ended';
      this.state.winner = 'chaos';
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
    const colors: PieceColor[] = ['powder-blush', 'periwinkle'];

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

  private isGameUnwinnable(): boolean {
    // Check if there's still any possible way to make a line of 5
    // This checks all possible lines of 5 to see if at least one is still achievable
    const colors: PieceColor[] = ['powder-blush', 'periwinkle'];

    for (const color of colors) {
      // Check horizontal
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col <= 1; col++) {
          if (this.canLineBeMade(row, col, 0, 1, color, 5)) return false;
        }
      }

      // Check vertical
      for (let col = 0; col < 6; col++) {
        for (let row = 0; row <= 1; row++) {
          if (this.canLineBeMade(row, col, 1, 0, color, 5)) return false;
        }
      }

      // Check diagonal (top-left to bottom-right)
      for (let row = 0; row <= 1; row++) {
        for (let col = 0; col <= 1; col++) {
          if (this.canLineBeMade(row, col, 1, 1, color, 5)) return false;
        }
      }

      // Check diagonal (top-right to bottom-left)
      for (let row = 0; row <= 1; row++) {
        for (let col = 4; col < 6; col++) {
          if (this.canLineBeMade(row, col, 1, -1, color, 5)) return false;
        }
      }
    }

    // No possible line of 5 can be made
    return true;
  }

  private canLineBeMade(
    startRow: number,
    startCol: number,
    rowDelta: number,
    colDelta: number,
    color: PieceColor,
    length: number
  ): boolean {
    // Check if a line can still be made (all cells are either empty or the required color)
    for (let i = 0; i < length; i++) {
      const row = startRow + i * rowDelta;
      const col = startCol + i * colDelta;

      if (row < 0 || row >= 6 || col < 0 || col >= 6) return false;

      const cellColor = this.state.board[row][col].color;
      // If the cell has the opposite color, this line can't be made
      if (cellColor !== null && cellColor !== color) return false;
    }
    return true;
  }

  reset(): void {
    this.state = this.createInitialState(this.state.displayMode);
  }
}
