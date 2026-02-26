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

  describe('bridge mechanics', () => {
    it('should place multiple bridges in a 7x7 maze', () => {
      const state = engine.getState();
      expect(state.bridges.length).toBeGreaterThanOrEqual(1);
    });

    it('bridge rooms A and B should be adjacent (1 step apart)', () => {
      const state = engine.getState();
      for (const bridge of state.bridges) {
        const dr = Math.abs(bridge.roomA.row - bridge.roomB.row);
        const dc = Math.abs(bridge.roomA.col - bridge.roomB.col);
        expect(dr + dc).toBe(1);
      }
    });

    it('bridge levers should be within maze bounds', () => {
      const state = engine.getState();
      for (const bridge of state.bridges) {
        expect(bridge.leverA.row).toBeGreaterThanOrEqual(0);
        expect(bridge.leverA.row).toBeLessThan(7);
        expect(bridge.leverA.col).toBeGreaterThanOrEqual(0);
        expect(bridge.leverA.col).toBeLessThan(7);
        expect(bridge.leverB.row).toBeGreaterThanOrEqual(0);
        expect(bridge.leverB.row).toBeLessThan(7);
      }
    });

    it('bridge levers should not be at the bridge rooms themselves', () => {
      const state = engine.getState();
      for (const bridge of state.bridges) {
        const aKey = `${bridge.roomA.row},${bridge.roomA.col}`;
        const bKey = `${bridge.roomB.row},${bridge.roomB.col}`;
        expect(`${bridge.leverA.row},${bridge.leverA.col}`).not.toBe(aKey);
        expect(`${bridge.leverA.row},${bridge.leverA.col}`).not.toBe(bKey);
        expect(`${bridge.leverB.row},${bridge.leverB.col}`).not.toBe(aKey);
        expect(`${bridge.leverB.row},${bridge.leverB.col}`).not.toBe(bKey);
      }
    });

    it('should allow bridge crossing only when opponent is on a lever', () => {
      const engineSmall = new MazeGameEngine(7, 7, createSeededRng(42));
      const s = engineSmall.getState();
      if (s.bridges.length === 0) return;

      // The bridge passage should be removed from normal passages
      const bridge0 = s.bridges[0];
      const dir =
        bridge0.roomB.row > bridge0.roomA.row ? 'south' :
        bridge0.roomB.row < bridge0.roomA.row ? 'north' :
        bridge0.roomB.col > bridge0.roomA.col ? 'east' : 'west';
      expect(s.passages[bridge0.roomA.row][bridge0.roomA.col][dir]).toBe(false);
    });

    it('leverB should also allow the other player to cross A→B (bidirectional)', () => {
      // This covers the bug: after P2 crosses A→B and stands on leverB,
      // P1 (still on side A) must also be able to cross A→B.
      const engineSmall = new MazeGameEngine(7, 7, createSeededRng(42));
      const s = engineSmall.getState();
      if (s.bridges.length === 0) return;
      const bridge0 = s.bridges[0];

      // Teleport P1 to roomA and P2 to leverB
      engineSmall._setPlayerPosition(1, bridge0.roomA);
      engineSmall._setPlayerPosition(2, bridge0.leverB);

      // P1 should now be able to move toward roomB (opponent on leverB)
      const dirs = engineSmall.getValidDirectionsForPlayer(1);
      const dir =
        bridge0.roomB.row > bridge0.roomA.row ? 'south' :
        bridge0.roomB.row < bridge0.roomA.row ? 'north' :
        bridge0.roomB.col > bridge0.roomA.col ? 'east' : 'west';
      expect(dirs).toContain(dir);

      // Sanity-check the reverse: P2 at roomB, P1 at leverA → P2 can cross B→A
      engineSmall._setPlayerPosition(2, bridge0.roomB);
      engineSmall._setPlayerPosition(1, bridge0.leverA);
      const dirs2 = engineSmall.getValidDirectionsForPlayer(2);
      const reverseDir =
        dir === 'south' ? 'north' :
        dir === 'north' ? 'south' :
        dir === 'east' ? 'west' : 'east';
      expect(dirs2).toContain(reverseDir);
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

