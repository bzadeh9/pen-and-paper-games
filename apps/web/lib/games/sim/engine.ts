import type { GameState, Edge, Player, Triangle } from './types';

/** Number of hexagon vertices */
export const NUM_VERTICES = 6;

/** Total edges in a complete graph K6: C(6,2) = 15 */
export const TOTAL_EDGES = 15;

/**
 * All possible triangles (combinations of 3 vertices from 6).
 * Pre-computed for efficiency: C(6,3) = 20 triangles.
 */
const ALL_TRIANGLES: Triangle[] = [];
for (let a = 0; a < NUM_VERTICES; a++) {
  for (let b = a + 1; b < NUM_VERTICES; b++) {
    for (let c = b + 1; c < NUM_VERTICES; c++) {
      ALL_TRIANGLES.push({ a, b, c });
    }
  }
}

export class SimEngine {
  private state: GameState;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      vertices: NUM_VERTICES,
      edges: [],
      currentPlayer: 1,
      status: 'playing',
      loser: null,
      winner: null,
      losingTriangle: null,
      totalEdges: TOTAL_EDGES,
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      edges: this.state.edges.map((e) => ({ ...e })),
      losingTriangle: this.state.losingTriangle
        ? { ...this.state.losingTriangle }
        : null,
    };
  }

  /**
   * Normalize an edge so v1 < v2.
   */
  private normalizeEdge(a: number, b: number): { v1: number; v2: number } {
    return a < b ? { v1: a, v2: b } : { v1: b, v2: a };
  }

  /**
   * Create a string key for an edge (for quick lookups).
   */
  private edgeKey(v1: number, v2: number): string {
    const { v1: a, v2: b } = this.normalizeEdge(v1, v2);
    return `${a}-${b}`;
  }

  /**
   * Check if an edge has already been claimed.
   */
  hasEdge(v1: number, v2: number): boolean {
    const key = this.edgeKey(v1, v2);
    return this.state.edges.some(
      (e) => this.edgeKey(e.v1, e.v2) === key
    );
  }

  /**
   * Get the owner of an edge, or null if unclaimed.
   */
  getEdgeOwner(v1: number, v2: number): Player | null {
    const key = this.edgeKey(v1, v2);
    const edge = this.state.edges.find(
      (e) => this.edgeKey(e.v1, e.v2) === key
    );
    return edge?.owner ?? null;
  }

  /**
   * Validate whether a move is legal.
   */
  isValidMove(v1: number, v2: number): boolean {
    if (this.state.status !== 'playing') return false;
    if (v1 === v2) return false;
    if (v1 < 0 || v1 >= NUM_VERTICES || v2 < 0 || v2 >= NUM_VERTICES) return false;
    return !this.hasEdge(v1, v2);
  }

  /**
   * Place an edge between two vertices. Returns true if the move was made.
   * After placing, checks if the current player formed a triangle (and loses).
   */
  makeMove(v1: number, v2: number): boolean {
    if (!this.isValidMove(v1, v2)) return false;

    const player = this.state.currentPlayer;
    const { v1: nv1, v2: nv2 } = this.normalizeEdge(v1, v2);

    this.state.edges.push({ v1: nv1, v2: nv2, owner: player });

    // Check if this move formed a monochromatic triangle for the current player
    const losingTriangle = this.findMonochromaticTriangle(player);

    if (losingTriangle) {
      this.state.status = 'ended';
      this.state.loser = player;
      this.state.winner = player === 1 ? 2 : 1;
      this.state.losingTriangle = losingTriangle;
    } else {
      // Switch player
      this.state.currentPlayer = player === 1 ? 2 : 1;
    }

    return true;
  }

  /**
   * Find a monochromatic triangle for the given player.
   * Returns the first triangle found, or null if none exists.
   */
  private findMonochromaticTriangle(player: Player): Triangle | null {
    // Build a set of edges owned by this player for fast lookup
    const playerEdges = new Set<string>();
    for (const e of this.state.edges) {
      if (e.owner === player) {
        playerEdges.add(this.edgeKey(e.v1, e.v2));
      }
    }

    for (const tri of ALL_TRIANGLES) {
      if (
        playerEdges.has(this.edgeKey(tri.a, tri.b)) &&
        playerEdges.has(this.edgeKey(tri.a, tri.c)) &&
        playerEdges.has(this.edgeKey(tri.b, tri.c))
      ) {
        return tri;
      }
    }

    return null;
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
