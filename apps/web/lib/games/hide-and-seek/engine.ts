import type { Position, Player, GameState, Guess } from './types';
import { GRID_SIZE, GEMS_TO_HIDE } from './types';

export class HideAndSeekEngine {
  private state: GameState;

  constructor(hider: Player = 1) {
    this.state = this.createInitialState(hider);
  }

  private createInitialState(hider: Player): GameState {
    return {
      gridSize: GRID_SIZE,
      status: 'hiding',
      hiddenGems: [],
      currentSelection: [],
      guesses: [],
      winner: null,
      hider,
      seeker: hider === 1 ? 2 : 1,
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      hiddenGems: this.state.hiddenGems.map((p) => ({ ...p })),
      currentSelection: this.state.currentSelection.map((p) => ({ ...p })),
      guesses: this.state.guesses.map((g) => ({
        ...g,
        positions: g.positions.map((p) => ({ ...p })),
      })),
    };
  }

  /** Toggle a gem position during the hiding phase. Returns true if successful. */
  toggleHidingGem(pos: Position): boolean {
    if (this.state.status !== 'hiding') return false;
    if (!this.isInBounds(pos)) return false;

    const key = this.posKey(pos);
    const existing = this.state.hiddenGems.findIndex(
      (p) => this.posKey(p) === key
    );

    if (existing !== -1) {
      // Deselect
      this.state.hiddenGems.splice(existing, 1);
      return true;
    }

    if (this.state.hiddenGems.length >= GEMS_TO_HIDE) return false;

    this.state.hiddenGems.push({ ...pos });
    return true;
  }

  /** Confirm hidden gems and move to transition phase. Returns true if successful. */
  confirmHiding(): boolean {
    if (this.state.status !== 'hiding') return false;
    if (this.state.hiddenGems.length !== GEMS_TO_HIDE) return false;
    this.state.status = 'transition';
    return true;
  }

  /** Advance from transition to seeking phase. */
  startSeeking(): void {
    if (this.state.status !== 'transition') return;
    this.state.status = 'seeking';
  }

  /** Toggle a cell selection during the seeking phase. Returns true if successful. */
  toggleSelection(pos: Position): boolean {
    if (this.state.status !== 'seeking') return false;
    if (!this.isInBounds(pos)) return false;

    const key = this.posKey(pos);
    const existing = this.state.currentSelection.findIndex(
      (p) => this.posKey(p) === key
    );

    if (existing !== -1) {
      this.state.currentSelection.splice(existing, 1);
      return true;
    }

    if (this.state.currentSelection.length >= GEMS_TO_HIDE) return false;

    this.state.currentSelection.push({ ...pos });
    return true;
  }

  /** Submit the seeker's guess. Returns the number correct, or -1 if invalid. */
  submitGuess(): number {
    if (this.state.status !== 'seeking') return -1;
    if (this.state.currentSelection.length !== GEMS_TO_HIDE) return -1;

    const correct = this.countCorrect(
      this.state.currentSelection,
      this.state.hiddenGems
    );

    const guess: Guess = {
      positions: this.state.currentSelection.map((p) => ({ ...p })),
      correct,
    };
    this.state.guesses.push(guess);
    this.state.currentSelection = [];

    if (correct === GEMS_TO_HIDE) {
      this.state.status = 'ended';
      this.state.winner = this.state.seeker;
    }

    return correct;
  }

  private countCorrect(guess: Position[], hidden: Position[]): number {
    return guess.filter((g) =>
      hidden.some((h) => h.row === g.row && h.col === g.col)
    ).length;
  }

  /** Switch hider/seeker roles and reset for a new game. */
  switchRoles(): void {
    const newHider = this.state.seeker;
    this.state = this.createInitialState(newHider);
  }

  reset(): void {
    this.state = this.createInitialState(this.state.hider);
  }

  private isInBounds(pos: Position): boolean {
    return (
      pos.row >= 0 &&
      pos.row < GRID_SIZE &&
      pos.col >= 0 &&
      pos.col < GRID_SIZE
    );
  }

  private posKey(pos: Position): string {
    return `${pos.row},${pos.col}`;
  }
}
