import type { GameState, Cell, Player, LineSelection, TurnPhase } from './types';

export class RowCallEngine {
  private state: GameState;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    const board: Cell[][] = [];
    for (let row = 0; row < 4; row++) {
      board[row] = [];
      for (let col = 0; col < 4; col++) {
        board[row][col] = { row, col, owner: null };
      }
    }

    return {
      board,
      activePlayer: 'player1',
      turnPhase: 'choose-line',
      status: 'playing',
      winner: null,
      selectedLine: null,
      movesCount: 0,
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      board: this.state.board.map((row) => row.map((cell) => ({ ...cell }))),
      selectedLine: this.state.selectedLine
        ? { ...this.state.selectedLine }
        : null,
    };
  }

  /**
   * Returns which player is currently acting (making a choice).
   * - In 'choose-line' phase, the active player picks a row/column.
   * - In 'place-piece' phase, the opponent places the active player's dot.
   */
  getActingPlayer(): Player {
    if (this.state.turnPhase === 'choose-line') {
      return this.state.activePlayer;
    }
    // In place-piece phase, the opponent is acting
    return this.state.activePlayer === 'player1' ? 'player2' : 'player1';
  }

  /**
   * Phase 1: The active player selects a row or column.
   * Returns true if the selection is valid (the line has at least one empty cell).
   */
  selectLine(selection: LineSelection): boolean {
    if (this.state.status !== 'playing') return false;
    if (this.state.turnPhase !== 'choose-line') return false;
    if (selection.index < 0 || selection.index > 3) return false;

    // Check the line has at least one empty cell
    if (!this.lineHasEmptyCell(selection)) return false;

    this.state.selectedLine = { ...selection };
    this.state.turnPhase = 'place-piece';
    return true;
  }

  /**
   * Phase 2: The opponent places the active player's dot in the selected line.
   * Returns true if the placement is valid.
   */
  placePiece(row: number, col: number): boolean {
    if (this.state.status !== 'playing') return false;
    if (this.state.turnPhase !== 'place-piece') return false;
    if (!this.state.selectedLine) return false;

    // Validate the cell is within the selected line
    if (!this.isCellInSelectedLine(row, col)) return false;

    // Validate the cell is empty
    if (row < 0 || row > 3 || col < 0 || col > 3) return false;
    if (this.state.board[row][col].owner !== null) return false;

    // Place the piece for the active player
    this.state.board[row][col].owner = this.state.activePlayer;
    this.state.movesCount++;

    // Check for win
    if (this.checkWin(this.state.activePlayer)) {
      this.state.status = 'ended';
      this.state.winner = this.state.activePlayer;
      return true;
    }

    // Check for draw (board full)
    if (this.state.movesCount >= 16) {
      this.state.status = 'ended';
      this.state.winner = null;
      return true;
    }

    // Switch to next player's turn
    this.state.activePlayer =
      this.state.activePlayer === 'player1' ? 'player2' : 'player1';
    this.state.turnPhase = 'choose-line';
    this.state.selectedLine = null;

    return true;
  }

  /**
   * Check if a cell is within the currently selected line.
   */
  private isCellInSelectedLine(row: number, col: number): boolean {
    if (!this.state.selectedLine) return false;
    const { type, index } = this.state.selectedLine;
    if (type === 'row') return row === index;
    return col === index;
  }

  /**
   * Check if a line has at least one empty cell.
   */
  private lineHasEmptyCell(selection: LineSelection): boolean {
    const { type, index } = selection;
    for (let i = 0; i < 4; i++) {
      const row = type === 'row' ? index : i;
      const col = type === 'row' ? i : index;
      if (this.state.board[row][col].owner === null) return true;
    }
    return false;
  }

  /**
   * Check if a player has 3 in a row (horizontally or vertically).
   */
  private checkWin(player: Player): boolean {
    // Check horizontal lines of 3
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col <= 1; col++) {
        if (
          this.state.board[row][col].owner === player &&
          this.state.board[row][col + 1].owner === player &&
          this.state.board[row][col + 2].owner === player
        ) {
          return true;
        }
      }
    }

    // Check vertical lines of 3
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row <= 1; row++) {
        if (
          this.state.board[row][col].owner === player &&
          this.state.board[row + 1][col].owner === player &&
          this.state.board[row + 2][col].owner === player
        ) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Get the valid cells where a piece can be placed in the current line selection.
   */
  getValidPlacements(): Array<{ row: number; col: number }> {
    if (!this.state.selectedLine || this.state.turnPhase !== 'place-piece') {
      return [];
    }
    const { type, index } = this.state.selectedLine;
    const placements: Array<{ row: number; col: number }> = [];
    for (let i = 0; i < 4; i++) {
      const row = type === 'row' ? index : i;
      const col = type === 'row' ? i : index;
      if (this.state.board[row][col].owner === null) {
        placements.push({ row, col });
      }
    }
    return placements;
  }

  /**
   * Get the lines (rows or columns) that can be selected (have at least one empty cell).
   */
  getSelectableLines(): LineSelection[] {
    if (this.state.turnPhase !== 'choose-line') return [];
    const lines: LineSelection[] = [];
    for (let i = 0; i < 4; i++) {
      if (this.lineHasEmptyCell({ type: 'row', index: i })) {
        lines.push({ type: 'row', index: i });
      }
      if (this.lineHasEmptyCell({ type: 'column', index: i })) {
        lines.push({ type: 'column', index: i });
      }
    }
    return lines;
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
