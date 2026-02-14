export type Player = 'X' | 'O';
export type CellState = Player | null;
export type LocalBoardState = 'X' | 'O' | 'draw' | null;
export type GameMode = 'standard' | 'strict';
export type GameStatus = 'setup' | 'playing' | 'ended';

export interface Position {
  localRow: number;
  localCol: number;
  cellRow: number;
  cellCol: number;
}

export interface LocalBoard {
  cells: CellState[][];
  winner: LocalBoardState;
}

export interface GameState {
  localBoards: LocalBoard[][];
  currentPlayer: Player;
  mode: GameMode;
  status: GameStatus;
  winner: Player | 'draw' | null;
  activeBoard: { row: number; col: number } | null; // For strict mode
  moveHistory: Position[];
}
