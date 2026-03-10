import type { GameState, Line, Box, Player } from './types';

export const MIN_GRID_SIZE = 3;
export const MAX_GRID_SIZE = 8;
export const DEFAULT_GRID_SIZE = 4;

export class FencesEngine {
  private state: GameState;

  constructor(gridSize: number = DEFAULT_GRID_SIZE) {
    this.state = this.createInitialState(gridSize);
  }

  private createInitialState(gridSize: number): GameState {
    const validatedSize = Math.max(
      MIN_GRID_SIZE,
      Math.min(MAX_GRID_SIZE, gridSize)
    );
    const boxRows = validatedSize - 1;
    const boxCols = validatedSize - 1;

    const boxes: Box[] = [];
    for (let row = 0; row < boxRows; row++) {
      for (let col = 0; col < boxCols; col++) {
        boxes.push({ row, col, owner: null });
      }
    }

    return {
      gridSize: validatedSize,
      lines: [],
      boxes,
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      player1Score: 0,
      player2Score: 0,
      totalBoxes: boxRows * boxCols,
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      lines: this.state.lines.map((l) => ({ ...l })),
      boxes: this.state.boxes.map((b) => ({ ...b })),
    };
  }

  startGame(): void {
    this.state.status = 'playing';
  }

  /**
   * Returns the key string for a line to enable quick lookups.
   */
  private lineKey(
    row: number,
    col: number,
    orientation: 'h' | 'v'
  ): string {
    return `${orientation}-${row}-${col}`;
  }

  /**
   * Check whether a line position is valid on the grid.
   * Horizontal lines: row ∈ [0, gridSize-1], col ∈ [0, gridSize-2]
   * Vertical lines:   row ∈ [0, gridSize-2], col ∈ [0, gridSize-1]
   */
  private isValidLinePosition(
    row: number,
    col: number,
    orientation: 'h' | 'v'
  ): boolean {
    const g = this.state.gridSize;
    if (orientation === 'h') {
      return row >= 0 && row < g && col >= 0 && col < g - 1;
    }
    return row >= 0 && row < g - 1 && col >= 0 && col < g;
  }

  /**
   * Check whether a line has already been placed at this position.
   */
  hasLine(row: number, col: number, orientation: 'h' | 'v'): boolean {
    const key = this.lineKey(row, col, orientation);
    return this.state.lines.some(
      (l) => this.lineKey(l.row, l.col, l.orientation) === key
    );
  }

  /**
   * Validate whether a move is legal.
   */
  isValidMove(
    row: number,
    col: number,
    orientation: 'h' | 'v'
  ): boolean {
    if (this.state.status !== 'playing') return false;
    if (!this.isValidLinePosition(row, col, orientation)) return false;
    return !this.hasLine(row, col, orientation);
  }

  /**
   * Place a line on the board. Returns true if the move was made.
   * When a player completes one or more boxes, they earn points and get another turn.
   */
  makeMove(
    row: number,
    col: number,
    orientation: 'h' | 'v'
  ): boolean {
    // Auto-start the game if in setup
    if (this.state.status === 'setup') {
      this.startGame();
    }

    if (!this.isValidMove(row, col, orientation)) {
      return false;
    }

    const player = this.state.currentPlayer;

    // Place the line
    this.state.lines.push({ row, col, orientation, owner: player });

    // Check which boxes are completed by this move
    const completedBoxes = this.getCompletedBoxes(row, col, orientation);

    if (completedBoxes.length > 0) {
      // Claim the completed boxes
      for (const box of completedBoxes) {
        const boxObj = this.state.boxes.find(
          (b) => b.row === box.row && b.col === box.col
        );
        if (boxObj && boxObj.owner === null) {
          boxObj.owner = player;
          if (player === 1) {
            this.state.player1Score++;
          } else {
            this.state.player2Score++;
          }
        }
      }
      // Player gets another turn (don't switch)
    } else {
      // No box completed, switch player
      this.state.currentPlayer = player === 1 ? 2 : 1;
    }

    // Check if game is over (all boxes claimed)
    if (this.state.player1Score + this.state.player2Score === this.state.totalBoxes) {
      this.state.status = 'ended';
      if (this.state.player1Score > this.state.player2Score) {
        this.state.winner = 1;
      } else if (this.state.player2Score > this.state.player1Score) {
        this.state.winner = 2;
      } else {
        this.state.winner = 'draw';
      }
    }

    return true;
  }

