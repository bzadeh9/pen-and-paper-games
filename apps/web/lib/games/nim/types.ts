export type Player = 1 | 2;
export type GameStatus = 'playing' | 'ended';

export interface GameState {
  /** Array where each element represents the number of items remaining in that row */
  rows: number[];
  /** Per-row line states (true = active, false = crossed out) */
  rowStates: boolean[][];
  /** Current player (1 or 2) */
  currentPlayer: Player;
  /** Game status */
  status: GameStatus;
  /** The player who lost (took the last item) */
  loser: Player | null;
  /** The winning player */
  winner: Player | null;
  /** Total items remaining across all rows */
  totalRemaining: number;
}
