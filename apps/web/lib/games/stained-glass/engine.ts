import type { GameState, Section, Player, GameMode } from './types';

export const MIN_GRID_SIZE = 3;
export const MAX_GRID_SIZE = 6;
export const DEFAULT_GRID_SIZE = 4;

export class StainedGlassEngine {
  private state: GameState;

  constructor(gridSize: number = DEFAULT_GRID_SIZE, mode: GameMode = 'standard') {
    const validatedSize = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, gridSize));
    this.state = this.createInitialState(validatedSize, mode);
  }

  private createInitialState(gridSize: number, mode: GameMode): GameState {
    const sections = this.buildGrid(gridSize);

    return {
      sections,
      currentPlayer: 1,
      status: 'setup',
      mode,
      winner: null,
      player1Score: 0,
      player2Score: 0,
    };
  }

  /**
   * Build a grid of square sections arranged in a gridSize×gridSize layout.
   * Each section's neighbors are the sections sharing a side (up/down/left/right).
   */
  private buildGrid(gridSize: number): Section[] {
    const totalSections = gridSize * gridSize;
    const sections: Section[] = [];

    for (let i = 0; i < totalSections; i++) {
      sections.push({ id: i, owner: null, neighbors: [] });
    }

    // Compute side-sharing neighbors (up, down, left, right)
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const id = row * gridSize + col;
        const neighbors: number[] = [];

        if (row > 0) neighbors.push((row - 1) * gridSize + col); // up
        if (row < gridSize - 1) neighbors.push((row + 1) * gridSize + col); // down
        if (col > 0) neighbors.push(row * gridSize + (col - 1)); // left
        if (col < gridSize - 1) neighbors.push(row * gridSize + (col + 1)); // right

        sections[id].neighbors = neighbors;
      }
    }

    return sections;
  }

  /**
   * Load a custom section topology (e.g. from a Voronoi layout generator).
   * Each entry provides the section id and its neighbor IDs.
   */
  loadSections(sectionData: { id: number; neighbors: number[] }[]): void {
    if (this.state.status === 'playing') return;
    this.state.sections = sectionData.map((s) => ({
      id: s.id,
      owner: null,
      neighbors: [...s.neighbors],
    }));
    this.state.player1Score = 0;
    this.state.player2Score = 0;
    this.state.winner = null;
    this.state.currentPlayer = 1;
    this.state.status = 'setup';
  }

  getState(): GameState {
    return {
      ...this.state,
      sections: this.state.sections.map((s) => ({ ...s, neighbors: [...s.neighbors] })),
    };
  }

  getGridSize(): number {
    return Math.round(Math.sqrt(this.state.sections.length));
  }

  startGame(): void {
    this.state.status = 'playing';
  }

  setMode(mode: GameMode): void {
    if (this.state.status === 'playing') return;
    this.state.mode = mode;
  }

  setGridSize(gridSize: number): void {
    if (this.state.status === 'playing') return;
    const validatedSize = Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, gridSize));
    this.state = this.createInitialState(validatedSize, this.state.mode);
  }

  /**
   * Check whether a section can be legally colored by the current player.
   *
   * Standard mode: the section may NOT share a side with any section colored
   * by the **opponent** (touching your own color is fine).
   *
   * Reverse mode: the section may NOT share a side with any section colored
   * by **yourself** (touching opponent color is fine).
   */
  isValidMove(sectionId: number): boolean {
    if (this.state.status !== 'playing') return false;
    const section = this.state.sections[sectionId];
    if (!section) return false;
    if (section.owner !== null) return false;

    const currentPlayer = this.state.currentPlayer;

    if (this.state.mode === 'standard') {
      // Cannot be adjacent to opponent sections
      const opponent: Player = currentPlayer === 1 ? 2 : 1;
      return !section.neighbors.some(
        (nId) => this.state.sections[nId].owner === opponent
      );
    } else {
      // Reverse: cannot be adjacent to own sections
      return !section.neighbors.some(
        (nId) => this.state.sections[nId].owner === currentPlayer
      );
    }
  }

  /**
   * Get all valid moves for the current player.
   */
  getValidMoves(): number[] {
    if (this.state.status !== 'playing') return [];
    return this.state.sections
      .filter((s) => this.isValidMove(s.id))
      .map((s) => s.id);
  }

  makeMove(sectionId: number): boolean {
    // Auto-start the game if in setup
    if (this.state.status === 'setup') {
      this.startGame();
    }

    if (!this.isValidMove(sectionId)) return false;

    // Color the section
    this.state.sections[sectionId].owner = this.state.currentPlayer;

    // Update scores
    this.updateScores();

    // Switch player
    const nextPlayer: Player = this.state.currentPlayer === 1 ? 2 : 1;
    this.state.currentPlayer = nextPlayer;

    // Check if the next player has any valid moves
    if (this.getValidMoves().length === 0) {
      // Next player cannot move — they concede, current player (before switch) wins
      // But since we already switched, the winner is the player who just moved
      this.state.winner = nextPlayer === 1 ? 2 : 1;
      this.state.status = 'ended';
    }

    return true;
  }

  private updateScores(): void {
    let p1 = 0;
    let p2 = 0;
    for (const section of this.state.sections) {
      if (section.owner === 1) p1++;
      if (section.owner === 2) p2++;
    }
    this.state.player1Score = p1;
    this.state.player2Score = p2;
  }

  reset(): void {
    const gridSize = this.getGridSize();
    const mode = this.state.mode;
    this.state = this.createInitialState(gridSize, mode);
  }
}
