export type Player = 1 | 2;
export type GameStatus = 'setup' | 'playing' | 'ended';

/**
 * A line segment between two adjacent dots.
 * orientation: 'h' for horizontal (connects (row,col)→(row,col+1))
 *              'v' for vertical   (connects (row,col)→(row+1,col))
 */
export interface Line {
  row: number;
  col: number;
  orientation: 'h' | 'v';
  owner: Player;
}

/**
 * A box is the cell at grid position (row, col),
 * bounded by the four lines around it.
 */
export interface Box {
  row: number;
  col: number;
  owner: Player | null;
}

export interface GameState {
  /** Number of dots per row/column (grid is rows×cols dots, (rows-1)×(cols-1) boxes) */
  gridSize: number;
  lines: Line[];
  boxes: Box[];
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | 'draw' | null;
  player1Score: number;
  player2Score: number;
  /** Total number of boxes on the board */
  totalBoxes: number;
}
