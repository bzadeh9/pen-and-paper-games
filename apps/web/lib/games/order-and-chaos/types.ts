export type Player = 'order' | 'chaos';
export type PieceColor = 'cherry-blossom' | 'dusty-mauve';
export type PieceSymbol = 'X' | 'O';
export type GameStatus = 'setup' | 'playing' | 'ended';
export type DisplayMode = 'color' | 'symbol';

export interface Cell {
  row: number;
  col: number;
  color: PieceColor | null;
}

export interface GameState {
  board: Cell[][];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  movesCount: number;
  displayMode: DisplayMode;
}
