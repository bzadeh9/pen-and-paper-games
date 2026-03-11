export type Player = 1 | 2;
export type GameStatus = 'playing' | 'ended';

/**
 * An edge connects two hexagon vertices (0-5).
 * Vertices are always stored with the smaller index first (v1 < v2).
 */
export interface Edge {
  v1: number;
  v2: number;
  owner: Player;
}

/**
 * A triangle identified by three hexagon vertices.
 */
export interface Triangle {
  a: number;
  b: number;
  c: number;
}

export interface GameState {
  /** The 6 hexagon vertices are numbered 0-5 */
  vertices: number;
  /** Edges claimed so far */
  edges: Edge[];
  /** Current player (1 or 2) */
  currentPlayer: Player;
  /** Game status */
  status: GameStatus;
  /**
   * The player who lost (formed a triangle in their color).
   * The winner is the OTHER player.
   */
  loser: Player | null;
  /** The winning player (the player who did NOT form a triangle) */
  winner: Player | null;
  /** The triangle that caused the loss, if any */
  losingTriangle: Triangle | null;
  /** Total possible edges: C(6,2) = 15 */
  totalEdges: number;
}
