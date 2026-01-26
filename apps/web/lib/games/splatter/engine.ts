export type Position = { row: number; col: number };
export type Player = 1 | 2;
export type GameStatus = 'setup' | 'playing' | 'ended';
export type CellState = Player | null; // null means splattered
export type SetupMode = 'manual' | 'auto';

// Grid size constraints
export const MIN_GRID_SIZE = 3;
export const MAX_GRID_SIZE = 10;

export interface GameState {
  gridSize: number;
  grid: CellState[][]; // The actual grid state
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  setupMode: SetupMode;
  setupComplete: boolean;
  hoveredCell: Position | null; // For area splatter preview
}

export class SplatterEngine {
  private state: GameState;

  constructor(gridSize: number = 5, setupMode: SetupMode = 'auto') {
    const validatedGridSize = Math.max(
      MIN_GRID_SIZE,
      Math.min(MAX_GRID_SIZE, gridSize)
    );

    // Initialize empty grid
    const grid: CellState[][] = [];
    for (let row = 0; row < validatedGridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < validatedGridSize; col++) {
        grid[row][col] = null;
      }
    }

    this.state = {
      gridSize: validatedGridSize,
      grid,
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      setupMode,
      setupComplete: false,
      hoveredCell: null,
    };

    // Auto-populate if auto mode
    if (setupMode === 'auto') {
      this.autoPopulateGrid();
    }
  }

  getState(): GameState {
    return {
      ...this.state,
      grid: this.state.grid.map((row) => [...row]),
    };
  }

  private autoPopulateGrid(): void {
    const totalCells = this.state.gridSize * this.state.gridSize;
    const positions: Position[] = [];

    // Create list of all positions
    for (let row = 0; row < this.state.gridSize; row++) {
      for (let col = 0; col < this.state.gridSize; col++) {
        positions.push({ row, col });
      }
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Assign half to each player
    const halfCells = Math.floor(totalCells / 2);
    for (let i = 0; i < totalCells; i++) {
      const pos = positions[i];
      this.state.grid[pos.row][pos.col] = i < halfCells ? 1 : 2;
    }

    this.state.setupComplete = true;
  }

  // Manual setup: place a dot
  placeManualDot(pos: Position): boolean {
    if (this.state.setupMode !== 'manual') return false;
    if (this.state.setupComplete) return false;
    if (!this.isValidPosition(pos)) return false;
    if (this.state.grid[pos.row][pos.col] !== null) return false;

    // Place the dot for the current player
    this.state.grid[pos.row][pos.col] = this.state.currentPlayer;

    // Check if grid is full
    if (this.isGridFull()) {
      this.state.setupComplete = true;
    } else {
      // Switch player for next placement
      this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    }

    return true;
  }

  private isGridFull(): boolean {
    for (let row = 0; row < this.state.gridSize; row++) {
      for (let col = 0; col < this.state.gridSize; col++) {
        if (this.state.grid[row][col] === null) {
          return false;
        }
      }
    }
    return true;
  }

  startGame(): boolean {
    if (!this.state.setupComplete) return false;
    if (this.state.status !== 'setup') return false;

    this.state.status = 'playing';
    this.state.currentPlayer = 1; // Player 1 starts
    return true;
  }

  private isValidPosition(pos: Position): boolean {
    return (
      pos.row >= 0 &&
      pos.row < this.state.gridSize &&
      pos.col >= 0 &&
      pos.col < this.state.gridSize
    );
  }

  // Check if a cell belongs to the current player
  canSelectCell(pos: Position): boolean {
    if (this.state.status !== 'playing') return false;
    if (!this.isValidPosition(pos)) return false;
    return this.state.grid[pos.row][pos.col] === this.state.currentPlayer;
  }

  // Get all cells that would be affected by an area splatter
  getAreaSplatterCells(pos: Position): Position[] {
    const cells: Position[] = [pos];

    // Add all 8 neighbors
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue; // Skip center cell (already added)
        const newPos = { row: pos.row + dr, col: pos.col + dc };
        if (this.isValidPosition(newPos)) {
          cells.push(newPos);
        }
      }
    }

    return cells;
  }

  // Perform a single splatter (only the selected cell)
  singleSplatter(pos: Position): boolean {
    if (!this.canSelectCell(pos)) return false;

    // Splatter the cell
    this.state.grid[pos.row][pos.col] = null;

    return this.finalizeTurn();
  }

  // Perform an area splatter (selected cell + all neighbors)
  areaSplatter(pos: Position): boolean {
    if (!this.canSelectCell(pos)) return false;

    // Get all cells to splatter
    const cellsToSplatter = this.getAreaSplatterCells(pos);

    // Splatter all cells (regardless of owner)
    for (const cell of cellsToSplatter) {
      this.state.grid[cell.row][cell.col] = null;
    }

    return this.finalizeTurn();
  }

  private finalizeTurn(): boolean {
    // Check win condition
    const player1Dots = this.countPlayerDots(1);
    const player2Dots = this.countPlayerDots(2);

    if (player1Dots === 0 && player2Dots === 0) {
      // Draw - or current player loses (they eliminated both)
      // Let's make it so the initiator loses in this edge case
      this.state.winner = this.state.currentPlayer === 1 ? 2 : 1;
      this.state.status = 'ended';
      return true;
    }

    if (player1Dots === 0) {
      this.state.winner = 2;
      this.state.status = 'ended';
      return true;
    }

    if (player2Dots === 0) {
      this.state.winner = 1;
      this.state.status = 'ended';
      return true;
    }

    // Switch player
    this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    return true;
  }

  private countPlayerDots(player: Player): number {
    let count = 0;
    for (let row = 0; row < this.state.gridSize; row++) {
      for (let col = 0; col < this.state.gridSize; col++) {
        if (this.state.grid[row][col] === player) {
          count++;
        }
      }
    }
    return count;
  }

  // Get count of dots for each player
  getPlayerDotCounts(): { player1: number; player2: number } {
    return {
      player1: this.countPlayerDots(1),
      player2: this.countPlayerDots(2),
    };
  }

  reset(): void {
    const gridSize = this.state.gridSize;
    const setupMode = this.state.setupMode;

    // Create new empty grid
    const grid: CellState[][] = [];
    for (let row = 0; row < gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < gridSize; col++) {
        grid[row][col] = null;
      }
    }

    this.state = {
      gridSize,
      grid,
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      setupMode,
      setupComplete: false,
      hoveredCell: null,
    };

    if (setupMode === 'auto') {
      this.autoPopulateGrid();
    }
  }
}
