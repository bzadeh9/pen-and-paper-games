import { describe, it, expect, beforeEach } from 'vitest';
import { MazeGameEngine } from './engine';
import type { Direction } from './types';

function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const DIR_DELTA: Record<Direction, { dr: number; dc: number }> = {
  north: { dr: -1, dc: 0 },
  south: { dr: 1, dc: 0 },
  east: { dr: 0, dc: 1 },
  west: { dr: 0, dc: -1 },
};

describe('MazeGameEngine', () => {
  let engine: MazeGameEngine;

  beforeEach(() => {
    engine = new MazeGameEngine(7, 7, createSeededRng(42));
  });

  describe('initialization', () => {
    it('should initialize with the correct dimensions', () => {
      const state = engine.getState();
      expect(state.rows).toBe(7);
      expect(state.cols).toBe(7);
    });

    it('should place both players at the start position (0,0)', () => {
      const state = engine.getState();
      expect(state.players[1]).toEqual({ row: 0, col: 0 });
      expect(state.players[2]).toEqual({ row: 0, col: 0 });
    });

    it('should set start at (0,0) and end at bottom-right corner', () => {
      const state = engine.getState();
      expect(state.startPos).toEqual({ row: 0, col: 0 });
      expect(state.endPos).toEqual({ row: 6, col: 6 });
    });

    it('should start in playing status', () => {
      const state = engine.getState();
      expect(state.status).toBe('playing');
    });

    it('should have no reachedEnd players initially', () => {
      const state = engine.getState();
      expect(state.reachedEnd).toEqual([]);
    });

    it('should not have a currentPlayer field (simultaneous movement)', () => {
      const state = engine.getState();
      expect((state as Record<string, unknown>).currentPlayer).toBeUndefined();
    });

    it('should generate passages (maze has connections from start)', () => {
      const state = engine.getState();
      const startPassages = state.passages[0][0];
      const hasAnyPassage =
        startPassages.north ||
        startPassages.south ||
        startPassages.east ||
        startPassages.west;
      expect(hasAnyPassage).toBe(true);
    });

    it('should support configurable maze sizes', () => {
      const small = new MazeGameEngine(5, 5, createSeededRng(1));
      expect(small.getState().rows).toBe(5);
      expect(small.getState().cols).toBe(5);

      const large = new MazeGameEngine(9, 9, createSeededRng(1));
      expect(large.getState().rows).toBe(9);
      expect(large.getState().cols).toBe(9);
    });
  });

  describe('multiple paths', () => {
    it('should have extra passages beyond a perfect maze (multiple paths)', () => {
      const state = engine.getState();
      // Count total open passages (each bidirectional passage counted once)
      let passageCount = 0;
      for (let r = 0; r < state.rows; r++) {
        for (let c = 0; c < state.cols; c++) {
          if (state.passages[r][c].east) passageCount++;
          if (state.passages[r][c].south) passageCount++;
        }
      }
      // A perfect maze on rows*cols cells has exactly rows*cols-1 passages
      // With extra passages, we should have more
      const perfectCount = state.rows * state.cols - 1;
      expect(passageCount).toBeGreaterThan(perfectCount);
    });
  });

  describe('getValidDirectionsForPlayer', () => {
    it('should return at least one valid direction from the start for each player', () => {
      expect(engine.getValidDirectionsForPlayer(1).length).toBeGreaterThan(0);
      expect(engine.getValidDirectionsForPlayer(2).length).toBeGreaterThan(0);
    });

    it('should only return valid Direction values', () => {
      const valid = new Set(['north', 'south', 'east', 'west']);
      for (const dir of engine.getValidDirectionsForPlayer(1)) {
        expect(valid.has(dir)).toBe(true);
      }
    });

    it('should return empty array when game is ended', () => {
      // End the game by reaching the end with both players
      const smallEngine = new MazeGameEngine(1, 2, createSeededRng(1));
      // 1x2 maze: passages exist between (0,0) and (0,1)
      const dirs1 = smallEngine.getValidDirectionsForPlayer(1);
      if (dirs1.includes('east')) {
        smallEngine.movePlayer(1, 'east'); // P1 at end
        smallEngine.movePlayer(2, 'east'); // P2 at end → game over
        expect(smallEngine.getValidDirectionsForPlayer(1)).toEqual([]);
      }
    });
  });

  describe('movePlayer', () => {
    it('should reject moves in blocked directions', () => {
      const allDirs: Direction[] = ['north', 'south', 'east', 'west'];
      const validDirs = new Set(engine.getValidDirectionsForPlayer(1));
      const blockedDirs = allDirs.filter((d) => !validDirs.has(d));
      if (blockedDirs.length > 0) {
        const result = engine.movePlayer(1, blockedDirs[0]);
        expect(result).toBe(false);
        expect(engine.getState().players[1]).toEqual({ row: 0, col: 0 });
      }
    });

    it('should accept a valid move and update position', () => {
      const dirs = engine.getValidDirectionsForPlayer(1);
      expect(dirs.length).toBeGreaterThan(0);
      const dir = dirs[0];
      const result = engine.movePlayer(1, dir);
      expect(result).toBe(true);
      const { dr, dc } = DIR_DELTA[dir];
      expect(engine.getState().players[1]).toEqual({ row: dr, col: dc });
    });

    it('should NOT affect the other player', () => {
      const dirs = engine.getValidDirectionsForPlayer(1);
      engine.movePlayer(1, dirs[0]);
      expect(engine.getState().players[2]).toEqual({ row: 0, col: 0 });
    });

    it('both players can move independently', () => {
      const p1Dirs = engine.getValidDirectionsForPlayer(1);
      const p2Dirs = engine.getValidDirectionsForPlayer(2);
      engine.movePlayer(1, p1Dirs[0]);
      engine.movePlayer(2, p2Dirs[0]);
      const state = engine.getState();
      const { dr: dr1, dc: dc1 } = DIR_DELTA[p1Dirs[0]];
      const { dr: dr2, dc: dc2 } = DIR_DELTA[p2Dirs[0]];
      expect(state.players[1]).toEqual({ row: dr1, col: dc1 });
      expect(state.players[2]).toEqual({ row: dr2, col: dc2 });
    });

    it('should record move history', () => {
      const dirs = engine.getValidDirectionsForPlayer(1);
      engine.movePlayer(1, dirs[0]);
      const state = engine.getState();
      expect(state.moveHistory).toHaveLength(1);
      expect(state.moveHistory[0].player).toBe(1);
      expect(state.moveHistory[0].from).toEqual({ row: 0, col: 0 });
    });
  });

  describe('gate mechanics', () => {
    it('should place multiple gates in a 7x7 maze', () => {
      const state = engine.getState();
      expect(state.gates.length).toBeGreaterThanOrEqual(1);
    });

    it('gate rooms A and B should be adjacent (1 step apart)', () => {
      const state = engine.getState();
      for (const gate of state.gates) {
        const dr = Math.abs(gate.roomA.row - gate.roomB.row);
        const dc = Math.abs(gate.roomA.col - gate.roomB.col);
        expect(dr + dc).toBe(1);
      }
    });

    it('gate keys should be within maze bounds', () => {
      const state = engine.getState();
      for (const gate of state.gates) {
        expect(gate.keyA.row).toBeGreaterThanOrEqual(0);
        expect(gate.keyA.row).toBeLessThan(7);
        expect(gate.keyA.col).toBeGreaterThanOrEqual(0);
        expect(gate.keyA.col).toBeLessThan(7);
        expect(gate.keyB.row).toBeGreaterThanOrEqual(0);
        expect(gate.keyB.row).toBeLessThan(7);
      }
    });

    it('gate keys should not be at the gate rooms themselves', () => {
      const state = engine.getState();
      for (const gate of state.gates) {
        const aKey = `${gate.roomA.row},${gate.roomA.col}`;
        const bKey = `${gate.roomB.row},${gate.roomB.col}`;
        expect(`${gate.keyA.row},${gate.keyA.col}`).not.toBe(aKey);
        expect(`${gate.keyA.row},${gate.keyA.col}`).not.toBe(bKey);
        expect(`${gate.keyB.row},${gate.keyB.col}`).not.toBe(aKey);
        expect(`${gate.keyB.row},${gate.keyB.col}`).not.toBe(bKey);
      }
    });

    it('should allow gate crossing only when opponent is on a key', () => {
      const engineSmall = new MazeGameEngine(7, 7, createSeededRng(42));
      const s = engineSmall.getState();
      if (s.gates.length === 0) return;

      // The gate passage should be removed from normal passages
      const gate0 = s.gates[0];
      const dir =
        gate0.roomB.row > gate0.roomA.row ? 'south' :
        gate0.roomB.row < gate0.roomA.row ? 'north' :
        gate0.roomB.col > gate0.roomA.col ? 'east' : 'west';
      expect(s.passages[gate0.roomA.row][gate0.roomA.col][dir]).toBe(false);
    });

    it('gate keys should be reachable from their gate rooms via normal passages (no soft locks)', () => {
      const state = engine.getState();
      for (const gate of state.gates) {
        // keyA must be reachable from roomA using only normal passages
        // (i.e., with all gate gaps already removed from passages)
        const pathToKeyA = engine._bfsPath(
          state.rows,
          state.cols,
          state.passages,
          gate.roomA,
          gate.keyA
        );
        expect(pathToKeyA.length).toBeGreaterThan(0);

        // keyB must be reachable from roomB using only normal passages
        const pathToKeyB = engine._bfsPath(
          state.rows,
          state.cols,
          state.passages,
          gate.roomB,
          gate.keyB
        );
        expect(pathToKeyB.length).toBeGreaterThan(0);
      }
    });

    it('keys are never locked behind another gate across many random seeds', () => {
      for (let seed = 1; seed <= 50; seed++) {
        const e = new MazeGameEngine(7, 7, createSeededRng(seed));
        const state = e.getState();
        for (const gate of state.gates) {
          const pathToKeyA = e._bfsPath(
            state.rows,
            state.cols,
            state.passages,
            gate.roomA,
            gate.keyA
          );
          expect(pathToKeyA.length).toBeGreaterThan(0);

          const pathToKeyB = e._bfsPath(
            state.rows,
            state.cols,
            state.passages,
            gate.roomB,
            gate.keyB
          );
          expect(pathToKeyB.length).toBeGreaterThan(0);
        }
      }
    });

    it('keyB should also allow the other player to cross A→B (bidirectional)', () => {
      const engineSmall = new MazeGameEngine(7, 7, createSeededRng(42));
      const s = engineSmall.getState();
      if (s.gates.length === 0) return;
      const gate0 = s.gates[0];

      // Teleport P1 to roomA and P2 to keyB
      engineSmall._setPlayerPosition(1, gate0.roomA);
      engineSmall._setPlayerPosition(2, gate0.keyB);

      // P1 should now be able to move toward roomB (opponent on keyB)
      const dirs = engineSmall.getValidDirectionsForPlayer(1);
      const dir =
        gate0.roomB.row > gate0.roomA.row ? 'south' :
        gate0.roomB.row < gate0.roomA.row ? 'north' :
        gate0.roomB.col > gate0.roomA.col ? 'east' : 'west';
      expect(dirs).toContain(dir);

      // Sanity-check the reverse: P2 at roomB, P1 at keyA → P2 can cross B→A
      engineSmall._setPlayerPosition(2, gate0.roomB);
      engineSmall._setPlayerPosition(1, gate0.keyA);
      const dirs2 = engineSmall.getValidDirectionsForPlayer(2);
      const reverseDir =
        dir === 'south' ? 'north' :
        dir === 'north' ? 'south' :
        dir === 'east' ? 'west' : 'east';
      expect(dirs2).toContain(reverseDir);
    });
  });

  describe('decoy keys', () => {
    it('should place decoy keys in the maze', () => {
      const state = engine.getState();
      expect(state.decoyKeys.length).toBeGreaterThanOrEqual(2);
    });

    it('decoy keys should not overlap with gates, keys, start, or end', () => {
      const state = engine.getState();
      const taken = new Set<string>([
        `${state.startPos.row},${state.startPos.col}`,
        `${state.endPos.row},${state.endPos.col}`,
        ...state.gates.flatMap((g) => [
          `${g.roomA.row},${g.roomA.col}`,
          `${g.roomB.row},${g.roomB.col}`,
          `${g.keyA.row},${g.keyA.col}`,
          `${g.keyB.row},${g.keyB.col}`,
        ]),
      ]);
      for (const dk of state.decoyKeys) {
        expect(taken.has(`${dk.row},${dk.col}`)).toBe(false);
      }
    });

    it('decoy keys should be within maze bounds', () => {
      const state = engine.getState();
      for (const dk of state.decoyKeys) {
        expect(dk.row).toBeGreaterThanOrEqual(0);
        expect(dk.row).toBeLessThan(state.rows);
        expect(dk.col).toBeGreaterThanOrEqual(0);
        expect(dk.col).toBeLessThan(state.cols);
      }
    });
  });

  describe('win condition', () => {
    it('should NOT end game when only one player reaches end', () => {
      const tinyEngine = new MazeGameEngine(1, 2, createSeededRng(1));
      const dirs1 = tinyEngine.getValidDirectionsForPlayer(1);
      if (dirs1.includes('east')) {
        tinyEngine.movePlayer(1, 'east');
        expect(tinyEngine.getState().reachedEnd).toContain(1);
        expect(tinyEngine.getState().status).toBe('playing');
      }
    });

    it('should end game when both players reach end', () => {
      const tinyEngine = new MazeGameEngine(1, 2, createSeededRng(1));
      const dirs1 = tinyEngine.getValidDirectionsForPlayer(1);
      if (dirs1.includes('east')) {
        tinyEngine.movePlayer(1, 'east');
        tinyEngine.movePlayer(2, 'east');
        expect(tinyEngine.getState().status).toBe('ended');
        expect(tinyEngine.getState().reachedEnd).toContain(1);
        expect(tinyEngine.getState().reachedEnd).toContain(2);
      }
    });
  });

  describe('reset', () => {
    it('should reset the game to initial state', () => {
      const dirs = engine.getValidDirectionsForPlayer(1);
      engine.movePlayer(1, dirs[0]);
      engine.reset();
      const state = engine.getState();
      expect(state.players[1]).toEqual({ row: 0, col: 0 });
      expect(state.players[2]).toEqual({ row: 0, col: 0 });
      expect(state.status).toBe('playing');
      expect(state.reachedEnd).toEqual([]);
      expect(state.moveHistory).toEqual([]);
    });
  });
});
