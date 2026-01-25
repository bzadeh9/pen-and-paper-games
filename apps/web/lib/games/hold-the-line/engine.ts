export type Position = { row: number; col: number };
export type Player = 1 | 2;
export type GameStatus = 'playing' | 'ended';

export interface GameState {
  gridSize: number;
  visitedDots: Set<string>;
  pathEnds: [Position, Position] | null; // The two ends of the current path
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  moveHistory: Position[];
}

export class HoldTheLineEngine {
  private state: GameState;

  constructor(gridSize: number = 4) {
    this.state = {
      gridSize,
      visitedDots: new Set<string>(),
      pathEnds: null,
      currentPlayer: 1,
      status: 'playing',
      winner: null,
      moveHistory: [],
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
      return (b.col - a.col) * (c.row - a.row) - (b.row - a.row) * (c.col - a.col);
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
  private wouldIntersectExistingLines(newStart: Position, newEnd: Position): boolean {
    // Check against all existing line segments in the move history
    for (let i = 1; i < this.state.moveHistory.length; i++) {
      const existingStart = this.state.moveHistory[i - 1];
      const existingEnd = this.state.moveHistory[i];

      // Skip if the new segment shares an endpoint with the existing segment
      // (this is allowed - lines can meet at dots)
      const sharesEndpoint =
        (newStart.row === existingStart.row && newStart.col === existingStart.col) ||
        (newStart.row === existingEnd.row && newStart.col === existingEnd.col) ||
        (newEnd.row === existingStart.row && newEnd.col === existingStart.col) ||
        (newEnd.row === existingEnd.row && newEnd.col === existingEnd.col);

      if (sharesEndpoint) {
        continue;
      }

      // Check if the segments intersect
      if (this.doLineSegmentsIntersect(newStart, newEnd, existingStart, existingEnd)) {
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
    // If adjacent to both ends, check both possible connections
    // If adjacent to only one end, check that connection
    if (adjacentToEnd1) {
      if (this.wouldIntersectExistingLines(this.state.pathEnds[0], pos)) {
        return false;
      }
    }
    
    if (adjacentToEnd2) {
      if (this.wouldIntersectExistingLines(this.state.pathEnds[1], pos)) {
        return false;
      }
    }

    return true;
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
      
      if (this.isAdjacent(pos, end1)) {
        // Replace end1 with the new position
        this.state.pathEnds = [pos, end2];
      } else if (this.isAdjacent(pos, end2)) {
        // Replace end2 with the new position
        this.state.pathEnds = [end1, pos];
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
      status: 'playing',
      winner: null,
      moveHistory: [],
    };
  }
}
