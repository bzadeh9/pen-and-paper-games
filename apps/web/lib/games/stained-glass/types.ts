export type Player = 1 | 2;
export type GameStatus = 'setup' | 'playing' | 'ended';
export type GameMode = 'standard' | 'reverse';

export interface Section {
  id: number;
  owner: Player | null;
  neighbors: number[]; // IDs of sections sharing a side
}

export interface GameState {
  sections: Section[];
  currentPlayer: Player;
  status: GameStatus;
  mode: GameMode;
  winner: Player | null;
  player1Score: number;
  player2Score: number;
}
