import type { GameState, Player, Hand } from './types';

export class ChopsticksEngine {
  private state: GameState;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      hands: [
        { left: 1, right: 1 },
        { left: 1, right: 1 },
      ],
      currentPlayer: 1,
      status: 'playing',
      winner: null,
    };
  }

  getState(): GameState {
    return {
      hands: [
        { ...this.state.hands[0] },
        { ...this.state.hands[1] },
      ],
      currentPlayer: this.state.currentPlayer,
      status: this.state.status,
      winner: this.state.winner,
    };
  }

  /**
   * Returns all valid splits for the current player as [newLeft, newRight] pairs.
   * A split is valid if the total is preserved, both values are 0–4, and the
   * result differs from the current arrangement.
   */
  getValidSplits(): [number, number][] {
    if (this.state.status !== 'playing') return [];

    const { left, right } = this.state.hands[this.state.currentPlayer - 1];
    const total = left + right;

    const splits: [number, number][] = [];
    for (let l = 0; l <= Math.min(total, 4); l++) {
      const r = total - l;
      if (r < 0 || r > 4) continue;
      if (l === left && r === right) continue; // same as current
      splits.push([l, r]);
    }
    return splits;
  }

  /**
   * Validate whether an attack is legal.
   * @param attackerHand - Which of the current player's hands attacks
   * @param targetHand - Which of the opponent's hands is attacked
   */
  isValidAttack(attackerHand: Hand, targetHand: Hand): boolean {
    if (this.state.status !== 'playing') return false;

    const attacker = this.state.hands[this.state.currentPlayer - 1];
    const opponent = this.state.hands[this.state.currentPlayer === 1 ? 1 : 0];

    if (attacker[attackerHand] === 0) return false; // dead hand can't attack
    if (opponent[targetHand] === 0) return false;   // can't attack dead hand

    return true;
  }

  /**
   * Validate whether a split is legal.
   */
  isValidSplit(newLeft: number, newRight: number): boolean {
    if (this.state.status !== 'playing') return false;

    const { left, right } = this.state.hands[this.state.currentPlayer - 1];
    const total = left + right;

    if (!Number.isInteger(newLeft) || !Number.isInteger(newRight)) return false;
    if (newLeft < 0 || newRight < 0) return false;
    if (newLeft > 4 || newRight > 4) return false;
    if (newLeft + newRight !== total) return false;
    if (newLeft === left && newRight === right) return false; // no change

    return true;
  }

  /**
   * Attack an opponent's hand. Returns true if the move was made.
   * The opponent's hand becomes (opponent + attacker) % 5; if 0, it is dead.
   */
  attack(attackerHand: Hand, targetHand: Hand): boolean {
    if (!this.isValidAttack(attackerHand, targetHand)) return false;

    const playerIndex = this.state.currentPlayer - 1;
    const opponentIndex = playerIndex === 0 ? 1 : 0;

    const attackValue = this.state.hands[playerIndex][attackerHand];
    const targetValue = this.state.hands[opponentIndex][targetHand];
    const newValue = (targetValue + attackValue) % 5;

    this.state.hands[opponentIndex][targetHand] = newValue;

    // Check win condition: opponent has both hands dead
    const opp = this.state.hands[opponentIndex];
    if (opp.left === 0 && opp.right === 0) {
      this.state.status = 'ended';
      this.state.winner = this.state.currentPlayer;
    } else {
      this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    }

    return true;
  }

  /**
   * Split the current player's fingers. Returns true if the move was made.
   */
  split(newLeft: number, newRight: number): boolean {
    if (!this.isValidSplit(newLeft, newRight)) return false;

    const playerIndex = this.state.currentPlayer - 1;
    this.state.hands[playerIndex].left = newLeft;
    this.state.hands[playerIndex].right = newRight;

    this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;

    return true;
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
