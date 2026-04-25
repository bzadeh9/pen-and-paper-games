export type Player = 1 | 2;
export type GameStatus = 'playing' | 'ended';
export type Hand = 'left' | 'right';

export interface HandState {
  /** Number of fingers (0 = dead, 1–4 = alive) */
  left: number;
  right: number;
}

export interface GameState {
  /** Index 0 = player 1, index 1 = player 2 */
  hands: [HandState, HandState];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
}
