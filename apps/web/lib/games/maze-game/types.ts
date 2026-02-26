export type Position = { row: number; col: number };

export type Player = 1 | 2;

export type GameStatus = 'playing' | 'ended';

export type Direction = 'north' | 'south' | 'east' | 'west';

/**
 * A bridge is a special passage between two rooms that requires
 * cooperation to cross.
 *
 * - LeverA is a room on side A of the bridge. When a player stands on
 *   leverA, the other player can cross the bridge from side A to side B.
 * - LeverB is a room on side B of the bridge. When a player stands on
 *   leverB, the other player can cross the bridge from side B to side A.
 */
export interface Bridge {
  id: number;
  /** Room on side A of the bridge passage (the cell you step from when crossing A→B). */
  roomA: Position;
  /** Room on side B of the bridge passage (the cell you step from when crossing B→A). */
  roomB: Position;
  /** Lever cell on side A. When occupied, the other player can cross A→B. */
  leverA: Position;
  /** Lever cell on side B. When occupied, the other player can cross B→A. */
  leverB: Position;
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
  /** Cooperative bridges in the maze. */
  bridges: Bridge[];
  startPos: Position;
  endPos: Position;
  /** Both players move simultaneously — no turn order. */
  players: Record<Player, Position>;
  status: GameStatus;
  /** Which players have reached the end tile. Win when both are listed. */
  reachedEnd: Player[];
  moveHistory: { player: Player; from: Position; to: Position }[];
}
