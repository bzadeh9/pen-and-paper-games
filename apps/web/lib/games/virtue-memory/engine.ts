import type { Card, GameState, Player, Virtue } from './types';
import { VIRTUES } from './types';

export class VirtueMemoryEngine {
  private state: GameState;

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    return {
      cards: this.createShuffledDeck(),
      currentPlayer: 1,
      status: 'playing',
      winner: null,
      scores: { 1: 0, 2: 0 },
      firstFlippedIndex: null,
      isChecking: false,
      totalTurns: 0,
    };
  }

  private createShuffledDeck(): Card[] {
    const pairs: Virtue[] = [...VIRTUES, ...VIRTUES];
    // Fisher-Yates shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs.map((virtue, id) => ({
      id,
      virtue,
      isFlipped: false,
      isMatched: false,
    }));
  }

  getState(): GameState {
    return {
      ...this.state,
      cards: this.state.cards.map((c) => ({ ...c })),
      scores: { ...this.state.scores },
    };
  }

  /**
   * Flip a card at the given index.
   * Returns false if the flip is not allowed (card already flipped/matched,
   * game ended, or currently in checking state).
   */
  flipCard(index: number): boolean {
    if (this.state.status !== 'playing') return false;
    if (this.state.isChecking) return false;
    if (index < 0 || index >= this.state.cards.length) return false;

    const card = this.state.cards[index];
    if (card.isFlipped || card.isMatched) return false;

    card.isFlipped = true;

    if (this.state.firstFlippedIndex === null) {
      // First card of the turn
      this.state.firstFlippedIndex = index;
    } else {
      // Second card of the turn — evaluate the pair
      const firstCard = this.state.cards[this.state.firstFlippedIndex];

      if (firstCard.virtue === card.virtue) {
        // Match! Mark both as matched and award a point.
        firstCard.isMatched = true;
        card.isMatched = true;
        this.state.scores[this.state.currentPlayer]++;
        this.state.firstFlippedIndex = null;
        this.state.totalTurns++;

        // Check if all pairs have been found → game over
        if (this.state.cards.every((c) => c.isMatched)) {
          this.state.status = 'ended';
          const p1 = this.state.scores[1];
          const p2 = this.state.scores[2];
          this.state.winner = p1 > p2 ? 1 : p2 > p1 ? 2 : null;
        }
        // Current player keeps their turn (firstFlippedIndex already null)
      } else {
        // No match — enter checking state; UI will call closeCards() after a delay
        this.state.isChecking = true;
      }
    }

    return true;
  }

  /**
   * Called by the UI after briefly showing two non-matching flipped cards.
   * Flips both cards back and advances the turn to the other player.
   */
  closeCards(): void {
    if (!this.state.isChecking) return;
    if (this.state.firstFlippedIndex === null) return;

    const firstIdx = this.state.firstFlippedIndex;
    // Find the second flipped, non-matched card
    const secondIdx = this.state.cards.findIndex(
      (c, i) => c.isFlipped && !c.isMatched && i !== firstIdx
    );

    this.state.cards[firstIdx].isFlipped = false;
    if (secondIdx !== -1) {
      this.state.cards[secondIdx].isFlipped = false;
    }

    this.state.firstFlippedIndex = null;
    this.state.isChecking = false;
    this.state.totalTurns++;
    this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
