export type Player = 1 | 2;

export type GameStatus = 'idle' | 'running' | 'ended';

/* --------------- Constants --------------- */
export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 360;

export const GRAVITY = 0.6;
export const JUMP_FORCE = -11;
export const DOUBLE_JUMP_FORCE = -9.5;
export const SCROLL_SPEED = 3;

export const BEE_WIDTH = 30;
export const BEE_HEIGHT = 30;

export const FLOWER_WIDTH = 60;
export const FLOWER_PETAL_HEIGHT = 14;
export const FLOWER_STEM_HEIGHT = 40;

export const GEM_SIZE = 18;

/** Number of flowers generated for one round. */
export const LEVEL_LENGTH = 30;

/** Horizontal gap between consecutive flower centres (pixels). */
export const FLOWER_GAP_X = 120;

/** Min / max Y position for flower tops (from top of canvas). */
export const FLOWER_MIN_Y = 140;
export const FLOWER_MAX_Y = 280;

/* --------------- Interfaces --------------- */
export interface Bee {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  jumpsUsed: number;
}

export interface Flower {
  x: number;
  y: number;
  width: number;
}

export interface Gem {
  x: number;
  y: number;
  collected: boolean;
}

export interface RoundScore {
  gems: number;
}

export interface GameState {
  status: GameStatus;
  currentPlayer: Player;
  bee: Bee;
  flowers: Flower[];
  gems: Gem[];
  scores: Record<Player, number>;
  scrollOffset: number;
  winner: Player | null;
  /** Which round: 1 = player 1's turn, 2 = player 2's turn, 3 = both done */
  round: number;
  /** False until the player makes their first jump; scrolling begins after. */
  started: boolean;
}
