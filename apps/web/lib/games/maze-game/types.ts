export type Position = { row: number; col: number };

export type Player = 1 | 2;

export type GameStatus = 'playing' | 'ended';

export type Direction = 'north' | 'south' | 'east' | 'west';

/**
 * A gate is a locked passage between two adjacent rooms that requires
 * cooperation to cross.
 *
 * - keyA is a room on side A. When a player stands on keyA, the other
 *   player can cross the gate in either direction.
 * - keyB is a room on side B. When a player stands on keyB, the other
 *   player can cross the gate in either direction.
 */
export interface Gate {
  id: number;
  /** Room on side A of the gate (the cell you step from when crossing A→B). */
  roomA: Position;
  /** Room on side B of the gate (the cell you step from when crossing B→A). */
  roomB: Position;
  /** Key cell on side A. When occupied, the other player can cross. */
  keyA: Position;
  /** Key cell on side B. When occupied, the other player can cross. */
  keyB: Position;
}

/**
 * Passages[row][col] describes which of a room's 4 sides have open passages
 * (i.e., the wall on that side has been removed and the player can walk through).
 */
export interface RoomPassages {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface MazeGameState {
  /** Number of rows of rooms in the maze. */
  rows: number;
  /** Number of columns of rooms in the maze. */
  cols: number;
  /**
   * passages[row][col] — which directions have open passages from room (row,col).
   * These represent normal (unlocked) maze connections.
   */
  passages: RoomPassages[][];
  /** Cooperative gates in the maze. */
  gates: Gate[];
  /** Decoy keys that look like real keys but don't open any gate. */
  decoyKeys: Position[];
  startPos: Position;
  endPos: Position;
  /** Both players move simultaneously — no turn order. */
  players: Record<Player, Position>;
  status: GameStatus;
  /** Which players have reached the end tile. Win when both are listed. */
  reachedEnd: Player[];
  moveHistory: { player: Player; from: Position; to: Position }[];
}
