export type Player = 'player1' | 'player2';
export type GameStatus = 'playing' | 'ended';
export type TurnPhase = 'choose-line' | 'place-piece';
export type LineType = 'row' | 'column';

export interface LineSelection {
  type: LineType;
  index: number; // 0-3
}

export interface Cell {
  row: number;
  col: number;
  owner: Player | null;
}

export interface GameState {
  board: Cell[][];
  /** The player whose dot will be placed this turn. */
  activePlayer: Player;
  /** The phase of the current turn. */
  turnPhase: TurnPhase;
  status: GameStatus;
  winner: Player | null;
  /** The line (row or column) chosen in the 'choose-line' phase. */
  selectedLine: LineSelection | null;
  movesCount: number;
}