  /**
   * Given a newly placed line, determine which boxes (if any) it completes.
   * A horizontal line at (row, col) borders:
   *   - box (row-1, col) above (if row > 0)
   *   - box (row, col) below (if row < gridSize - 1)
   * A vertical line at (row, col) borders:
   *   - box (row, col-1) to the left (if col > 0)
   *   - box (row, col) to the right (if col < gridSize - 1)
   */
  private getCompletedBoxes(
    row: number,
    col: number,
    orientation: 'h' | 'v'
  ): { row: number; col: number }[] {
    const completed: { row: number; col: number }[] = [];
    const g = this.state.gridSize;

    if (orientation === 'h') {
      // Check box above (row-1, col)
      if (row > 0 && this.isBoxComplete(row - 1, col)) {
        const box = this.state.boxes.find(
          (b) => b.row === row - 1 && b.col === col
        );
        if (box && box.owner === null) {
          completed.push({ row: row - 1, col });
        }
      }
      // Check box below (row, col)
      if (row < g - 1 && this.isBoxComplete(row, col)) {
        const box = this.state.boxes.find(
          (b) => b.row === row && b.col === col
        );
        if (box && box.owner === null) {
          completed.push({ row, col });
        }
      }
    } else {
      // Check box to the left (row, col-1)
      if (col > 0 && this.isBoxComplete(row, col - 1)) {
        const box = this.state.boxes.find(
          (b) => b.row === row && b.col === col - 1
        );
        if (box && box.owner === null) {
          completed.push({ row, col: col - 1 });
        }
      }
      // Check box to the right (row, col)
      if (col < g - 1 && this.isBoxComplete(row, col)) {
        const box = this.state.boxes.find(
          (b) => b.row === row && b.col === col
        );
        if (box && box.owner === null) {
          completed.push({ row, col });
        }
      }
    }

    return completed;
  }

  /**
   * Check whether all four sides of box (row, col) have lines.
   * A box at (row, col) has:
   *   top:    horizontal line at (row, col)
   *   bottom: horizontal line at (row+1, col)
   *   left:   vertical line at (row, col)
   *   right:  vertical line at (row, col+1)
   */
  private isBoxComplete(boxRow: number, boxCol: number): boolean {
    return (
      this.hasLine(boxRow, boxCol, 'h') && // top
      this.hasLine(boxRow + 1, boxCol, 'h') && // bottom
      this.hasLine(boxRow, boxCol, 'v') && // left
      this.hasLine(boxRow, boxCol + 1, 'v') // right
    );
  }

  /**
   * Get the number of sides completed for a given box.
   */
  getBoxSideCount(boxRow: number, boxCol: number): number {
    let count = 0;
    if (this.hasLine(boxRow, boxCol, 'h')) count++; // top
    if (this.hasLine(boxRow + 1, boxCol, 'h')) count++; // bottom
    if (this.hasLine(boxRow, boxCol, 'v')) count++; // left
    if (this.hasLine(boxRow, boxCol + 1, 'v')) count++; // right
    return count;
  }

  setGridSize(gridSize: number): void {
    if (this.state.status === 'setup' || this.state.status === 'ended') {
      this.state = this.createInitialState(gridSize);
    }
  }

  reset(): void {
    const gridSize = this.state.gridSize;
    this.state = this.createInitialState(gridSize);
  }
}
