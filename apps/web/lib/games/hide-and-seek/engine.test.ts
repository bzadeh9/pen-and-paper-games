import { describe, it, expect, beforeEach } from 'vitest';
import { HideAndSeekEngine } from './engine';
import { GRID_SIZE, GEMS_TO_HIDE } from './types';

describe('HideAndSeekEngine', () => {
  let engine: HideAndSeekEngine;

  beforeEach(() => {
    engine = new HideAndSeekEngine();
  });

  describe('initialization', () => {
    it('should start in hiding phase', () => {
      expect(engine.getState().status).toBe('hiding');
    });

    it('should default hider to player 1 and seeker to player 2', () => {
      const state = engine.getState();
      expect(state.hider).toBe(1);
      expect(state.seeker).toBe(2);
    });

    it('should allow custom hider', () => {
      const eng = new HideAndSeekEngine(2);
      expect(eng.getState().hider).toBe(2);
      expect(eng.getState().seeker).toBe(1);
    });

    it('should have no gems hidden initially', () => {
      expect(engine.getState().hiddenGems).toHaveLength(0);
    });

    it('should have no guesses initially', () => {
      expect(engine.getState().guesses).toHaveLength(0);
    });
  });

  describe('hiding phase', () => {
    it('should allow placing a gem', () => {
      expect(engine.toggleHidingGem({ row: 0, col: 0 })).toBe(true);
      expect(engine.getState().hiddenGems).toHaveLength(1);
    });

    it('should allow toggling (removing) a placed gem', () => {
      engine.toggleHidingGem({ row: 0, col: 0 });
      engine.toggleHidingGem({ row: 0, col: 0 });
      expect(engine.getState().hiddenGems).toHaveLength(0);
    });

    it(`should allow up to ${GEMS_TO_HIDE} gems`, () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        expect(engine.toggleHidingGem({ row: 0, col: i })).toBe(true);
      }
      expect(engine.getState().hiddenGems).toHaveLength(GEMS_TO_HIDE);
    });

    it(`should reject a ${GEMS_TO_HIDE + 1}th gem`, () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleHidingGem({ row: 0, col: i });
      }
      expect(engine.toggleHidingGem({ row: 1, col: 0 })).toBe(false);
    });

    it('should reject out-of-bounds positions', () => {
      expect(engine.toggleHidingGem({ row: -1, col: 0 })).toBe(false);
      expect(engine.toggleHidingGem({ row: GRID_SIZE, col: 0 })).toBe(false);
    });

    it('should not confirm hiding with fewer than 4 gems', () => {
      engine.toggleHidingGem({ row: 0, col: 0 });
      expect(engine.confirmHiding()).toBe(false);
    });

    it('should confirm hiding when exactly 4 gems are placed', () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleHidingGem({ row: 0, col: i });
      }
      expect(engine.confirmHiding()).toBe(true);
      expect(engine.getState().status).toBe('transition');
    });
  });

  describe('transition phase', () => {
    beforeEach(() => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleHidingGem({ row: 0, col: i });
      }
      engine.confirmHiding();
    });

    it('should be in transition status', () => {
      expect(engine.getState().status).toBe('transition');
    });

    it('should advance to seeking phase via startSeeking', () => {
      engine.startSeeking();
      expect(engine.getState().status).toBe('seeking');
    });
  });

  describe('seeking phase', () => {
    beforeEach(() => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleHidingGem({ row: 0, col: i });
      }
      engine.confirmHiding();
      engine.startSeeking();
    });

    it('should allow selecting a cell', () => {
      expect(engine.toggleSelection({ row: 1, col: 0 })).toBe(true);
      expect(engine.getState().currentSelection).toHaveLength(1);
    });

    it('should allow deselecting a cell', () => {
      engine.toggleSelection({ row: 1, col: 0 });
      engine.toggleSelection({ row: 1, col: 0 });
      expect(engine.getState().currentSelection).toHaveLength(0);
    });

    it(`should allow up to ${GEMS_TO_HIDE} selections`, () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        expect(engine.toggleSelection({ row: 2, col: i })).toBe(true);
      }
    });

    it(`should reject ${GEMS_TO_HIDE + 1}th selection`, () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleSelection({ row: 2, col: i });
      }
      expect(engine.toggleSelection({ row: 3, col: 0 })).toBe(false);
    });

    it('should reject guess when fewer than 4 selected', () => {
      engine.toggleSelection({ row: 2, col: 0 });
      expect(engine.submitGuess()).toBe(-1);
    });

    it('should count correct guesses', () => {
      // Hidden gems are at row 0, cols 0-3
      // Guess all 4 correctly
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleSelection({ row: 0, col: i });
      }
      const correct = engine.submitGuess();
      expect(correct).toBe(GEMS_TO_HIDE);
    });

    it('should end game when all 4 found', () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleSelection({ row: 0, col: i });
      }
      engine.submitGuess();
      const state = engine.getState();
      expect(state.status).toBe('ended');
      expect(state.winner).toBe(state.seeker);
    });

    it('should count partial correct guesses', () => {
      // Hidden: row 0, cols 0-3. Guess 2 correct and 2 wrong.
      engine.toggleSelection({ row: 0, col: 0 }); // correct
      engine.toggleSelection({ row: 0, col: 1 }); // correct
      engine.toggleSelection({ row: 2, col: 2 }); // wrong
      engine.toggleSelection({ row: 3, col: 3 }); // wrong
      const correct = engine.submitGuess();
      expect(correct).toBe(2);
      expect(engine.getState().status).toBe('seeking');
    });

    it('should record guess history', () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleSelection({ row: 2, col: i });
      }
      engine.submitGuess();
      expect(engine.getState().guesses).toHaveLength(1);
    });

    it('should clear selection after guess', () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleSelection({ row: 2, col: i });
      }
      engine.submitGuess();
      expect(engine.getState().currentSelection).toHaveLength(0);
    });
  });

  describe('reset', () => {
    it('should reset to hiding phase', () => {
      for (let i = 0; i < GEMS_TO_HIDE; i++) {
        engine.toggleHidingGem({ row: 0, col: i });
      }
      engine.confirmHiding();
      engine.reset();
      const state = engine.getState();
      expect(state.status).toBe('hiding');
      expect(state.hiddenGems).toHaveLength(0);
      expect(state.guesses).toHaveLength(0);
    });

    it('should preserve hider after reset', () => {
      const eng = new HideAndSeekEngine(2);
      eng.reset();
      expect(eng.getState().hider).toBe(2);
    });
  });

  describe('switchRoles', () => {
    it('should swap hider and seeker', () => {
      const stateBefore = engine.getState();
      engine.switchRoles();
      const stateAfter = engine.getState();
      expect(stateAfter.hider).toBe(stateBefore.seeker);
      expect(stateAfter.seeker).toBe(stateBefore.hider);
    });

    it('should reset to hiding phase after switch', () => {
      engine.switchRoles();
      expect(engine.getState().status).toBe('hiding');
    });
  });

  describe('getState returns defensive copy', () => {
    it('should not allow mutation through getState', () => {
      engine.toggleHidingGem({ row: 0, col: 0 });
      const state = engine.getState();
      state.hiddenGems[0].row = 99;
      expect(engine.getState().hiddenGems[0].row).toBe(0);
    });
  });
});
