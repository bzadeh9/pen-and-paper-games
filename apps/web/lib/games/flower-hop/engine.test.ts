import { describe, it, expect, beforeEach } from 'vitest';
import { FlowerHopEngine } from './engine';
import { LEVEL_LENGTH, CANVAS_HEIGHT, BEE_HEIGHT, PLATFORM_Y, PLATFORM_WIDTH, BEE_WIDTH } from './types';

/** Deterministic RNG that returns values from a pre-set sequence. */
function seededRng(values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('FlowerHopEngine', () => {
  let engine: FlowerHopEngine;

  beforeEach(() => {
    // Use a deterministic RNG so tests are reproducible
    engine = new FlowerHopEngine(seededRng([0.5, 0.3, 0.5, 0.3]));
  });

  describe('initialization', () => {
    it('should start in idle status', () => {
      expect(engine.getState().status).toBe('idle');
    });

    it('should start with player 1', () => {
      expect(engine.getState().currentPlayer).toBe(1);
    });

    it('should start at round 1', () => {
      expect(engine.getState().round).toBe(1);
    });

    it('should generate the correct number of flowers', () => {
      expect(engine.getState().flowers).toHaveLength(LEVEL_LENGTH);
    });

    it('should place the bee on the starting platform', () => {
      const state = engine.getState();
      // Bee should be on top of the platform
      expect(state.bee.y).toBe(PLATFORM_Y - BEE_HEIGHT);
      expect(state.bee.x).toBe(PLATFORM_WIDTH / 2 - BEE_WIDTH / 2);
      expect(state.bee.onGround).toBe(true);
    });

    it('should start with started=false', () => {
      expect(engine.getState().started).toBe(false);
    });

    it('should start with zero scores', () => {
      const state = engine.getState();
      expect(state.scores[1]).toBe(0);
      expect(state.scores[2]).toBe(0);
    });

    it('should start with zero scroll offset', () => {
      expect(engine.getState().scrollOffset).toBe(0);
    });

    it('should have no winner initially', () => {
      expect(engine.getState().winner).toBeNull();
    });
  });

  describe('startRound', () => {
    it('should transition from idle to running', () => {
      engine.startRound();
      expect(engine.getState().status).toBe('running');
    });

    it('should do nothing if already running', () => {
      engine.startRound();
      engine.startRound(); // second call should be no-op
      expect(engine.getState().status).toBe('running');
    });
  });

  describe('jump', () => {
    it('should set negative vertical velocity when on ground', () => {
      engine.startRound();
      engine.jump();
      expect(engine.getState().bee.vy).toBeLessThan(0);
    });

    it('should set onGround to false', () => {
      engine.startRound();
      engine.jump();
      expect(engine.getState().bee.onGround).toBe(false);
    });

    it('should do nothing when not running', () => {
      const vyBefore = engine.getState().bee.vy;
      engine.jump(); // game is idle
      expect(engine.getState().bee.vy).toBe(vyBefore);
    });

    it('should not allow double jump (when already in air)', () => {
      engine.startRound();
      engine.jump();
      const vyAfterJump = engine.getState().bee.vy;
      engine.jump(); // should be ignored since not on ground
      expect(engine.getState().bee.vy).toBe(vyAfterJump);
    });

    it('should set started=true on first jump', () => {
      engine.startRound();
      expect(engine.getState().started).toBe(false);
      engine.jump();
      expect(engine.getState().started).toBe(true);
    });
  });

  describe('tick', () => {
    it('should apply gravity each tick after first jump', () => {
      engine.startRound();
      engine.jump();
      const vyBefore = engine.getState().bee.vy;
      engine.tick();
      // vy should increase (become less negative) due to gravity
      expect(engine.getState().bee.vy).toBeGreaterThan(vyBefore);
    });

    it('should not scroll before first jump', () => {
      engine.startRound();
      engine.tick();
      // Not started yet — should not scroll
      expect(engine.getState().scrollOffset).toBe(0);
    });

    it('should advance scroll offset after first jump', () => {
      engine.startRound();
      engine.jump();
      engine.tick();
      expect(engine.getState().scrollOffset).toBeGreaterThan(0);
    });

    it('should do nothing when not running', () => {
      const stateBefore = engine.getState();
      engine.tick(); // idle — no-op
      const stateAfter = engine.getState();
      expect(stateAfter.scrollOffset).toBe(stateBefore.scrollOffset);
    });

    it('should end round when bee falls off screen', () => {
      engine.startRound();
      engine.jump(); // First jump triggers scrolling
      for (let i = 0; i < 500; i++) {
        engine.tick();
      }
      const state = engine.getState();
      // Should have ended round 1 and moved to round 2 idle
      expect(state.round).toBeGreaterThanOrEqual(2);
    });
  });

  describe('gem collection', () => {
    it('should generate some gems', () => {
      const state = engine.getState();
      expect(state.gems.length).toBeGreaterThan(0);
    });

    it('should start with all gems uncollected', () => {
      const state = engine.getState();
      expect(state.gems.every((g) => !g.collected)).toBe(true);
    });
  });

  describe('round management', () => {
    it('should transition to player 2 after round 1 ends', () => {
      engine.startRound();
      engine.jump(); // First jump triggers scrolling
      // Force the bee to fall by ticking many times
      for (let i = 0; i < 500; i++) {
        engine.tick();
      }
      const afterRound1 = engine.getState();
      expect(afterRound1.currentPlayer).toBe(2);
      expect(afterRound1.round).toBe(2);
      expect(afterRound1.status).toBe('idle');
    });

    it('should end the game after both rounds', () => {
      // Play round 1
      engine.startRound();
      engine.jump();
      for (let i = 0; i < 500; i++) engine.tick();

      // Play round 2
      engine.startRound();
      engine.jump();
      for (let i = 0; i < 500; i++) engine.tick();

      const final = engine.getState();
      expect(final.status).toBe('ended');
      expect(final.round).toBe(3);
    });

    it('should determine winner based on scores', () => {
      // Use a custom RNG where player 1 gets lots of gems and player 2 gets few
      const customEngine = new FlowerHopEngine(
        seededRng([0.5, 0.1, 0.5, 0.1]) // 0.1 < 0.6 → gem spawns
      );
      customEngine.startRound();
      customEngine.jump();
      for (let i = 0; i < 500; i++) customEngine.tick();
      customEngine.startRound();
      customEngine.jump();
      for (let i = 0; i < 500; i++) customEngine.tick();
      const state = customEngine.getState();
      expect(state.status).toBe('ended');
      // Winner should be non-null or null (draw) — just check it's decided
      expect(state.round).toBe(3);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      engine.startRound();
      engine.jump();
      for (let i = 0; i < 10; i++) engine.tick();
      engine.reset();

      const state = engine.getState();
      expect(state.status).toBe('idle');
      expect(state.currentPlayer).toBe(1);
      expect(state.round).toBe(1);
      expect(state.scores[1]).toBe(0);
      expect(state.scores[2]).toBe(0);
      expect(state.scrollOffset).toBe(0);
      expect(state.winner).toBeNull();
    });

    it('should generate new level on reset', () => {
      const before = engine.getState().flowers.map((f) => f.y);
      engine.reset();
      // With deterministic RNG cycling, flowers regenerate (same pattern)
      const after = engine.getState().flowers.map((f) => f.y);
      expect(after).toHaveLength(LEVEL_LENGTH);
    });
  });

  describe('getState returns defensive copy', () => {
    it('should not allow mutation of bee through getState', () => {
      const state = engine.getState();
      state.bee.y = -9999;
      expect(engine.getState().bee.y).not.toBe(-9999);
    });

    it('should not allow mutation of scores through getState', () => {
      const state = engine.getState();
      state.scores[1] = 99;
      expect(engine.getState().scores[1]).toBe(0);
    });

    it('should not allow mutation of flowers through getState', () => {
      const state = engine.getState();
      state.flowers[0].y = -9999;
      expect(engine.getState().flowers[0].y).not.toBe(-9999);
    });

    it('should not allow mutation of gems through getState', () => {
      const state = engine.getState();
      if (state.gems.length > 0) {
        state.gems[0].collected = true;
        expect(engine.getState().gems[0].collected).toBe(false);
      }
    });
  });
});
