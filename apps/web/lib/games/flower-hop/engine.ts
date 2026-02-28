import type { Bee, Flower, GameState, Gem } from './types';
import {
  BEE_HEIGHT,
  BEE_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FLOWER_GAP_X,
  FLOWER_MAX_Y,
  FLOWER_MIN_Y,
  FLOWER_PETAL_HEIGHT,
  FLOWER_WIDTH,
  GEM_SIZE,
  GRAVITY,
  DOUBLE_JUMP_FORCE,
  JUMP_FORCE,
  LEVEL_LENGTH,
  SCROLL_SPEED,
} from './types';

type RNG = () => number;

export class FlowerHopEngine {
  private state: GameState;
  private rng: RNG;

  constructor(rng: RNG = Math.random) {
    this.rng = rng;
    this.state = this.createInitialState();
  }

  /* ───────── State access ───────── */

  getState(): GameState {
    return {
      ...this.state,
      bee: { ...this.state.bee },
      flowers: this.state.flowers.map((f) => ({ ...f })),
      gems: this.state.gems.map((g) => ({ ...g })),
      scores: { ...this.state.scores },
    };
  }

  /* ───────── Level generation ───────── */

  private generateLevel(): { flowers: Flower[]; gems: Gem[] } {
    const flowers: Flower[] = [];
    const gems: Gem[] = [];

    for (let i = 0; i < LEVEL_LENGTH; i++) {
      const x = 80 + i * FLOWER_GAP_X;
      const y = FLOWER_MIN_Y + this.rng() * (FLOWER_MAX_Y - FLOWER_MIN_Y);
      flowers.push({ x, y, width: FLOWER_WIDTH });

      // ~60 % chance a gem spawns on this flower
      if (this.rng() < 0.6) {
        gems.push({
          x: x + FLOWER_WIDTH / 2 - GEM_SIZE / 2,
          y: y - GEM_SIZE - 4,
          collected: false,
        });
      }
    }
    return { flowers, gems };
  }

  /* ───────── Initial / reset state ───────── */

  private createInitialState(): GameState {
    const { flowers, gems } = this.generateLevel();
    const startFlower = flowers[0];
    return {
      status: 'idle',
      currentPlayer: 1,
      bee: {
        x: startFlower.x + startFlower.width / 2 - BEE_WIDTH / 2,
        y: startFlower.y - BEE_HEIGHT,
        vy: 0,
        onGround: true,
        jumpsUsed: 0,
      },
      flowers,
      gems,
      scores: { 1: 0, 2: 0 },
      scrollOffset: 0,
      winner: null,
      round: 1,
      started: false,
    };
  }

  /* ───────── Actions ───────── */

  /** Begin / resume the current player's round. */
  startRound(): void {
    if (this.state.status !== 'idle') return;
    this.state.status = 'running';
  }

  /** Make the bee jump (supports double-jump). */
  jump(): void {
    if (this.state.status !== 'running') return;
    if (this.state.bee.jumpsUsed >= 2) return;
    this.state.bee.vy =
      this.state.bee.jumpsUsed === 0 ? JUMP_FORCE : DOUBLE_JUMP_FORCE;
    this.state.bee.onGround = false;
    this.state.bee.jumpsUsed += 1;
    if (!this.state.started) {
      this.state.started = true;
    }
  }

  /**
   * Advance the simulation by one frame.
   * Call once per requestAnimationFrame (~16 ms).
   */
  tick(): void {
    if (this.state.status !== 'running') return;

    const bee = this.state.bee;

    // Before the first jump the bee sits on the first flower — no gravity, no scroll
    if (!this.state.started) {
      return;
    }

    // Apply gravity
    bee.vy += GRAVITY;
    bee.y += bee.vy;

    // Scroll world
    this.state.scrollOffset += SCROLL_SPEED;

    // Collision with flower tops
    bee.onGround = false;
    for (const flower of this.state.flowers) {
      if (this.collidesWithFlower(bee, flower, this.state.scrollOffset)) {
        bee.y = flower.y - BEE_HEIGHT;
        bee.vy = 0;
        bee.onGround = true;
        bee.jumpsUsed = 0;
        break;
      }
    }

    // Gem collection
    for (const gem of this.state.gems) {
      if (gem.collected) continue;
      if (this.collidesWithGem(bee, gem, this.state.scrollOffset)) {
        gem.collected = true;
        this.state.scores[this.state.currentPlayer]++;
      }
    }

    // Fell off the bottom
    if (bee.y > CANVAS_HEIGHT + BEE_HEIGHT) {
      this.endRound();
      return;
    }

    // Reached the end of the level (scrolled past all flowers)
    const lastFlower = this.state.flowers[this.state.flowers.length - 1];
    if (
      lastFlower &&
      this.state.scrollOffset >
        lastFlower.x + lastFlower.width + CANVAS_WIDTH / 2
    ) {
      this.endRound();
    }
  }

  /* ───────── Collision helpers ───────── */

  private collidesWithFlower(
    bee: Bee,
    flower: Flower,
    offset: number
  ): boolean {
    const fx = flower.x - offset;
    const beeBottom = bee.y + BEE_HEIGHT;
    const beeLeft = bee.x;
    const beeRight = bee.x + BEE_WIDTH;

    // Bee must be falling or standing, and within a narrow vertical band above the flower top
    if (bee.vy < 0) return false; // going up
    if (beeBottom < flower.y || beeBottom > flower.y + FLOWER_PETAL_HEIGHT)
      return false;
    if (beeRight < fx || beeLeft > fx + flower.width) return false;
    return true;
  }

  private collidesWithGem(bee: Bee, gem: Gem, offset: number): boolean {
    const gx = gem.x - offset;
    const gy = gem.y;
    const beeRight = bee.x + BEE_WIDTH;
    const beeBottom = bee.y + BEE_HEIGHT;

    if (beeRight < gx || bee.x > gx + GEM_SIZE) return false;
    if (beeBottom < gy || bee.y > gy + GEM_SIZE) return false;
    return true;
  }

  /* ───────── Round management ───────── */

  private endRound(): void {
    if (this.state.round === 1) {
      // Player 1 finished — set up for player 2
      this.state.round = 2;
      this.state.currentPlayer = 2;
      const { flowers, gems } = this.generateLevel();
      const startFlower = flowers[0];
      this.state.flowers = flowers;
      this.state.gems = gems;
      this.state.bee = {
        x: startFlower.x + startFlower.width / 2 - BEE_WIDTH / 2,
        y: startFlower.y - BEE_HEIGHT,
        vy: 0,
        onGround: true,
        jumpsUsed: 0,
      };
      this.state.scrollOffset = 0;
      this.state.status = 'idle';
      this.state.started = false;
    } else {
      // Both rounds done
      this.state.round = 3;
      this.state.status = 'ended';
      const s1 = this.state.scores[1];
      const s2 = this.state.scores[2];
      this.state.winner = s1 > s2 ? 1 : s2 > s1 ? 2 : null;
    }
  }

  /** Full reset to first player's turn. */
  reset(): void {
    this.state = this.createInitialState();
  }
}
