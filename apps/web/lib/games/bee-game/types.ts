export type Position = { row: number; col: number };

export type Role = 'runner' | 'chaser';

export type Player = 1 | 2;

export type GameStatus = 'setup' | 'playing' | 'ended';

export const GRID_SIZE = 8;

export const RUNNER_SPEED = 2;
export const CHASER_SPEED = 3;

/** Pool of virtues from which 6 are randomly selected each game. */
export const VIRTUES = [
  'Kindness',
  'Generosity',
  'Truthfulness',
  'Courage',
  'Justice',
  'Patience',
  'Unity',
  'Love',
  'Compassion',
  'Humility',
] as const;

export type Virtue = (typeof VIRTUES)[number];

export interface VirtueZone {
  position: Position;
  virtue: Virtue;
  collected: boolean;
}

export interface PlayerState {
  position: Position;
  role: Role;
  collectedVirtues: Virtue[];
}

export interface GameState {
  gridSize: number;
  players: Record<Player, PlayerState>;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  virtueZones: VirtueZone[];
  /** The 'Home' tile — adjacent to the chaser's starting corner; never moves once placed. */
  home: Position;
  moveHistory: { player: Player; from: Position; to: Position }[];
  swapCount: number;
  /** Set to true on the turn a role swap just occurred, cleared on next move. */
  justSwapped: boolean;
  /**
   * Tile the runner just collected a virtue on; they remain safe here until
   * they move away (chaser cannot tag or land on this tile while it is set).
   */
  runnerSafePosition: Position | null;
  /** Which player starts as runner (1 = Abbee, 2 = Dot). Configurable in setup. */
  startingRunner: Player;
}
