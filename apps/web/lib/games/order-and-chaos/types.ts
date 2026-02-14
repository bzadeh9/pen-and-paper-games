export type Player = 'order' | 'chaos';
export type PieceColor = 'cherry-blossom' | 'dusty-mauve';
export type GameStatus = 'playing' | 'ended';

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
}
