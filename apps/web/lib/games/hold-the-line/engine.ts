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

  isValidMove(pos: Position): boolean {
    if (this.state.status !== 'playing') return false;
    if (!this.isValidPosition(pos)) return false;

    const key = this.positionKey(pos);
    if (this.state.visitedDots.has(key)) return false;

    // First move: any position is valid
    if (this.state.pathEnds === null) return true;

    // Subsequent moves: must be adjacent to one of the path ends
    return (
      this.isAdjacent(pos, this.state.pathEnds[0]) ||
      this.isAdjacent(pos, this.state.pathEnds[1])
    );
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
