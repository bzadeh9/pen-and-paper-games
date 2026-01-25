export type Position = { row: number; col: number };
export type Player = 1 | 2;
export type GameStatus = 'setup' | 'playing' | 'ended';

// Grid size constraints to prevent impractical grids and ensure playability
export const MIN_GRID_SIZE = 3;
export const MAX_GRID_SIZE = 10;

export interface GameState {
  gridSize: number;
  visitedDots: Set<string>;
  pathEnds: [Position, Position] | null; // The two ends of the current path
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  moveHistory: Position[];
  lines: { start: Position; end: Position; player: Player }[];
}

export class HoldTheLineEngine {
  private state: GameState;

  constructor(gridSize: number = 4) {
    // Validate and clamp grid size to prevent impractical grids
    const validatedGridSize = Math.max(
      MIN_GRID_SIZE,
      Math.min(MAX_GRID_SIZE, gridSize)
    );

    this.state = {
      gridSize: validatedGridSize,
      visitedDots: new Set<string>(),
      pathEnds: null,
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      moveHistory: [],
      lines: [],
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      visitedDots: new Set(this.state.visitedDots),
      pathEnds: this.state.pathEnds
        ? [{ ...this.state.pathEnds[0] }, { ...this.state.pathEnds[1] }]
        : null,
      moveHistory: [...this.state.moveHistory],
      lines: [...this.state.lines],
    };
  }

  private positionKey(pos: Position): string {
    return `${pos.row},${pos.col}`;
  }

  private isValidPosition(pos: Position): boolean {
    return (
      pos.row >= 0 &&
      pos.row < this.state.gridSize &&
      pos.col >= 0 &&
      pos.col < this.state.gridSize
    );
  }

  private isAdjacent(pos1: Position, pos2: Position): boolean {
    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);

