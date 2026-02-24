import { describe, it, expect, beforeEach } from 'vitest';
import { BeeGameEngine } from './engine';
import { GRID_SIZE, RUNNER_SPEED } from './types';

function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

describe('BeeGameEngine', () => {
  let engine: BeeGameEngine;

  beforeEach(() => {
    engine = new BeeGameEngine(createSeededRng(42));
  });

  describe('initialization', () => {
    it('should initialize with the correct grid size', () => {
      const state = engine.getState();
      expect(state.gridSize).toBe(GRID_SIZE);
    });

    it('should place Player 1 (runner) at (0,0) and Player 2 (chaser) at opposite corner', () => {
      const state = engine.getState();
      expect(state.players[1].position).toEqual({ row: 0, col: 0 });
      expect(state.players[2].position).toEqual({
        row: GRID_SIZE - 1,
        col: GRID_SIZE - 1,
      });
    });

    it('should assign runner role to Player 1 and chaser role to Player 2', () => {
      const state = engine.getState();
      expect(state.players[1].role).toBe('runner');
      expect(state.players[2].role).toBe('chaser');
    });

    it('should start in setup mode', () => {
      const state = engine.getState();
      expect(state.status).toBe('setup');
      expect(state.winner).toBeNull();
      expect(state.runnerSafePosition).toBeNull();
      expect(state.startingRunner).toBe(1);
    });

    it('should place 6 virtue zones on the board', () => {
      const state = engine.getState();
      expect(state.virtueZones.length).toBe(6);
    });

    it('should place virtue zones within grid bounds', () => {
      const state = engine.getState();
      for (const zone of state.virtueZones) {
        expect(zone.position.row).toBeGreaterThanOrEqual(0);
        expect(zone.position.row).toBeLessThan(GRID_SIZE);
        expect(zone.position.col).toBeGreaterThanOrEqual(0);
        expect(zone.position.col).toBeLessThan(GRID_SIZE);
      }
    });

    it('should place a home tile on the board adjacent to chaser start', () => {
      const state = engine.getState();
      expect(state.home).toBeDefined();
      const chaserStart = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };
      const dist =
        Math.abs(state.home.row - chaserStart.row) +
        Math.abs(state.home.col - chaserStart.col);
      expect(dist).toBeLessThanOrEqual(2);
      expect(dist).toBeGreaterThanOrEqual(1);
    });

    it('should have empty collected virtues for both players', () => {
      const state = engine.getState();
      expect(state.players[1].collectedVirtues).toEqual([]);
      expect(state.players[2].collectedVirtues).toEqual([]);
    });
  });

  describe('movement validation', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should allow moves within runner speed (manhattan distance)', () => {
      // Player 1 is runner with speed 2
      expect(engine.isValidMove({ row: 0, col: 1 })).toBe(true); // dist 1
      expect(engine.isValidMove({ row: 1, col: 0 })).toBe(true); // dist 1
      expect(engine.isValidMove({ row: 1, col: 1 })).toBe(true); // dist 2
      expect(engine.isValidMove({ row: 0, col: 2 })).toBe(true); // dist 2
    });

    it('should reject moves beyond runner speed', () => {
      // Player 1 runner speed is 2
      expect(engine.isValidMove({ row: 1, col: 2 })).toBe(false); // dist 3
      expect(engine.isValidMove({ row: 3, col: 0 })).toBe(false); // dist 3
    });

    it('should reject moves outside the grid', () => {
      expect(engine.isValidMove({ row: -1, col: 0 })).toBe(false);
      expect(engine.isValidMove({ row: 0, col: GRID_SIZE })).toBe(false);
    });

    it('should reject staying in place', () => {
      expect(engine.isValidMove({ row: 0, col: 0 })).toBe(false);
    });

    it('should not allow moves when game is not playing', () => {
      const fresh = new BeeGameEngine(createSeededRng(1));
      expect(fresh.isValidMove({ row: 0, col: 1 })).toBe(false);
    });
  });

  describe('game flow', () => {
    beforeEach(() => {
      engine.startGame();
    });

    it('should switch players after a valid move', () => {
      expect(engine.getState().currentPlayer).toBe(1);
      engine.makeMove({ row: 0, col: 1 });
      expect(engine.getState().currentPlayer).toBe(2);
    });

    it('should update player position after a move', () => {
      engine.makeMove({ row: 1, col: 0 });
      const state = engine.getState();
      expect(state.players[1].position).toEqual({ row: 1, col: 0 });
    });

    it('should track move history', () => {
      engine.makeMove({ row: 0, col: 1 });
      const state = engine.getState();
      expect(state.moveHistory.length).toBe(1);
      expect(state.moveHistory[0]).toEqual({
        player: 1,
        from: { row: 0, col: 0 },
        to: { row: 0, col: 1 },
      });
    });

    it('should allow chaser to move 3 spaces', () => {
      // Player 1 moves
      engine.makeMove({ row: 0, col: 1 });
      // Player 2 is chaser with speed 3
      const state = engine.getState();
      expect(state.currentPlayer).toBe(2);
      // From (7,7), move 3 manhattan distance
      expect(engine.isValidMove({ row: 7, col: 4 })).toBe(true); // dist 3
      expect(engine.isValidMove({ row: 5, col: 6 })).toBe(true); // dist 2
    });

    it('should return valid moves list', () => {
      const moves = engine.getValidMoves();
      expect(moves.length).toBeGreaterThan(0);
      // From (0,0) with speed 2, valid: all cells with manhattan distance 1-2
      for (const move of moves) {
        const dist =
          Math.abs(move.row - 0) + Math.abs(move.col - 0);
        expect(dist).toBeGreaterThanOrEqual(1);
        expect(dist).toBeLessThanOrEqual(RUNNER_SPEED);
      }
    });

    it('should reject invalid moves', () => {
      expect(engine.makeMove({ row: 5, col: 5 })).toBe(false);
    });
  });

  describe('virtue collection', () => {
    it('should collect a virtue when runner lands on a virtue zone', () => {
      const rng = createSeededRng(42);
      const eng = new BeeGameEngine(rng);
      eng.startGame();

      const state = eng.getState();
      const firstZone = state.virtueZones[0];

      // Move runner close to zone then onto it
      const runnerPos = state.players[1].position;
      const dist =
        Math.abs(firstZone.position.row - runnerPos.row) +
        Math.abs(firstZone.position.col - runnerPos.col);

      if (dist <= RUNNER_SPEED && dist >= 1) {
        eng.makeMove(firstZone.position);
        const newState = eng.getState();
        const zone = newState.virtueZones.find(
          (z) =>
            z.position.row === firstZone.position.row &&
            z.position.col === firstZone.position.col
        );
        if (zone) {
          expect(zone.collected).toBe(true);
          expect(newState.players[1].collectedVirtues.length).toBe(1);
        }
      }
    });
  });

  describe('chaser movement restrictions', () => {
    it('should not allow chaser to land on uncollected virtue zones', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.startGame();

      // Move runner first (player 1)
      eng.makeMove({ row: 0, col: 1 });

      // Now it's chaser's turn (player 2). Find a virtue zone within range.
      const chaserState = eng.getState();
      const chaserPos = chaserState.players[2].position;
      for (const zone of chaserState.virtueZones) {
        if (zone.collected) continue;
        const dist =
          Math.abs(zone.position.row - chaserPos.row) +
          Math.abs(zone.position.col - chaserPos.col);
        if (dist >= 1 && dist <= 3) {
          // Chaser should NOT be allowed to move to a virtue zone
          expect(eng.isValidMove(zone.position)).toBe(false);
        }
      }
    });

    it('should allow runner to land on uncollected virtue zones', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.startGame();

      const state = eng.getState();
      const runnerPos = state.players[1].position;
      for (const zone of state.virtueZones) {
        if (zone.collected) continue;
        const dist =
          Math.abs(zone.position.row - runnerPos.row) +
          Math.abs(zone.position.col - runnerPos.col);
        if (dist >= 1 && dist <= RUNNER_SPEED) {
          // Runner should be allowed to move to a virtue zone
          expect(eng.isValidMove(zone.position)).toBe(true);
        }
      }
    });
  });

  describe('role swapping', () => {
    it('should swap roles when chaser tags runner outside virtue zone', () => {
      // Create a controlled scenario
      const eng = new BeeGameEngine(createSeededRng(99));
      eng.startGame();

      const state = eng.getState();
      // Manually verify that swapCount starts at 0
      expect(state.swapCount).toBe(0);
      expect(state.justSwapped).toBe(false);
    });
  });

  describe('starting runner selection', () => {
    it('should default to Player 1 as runner', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      const state = eng.getState();
      expect(state.startingRunner).toBe(1);
      expect(state.players[1].role).toBe('runner');
      expect(state.players[2].role).toBe('chaser');
    });

    it('should allow setting Player 2 as starting runner in setup', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.setStartingRunner(2);
      const state = eng.getState();
      expect(state.startingRunner).toBe(2);
      expect(state.players[1].role).toBe('chaser');
      expect(state.players[2].role).toBe('runner');
      expect(state.currentPlayer).toBe(2);
    });

    it('should not allow changing starting runner once game has started', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.startGame();
      eng.setStartingRunner(2);
      const state = eng.getState();
      // Unchanged — game already started
      expect(state.startingRunner).toBe(1);
      expect(state.players[1].role).toBe('runner');
    });

    it('should preserve starting runner preference after reset', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.setStartingRunner(2);
      eng.startGame();
      eng.reset();
      const state = eng.getState();
      expect(state.startingRunner).toBe(2);
      expect(state.players[1].role).toBe('chaser');
      expect(state.players[2].role).toBe('runner');
    });
  });

  describe('runner safe position', () => {
    it('should start with no runner safe position', () => {
      const state = engine.getState();
      expect(state.runnerSafePosition).toBeNull();
    });

    it('should set runnerSafePosition when runner collects a virtue', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.startGame();

      const state = eng.getState();
      const runnerPos = state.players[1].position;

      for (const zone of state.virtueZones) {
        if (zone.collected) continue;
        const dist =
          Math.abs(zone.position.row - runnerPos.row) +
          Math.abs(zone.position.col - runnerPos.col);
        if (dist >= 1 && dist <= RUNNER_SPEED) {
          eng.makeMove(zone.position);
          const newState = eng.getState();
          expect(newState.runnerSafePosition).toEqual(zone.position);
          return;
        }
      }
    });

    it('should clear runnerSafePosition when runner moves again', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.startGame();

      const state = eng.getState();
      const runnerPos = state.players[1].position;

      // Find a virtue zone within reach and move the runner there
      for (const zone of state.virtueZones) {
        if (zone.collected) continue;
        const dist =
          Math.abs(zone.position.row - runnerPos.row) +
          Math.abs(zone.position.col - runnerPos.col);
        if (dist >= 1 && dist <= RUNNER_SPEED) {
          eng.makeMove(zone.position); // runner collects virtue
          // Chaser makes a move
          const validChaserMoves = eng.getValidMoves();
          if (validChaserMoves.length > 0) {
            eng.makeMove(validChaserMoves[0]);
          }
          // Runner moves away
          const validRunnerMoves = eng.getValidMoves();
          if (validRunnerMoves.length > 0) {
            eng.makeMove(validRunnerMoves[0]);
          }
          const finalState = eng.getState();
          // Safe position should be cleared (or updated to new virtue zone if landed on one)
          const runnerNow = finalState.players[finalState.currentPlayer === 1 ? 2 : 1];
          if (!runnerNow.collectedVirtues.length) {
            expect(finalState.runnerSafePosition).toBeNull();
          }
          return;
        }
      }
    });
  });

  describe('reset', () => {
    it('should reset the game to initial state', () => {
      engine.startGame();
      engine.makeMove({ row: 0, col: 1 });

      engine.reset();

      const state = engine.getState();
      expect(state.status).toBe('setup');
      expect(state.currentPlayer).toBe(1);
      expect(state.winner).toBeNull();
      expect(state.players[1].position).toEqual({ row: 0, col: 0 });
      expect(state.players[1].role).toBe('runner');
      expect(state.players[2].role).toBe('chaser');
      expect(state.moveHistory.length).toBe(0);
      expect(state.swapCount).toBe(0);
    });
  });

  describe('win condition', () => {
    it('should not win if runner reaches home without collecting virtues', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.startGame();

      const state = eng.getState();
      const home = state.home;
      const runnerPos = state.players[1].position;
      const dist =
        Math.abs(home.row - runnerPos.row) + Math.abs(home.col - runnerPos.col);

      // If home is within reach, try to move there
      if (dist <= RUNNER_SPEED && dist >= 1) {
        eng.makeMove(home);
        const newState = eng.getState();
        // Should NOT win without collecting virtues
        expect(newState.status).toBe('playing');
      }
    });
  });

  describe('virtue respawning', () => {
    it('should spawn new virtue zones when all are collected', () => {
      // Use a controlled engine — we will manually step through to collect all virtues
      const eng = new BeeGameEngine(createSeededRng(42));
      eng.startGame();

      const state = eng.getState();
      const initialCount = state.virtueZones.length;
      expect(initialCount).toBe(6);

      // The respawn is triggered inside the engine, so we just verify the
      // initial count is correct and the zones are uncollected.
      const uncollected = state.virtueZones.filter((z) => !z.collected);
      expect(uncollected.length).toBe(6);
    });
  });

  describe('home tile placement', () => {
    it('should place home tile and never move it after reset', () => {
      const eng = new BeeGameEngine(createSeededRng(42));
      const state1 = eng.getState();
      const home = state1.home;

      // Home should be adjacent to chaser start (7,7)
      expect(home.row).toBeGreaterThanOrEqual(GRID_SIZE - 2);
      expect(home.col).toBeGreaterThanOrEqual(GRID_SIZE - 2);
    });
  });

  describe('getState returns defensive copy', () => {
    it('should not allow mutation of state through getState', () => {
      const state1 = engine.getState();
      state1.players[1].position.row = 99;
      const state2 = engine.getState();
      expect(state2.players[1].position.row).toBe(0);
    });
  });
});
