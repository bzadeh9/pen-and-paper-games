export type Player = 1 | 2;

export type GameStatus = 'hiding' | 'transition' | 'seeking' | 'ended';

export const GRID_SIZE = 6;
export const GEMS_TO_HIDE = 4;

export interface Position {
  row: number;
  col: number;
}

export interface Guess {
  positions: Position[];
  correct: number;
}

export interface GameState {
  gridSize: number;
  status: GameStatus;
  /** Positions of hidden gems (only visible to the hider and after game ends) */
  hiddenGems: Position[];
  /** Currently selected cells by the seeker */
  currentSelection: Position[];
  /** History of all guesses made by the seeker */
  guesses: Guess[];
  winner: Player | null;
  /** Player who is hiding (Abbee by default) */
  hider: Player;
  /** Player who is seeking (Dot by default) */
  seeker: Player;
}
