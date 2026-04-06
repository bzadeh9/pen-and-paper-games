import type { GameState, Player } from './types';
import { getValidSegmentStarts } from './segments';

/** Default row configuration: 1, 3, 5, 7 (classic Nim) */
export const DEFAULT_ROWS = [1, 3, 5, 7];

export class NimEngine {
  private state: GameState;
  private initialRows: number[];

  constructor(rows: number[] = DEFAULT_ROWS) {
    this.initialRows = [...rows];
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    const rows = [...this.initialRows];
    const rowStates = rows.map((count) => Array.from({ length: count }, () => true));
    return {
      rows,
      rowStates,
      currentPlayer: 1,
      status: 'playing',
      loser: null,
      winner: null,
      totalRemaining: rows.reduce((sum, r) => sum + r, 0),
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      rows: [...this.state.rows],
      rowStates: this.state.rowStates.map((row) => [...row]),
    };
  }

  private getValidSegmentStarts(rowIndex: number, count: number): number[] {
    return getValidSegmentStarts(this.state.rowStates[rowIndex], count);
  }

  /**
   * Validate whether a move is legal.
   * @param rowIndex - The row to remove items from
   * @param count - The number of items to remove
   * @param startIndex - Optional start index for contiguous segment selection
   */
  isValidMove(rowIndex: number, count: number, startIndex?: number): boolean {
    if (this.state.status !== 'playing') return false;
    if (rowIndex < 0 || rowIndex >= this.state.rows.length) return false;
    if (!Number.isInteger(count) || count < 1) return false;
    if (count > this.state.rows[rowIndex]) return false;

    const starts = this.getValidSegmentStarts(rowIndex, count);
    if (starts.length === 0) return false;

    if (startIndex === undefined) return true;
    if (!Number.isInteger(startIndex)) return false;
    return starts.includes(startIndex);
  }

  /**
   * Remove items from a row. Returns true if the move was made.
   * The player forced to take the last item loses (misère variant).
   * @param rowIndex - The row to remove items from
   * @param count - The number of items to remove
   * @param startIndex - Optional start index for contiguous segment selection
   */
  makeMove(rowIndex: number, count: number, startIndex?: number): boolean {
    if (!this.isValidMove(rowIndex, count, startIndex)) return false;

    const player = this.state.currentPlayer;
    const segmentStart =
      startIndex ?? this.getValidSegmentStarts(rowIndex, count)[0];

    for (let i = segmentStart; i < segmentStart + count; i += 1) {
      this.state.rowStates[rowIndex][i] = false;
    }
    this.state.rows[rowIndex] -= count;
    this.state.totalRemaining -= count;

    // Check if this player took the last item(s) — they lose
    if (this.state.totalRemaining === 0) {
      this.state.status = 'ended';
      this.state.loser = player;
      this.state.winner = player === 1 ? 2 : 1;
    } else {
      // Switch player
      this.state.currentPlayer = player === 1 ? 2 : 1;
    }

    return true;
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
