export type Player = 1 | 2;
export type GameStatus = 'setup' | 'playing' | 'ended';
export type GameMode = 'lowest' | 'highest';

export interface Circle {
  id: number;
  row: number;
  col: number;
  value: number | null;
  owner: Player | null;
}

export interface GameState {
  circles: Circle[];
  currentPlayer: Player;
  currentTurnNumber: number;
  player1Counter: number;
  player2Counter: number;
  status: GameStatus;
  mode: GameMode;
  blackHoleId: number | null;
  winner: Player | 'draw' | null;
  player1Score: number;
  player2Score: number;
}
