export type Player = 1 | 2;

export type GameStatus = 'playing' | 'ended';

export const VIRTUES = [
  'Generosity',
  'Service',
  'Unity',
  'Joy',
  'Love',
  'Kindness',
  'Gratitude',
  'Courage',
] as const;

export type Virtue = (typeof VIRTUES)[number];

/** Maps each virtue to an emoji for display on the card face. */
export const VIRTUE_EMOJI: Record<Virtue, string> = {
  Generosity: '💝',
  Service: '🤝',
  Unity: '🌟',
  Joy: '😊',
  Love: '❤️',
  Kindness: '🌸',
  Gratitude: '🙏',
  Courage: '🦁',
};

export interface Card {
  id: number;
  virtue: Virtue;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  cards: Card[];
  currentPlayer: Player;
  status: GameStatus;
  /** null means the game ended in a draw */
  winner: Player | null;
  scores: Record<Player, number>;
  /** Index of the first card flipped in the current turn, or null */
  firstFlippedIndex: number | null;
  /**
   * When true, two non-matching cards are visible and waiting to be closed.
   * The UI should show them briefly then call closeCards().
   */
  isChecking: boolean;
  totalTurns: number;
}
