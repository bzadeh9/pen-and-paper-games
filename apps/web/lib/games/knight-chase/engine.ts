import type { Position, Player, GameState, CellState } from './types';

export class KnightChaseEngine {
  private state: GameState;

  constructor() {
    // Fixed 8x8 grid
    const gridSize = 8;
    const grid: CellState[][] = [];

    // Initialize empty grid
    for (let row = 0; row < gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < gridSize; col++) {
        grid[row][col] = null;
      }
    }

    // Player A starts at (1,1) - which is index (0,0) in 0-indexed
    // Player B starts at (8,8) - which is index (7,7) in 0-indexed
    const player1Position: Position = { row: 0, col: 0 };
    const player2Position: Position = { row: 7, col: 7 };

    grid[0][0] = 1;
    grid[7][7] = 2;

    this.state = {
      gridSize,
      grid,
      playerPositions: {
        1: player1Position,
        2: player2Position,
      },
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      winReason: null,
      moveHistory: [],
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      grid: this.state.grid.map((row) => [...row]),
      playerPositions: {
        1: { ...this.state.playerPositions[1] },
        2: { ...this.state.playerPositions[2] },
      },
      moveHistory: [...this.state.moveHistory],
    };
  }

  private isValidPosition(pos: Position): boolean {
    return (
      pos.row >= 0 &&
      pos.row < this.state.gridSize &&
      pos.col >= 0 &&
      pos.col < this.state.gridSize
    );
  }

  /**
   * Get all possible knight moves (L-shaped) from a position
   * Knight moves: 2 squares in one direction, 1 square perpendicular
   */
  private getKnightMoveOffsets(): Position[] {
    return [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 },
    ];
  }

  /**
   * Check if a move is valid for the current player
   * Valid move: within bounds, not exhausted, follows L-pattern
   */
  isValidMove(pos: Position): boolean {
    if (this.state.status !== 'playing') return false;
    if (!this.isValidPosition(pos)) return false;

    const currentPos = this.state.playerPositions[this.state.currentPlayer];

    // Check if destination is exhausted
    if (this.state.grid[pos.row][pos.col] === 'exhausted') return false;

    // Check if the move follows the L-pattern
    const rowDiff = Math.abs(pos.row - currentPos.row);
    const colDiff = Math.abs(pos.col - currentPos.col);

    // Valid knight move: (2,1) or (1,2)
    const isValidKnightMove =
      (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

    return isValidKnightMove;
  }

  /**
   * Get all valid moves for the current player
   */
  getValidMoves(): Position[] {
    if (this.state.status !== 'playing') return [];

    const currentPos = this.state.playerPositions[this.state.currentPlayer];
    const validMoves: Position[] = [];
    const offsets = this.getKnightMoveOffsets();

    for (const offset of offsets) {
      const newPos: Position = {
        row: currentPos.row + offset.row,
        col: currentPos.col + offset.col,
      };

      if (this.isValidMove(newPos)) {
        validMoves.push(newPos);
      }
    }

    return validMoves;
  }

  startGame(): void {
    if (this.state.status !== 'setup') return;
    this.state.status = 'playing';
  }

  /**
   * Make a move for the current player
   */
  makeMove(pos: Position): boolean {
    if (!this.isValidMove(pos)) return false;

    const currentPlayer = this.state.currentPlayer;
    const currentPos = this.state.playerPositions[currentPlayer];
    const opponent: Player = currentPlayer === 1 ? 2 : 1;
    const opponentPos = this.state.playerPositions[opponent];

    // Record the move
    this.state.moveHistory.push({
      player: currentPlayer,
      from: { ...currentPos },
      to: { ...pos },
    });

    // Mark the old position as exhausted
    this.state.grid[currentPos.row][currentPos.col] = 'exhausted';

    // Move to the new position
    this.state.grid[pos.row][pos.col] = currentPlayer;
    this.state.playerPositions[currentPlayer] = pos;

    // Check for elimination (landing on opponent's square)
    if (pos.row === opponentPos.row && pos.col === opponentPos.col) {
      this.state.status = 'ended';
      this.state.winner = currentPlayer;
      this.state.winReason = 'elimination';
      // Clear opponent from grid
      this.state.grid[opponentPos.row][opponentPos.col] = currentPlayer;
      return true;
    }

    // Switch players
    this.state.currentPlayer = opponent;

    // Check if the next player has any valid moves (entrapment check)
    const nextPlayerValidMoves = this.getValidMoves();
    if (nextPlayerValidMoves.length === 0) {
      // Next player is trapped - current player (who just moved) wins
      this.state.status = 'ended';
      this.state.winner = currentPlayer;
      this.state.winReason = 'entrapment';
    }

    return true;
  }

  reset(): void {
    const gridSize = 8;
    const grid: CellState[][] = [];

    for (let row = 0; row < gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < gridSize; col++) {
        grid[row][col] = null;
      }
    }

    const player1Position: Position = { row: 0, col: 0 };
    const player2Position: Position = { row: 7, col: 7 };

    grid[0][0] = 1;
    grid[7][7] = 2;

    this.state = {
      gridSize,
      grid,
      playerPositions: {
        1: player1Position,
        2: player2Position,
      },
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      winReason: null,
      moveHistory: [],
    };
  }
}