    // Adjacent means horizontal, vertical, or diagonal (max distance of 1 in each direction)
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff > 0 || colDiff > 0);
  }

  /**
   * Check if two line segments intersect
   * Uses the cross product method to determine if segments (p1,p2) and (p3,p4) intersect
   */
  private doLineSegmentsIntersect(
    p1: Position,
    p2: Position,
    p3: Position,
    p4: Position
  ): boolean {
    // Helper function to compute the z-component of the cross product of 2D vectors (b-a) and (c-a)
    // Returns positive if c is counter-clockwise from ab, negative if clockwise, zero if collinear
    const ccw = (a: Position, b: Position, c: Position): number => {
      return (
        (b.col - a.col) * (c.row - a.row) - (b.row - a.row) * (c.col - a.col)
      );
    };

    // Two segments intersect if the endpoints of one segment are on opposite sides
    // of the line containing the other segment, and vice versa
    const ccw1 = ccw(p1, p2, p3);
    const ccw2 = ccw(p1, p2, p4);
    const ccw3 = ccw(p3, p4, p1);
    const ccw4 = ccw(p3, p4, p2);

    // Check if segments properly intersect (cross each other)
    if (ccw1 * ccw2 < 0 && ccw3 * ccw4 < 0) {
      return true;
    }

    // Check for collinear cases where segments share an endpoint
    // This is allowed in the game (lines can share dots at endpoints)
    // So we don't count endpoint-only intersections
    return false;
  }

  /**
   * Check if adding a new line segment would intersect with any existing line segments
   */
  private wouldIntersectExistingLines(
    newStart: Position,
    newEnd: Position
  ): boolean {
    // Check against all existing line segments
    for (const line of this.state.lines) {
      const existingStart = line.start;
      const existingEnd = line.end;

      // Skip if the new segment shares an endpoint with the existing segment
      // (this is allowed - lines can meet at dots)
      const sharesEndpoint =
        (newStart.row === existingStart.row &&
          newStart.col === existingStart.col) ||
        (newStart.row === existingEnd.row &&
          newStart.col === existingEnd.col) ||
        (newEnd.row === existingStart.row &&
          newEnd.col === existingStart.col) ||
        (newEnd.row === existingEnd.row && newEnd.col === existingEnd.col);

      if (sharesEndpoint) {
        continue;
      }

      // Check if the segments intersect
      if (
        this.doLineSegmentsIntersect(
          newStart,
          newEnd,
          existingStart,
          existingEnd
        )
      ) {
        return true;
      }
    }

    return false;
  }

  isValidMove(pos: Position): boolean {
    if (this.state.status !== 'playing') return false;
    if (!this.isValidPosition(pos)) return false;

    const key = this.positionKey(pos);
    if (this.state.visitedDots.has(key)) return false;

    // First move: any position is valid
    if (this.state.pathEnds === null) return true;

    // Subsequent moves: must be adjacent to one of the path ends
    const adjacentToEnd1 = this.isAdjacent(pos, this.state.pathEnds[0]);
    const adjacentToEnd2 = this.isAdjacent(pos, this.state.pathEnds[1]);

    if (!adjacentToEnd1 && !adjacentToEnd2) {
      return false;
    }

    // Check for line intersection
    // If adjacent to both ends, check valid connections to either
    // A move is valid if it can connect to AT LEAST one end without intersection
    let validConnection1 = false;
    if (adjacentToEnd1) {
      if (!this.wouldIntersectExistingLines(this.state.pathEnds[0], pos)) {
        validConnection1 = true;
      }
    }

    let validConnection2 = false;
    if (adjacentToEnd2) {
      if (!this.wouldIntersectExistingLines(this.state.pathEnds[1], pos)) {
        validConnection2 = true;
      }
    }

    return validConnection1 || validConnection2;
  }

  startGame(): void {
    if (this.state.status !== 'setup') return;
    this.state.status = 'playing';
  }

  getValidMoves(): Position[] {
    const validMoves: Position[] = [];

    for (let row = 0; row < this.state.gridSize; row++) {
      for (let col = 0; col < this.state.gridSize; col++) {
        const pos = { row, col };
        if (this.isValidMove(pos)) {
          validMoves.push(pos);
        }
      }
    }

    return validMoves;
  }

  makeMove(pos: Position): boolean {
    if (!this.isValidMove(pos)) return false;

    const key = this.positionKey(pos);
    this.state.visitedDots.add(key);
    this.state.moveHistory.push(pos);

    // Update path ends
    if (this.state.pathEnds === null) {
      // First move: this position is both ends of the path
      this.state.pathEnds = [pos, pos];
    } else {
      // Determine which end to replace
      const [end1, end2] = this.state.pathEnds;

      let connectedEnd: Position | null = null;

      // Check which connections are valid (non-intersecting)
      const adjacentToEnd1 = this.isAdjacent(pos, end1);
      const adjacentToEnd2 = this.isAdjacent(pos, end2);

      let canConnectToEnd1 = false;
      if (adjacentToEnd1) {
        canConnectToEnd1 = !this.wouldIntersectExistingLines(end1, pos);
      }

      let canConnectToEnd2 = false;
      if (adjacentToEnd2) {
        canConnectToEnd2 = !this.wouldIntersectExistingLines(end2, pos);
      }

      if (canConnectToEnd1) {
        // Replace end1 with the new position
        this.state.pathEnds = [pos, end2];
        connectedEnd = end1;
      } else if (canConnectToEnd2) {
        // Replace end2 with the new position
        this.state.pathEnds = [end1, pos];
        connectedEnd = end2;
      }

      if (connectedEnd) {
        this.state.lines.push({
          start: connectedEnd,
          end: pos,
          player: this.state.currentPlayer,
        });
      }
    }

    // Check if there are any valid moves left for the next player
    const nextPlayerValidMoves = this.getValidMoves();

    if (nextPlayerValidMoves.length === 0) {
      // No valid moves left - current player loses (misere play)
      this.state.status = 'ended';
      this.state.winner = this.state.currentPlayer === 1 ? 2 : 1;
    } else {
      // Switch to next player
      this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    }

    return true;
  }

  reset(): void {
    this.state = {
      gridSize: this.state.gridSize,
      visitedDots: new Set<string>(),
      pathEnds: null,
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      moveHistory: [],
      lines: [],
    };
  }

  setGridSize(gridSize: number): void {
    // Only allow changing grid size during setup
    if (this.state.status !== 'setup') {
      throw new Error('Grid size can only be changed during setup phase');
    }

    // Validate and clamp grid size
    const validatedGridSize = Math.max(
      MIN_GRID_SIZE,
      Math.min(MAX_GRID_SIZE, gridSize)
    );

    // Reset the game with new grid size
    this.state = {
      gridSize: validatedGridSize,
      visitedDots: new Set<string>(),
      pathEnds: null,
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      moveHistory: [],
      lines: [],
      player1Ready: false,
      player2Ready: false,
    };
  }
}
