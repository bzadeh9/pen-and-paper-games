import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getGameStatistics,
  saveGameStatistics,
  recordGame,
  resetStatistics,
} from './stats';

describe('Game Statistics', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getGameStatistics', () => {
    it('should return default stats when localStorage is empty', () => {
      const stats = getGameStatistics();
      expect(stats).toEqual({
        totalGames: 0,
        player1Wins: 0,
        player2Wins: 0,
      });
    });

    it('should return stored stats when available', () => {
      const mockStats = {
        totalGames: 5,
        player1Wins: 3,
        player2Wins: 2,
      };
      localStorageMock.setItem(
        'hold-the-line-stats',
        JSON.stringify(mockStats)
      );

      const stats = getGameStatistics();
      expect(stats).toEqual(mockStats);
    });

    it('should return default stats when localStorage has invalid JSON', () => {
      localStorageMock.setItem('hold-the-line-stats', 'invalid-json');

      const stats = getGameStatistics();
      expect(stats).toEqual({
        totalGames: 0,
        player1Wins: 0,
        player2Wins: 0,
      });
    });
  });

  describe('saveGameStatistics', () => {
    it('should save stats to localStorage', () => {
      const stats = {
        totalGames: 10,
        player1Wins: 6,
        player2Wins: 4,
      };

      saveGameStatistics(stats);

      const stored = localStorageMock.getItem('hold-the-line-stats');
      expect(stored).toBe(JSON.stringify(stats));
    });
  });

  describe('recordGame', () => {
    it('should increment total games and player 1 wins', () => {
      const stats = recordGame(1);

      expect(stats.totalGames).toBe(1);
      expect(stats.player1Wins).toBe(1);
      expect(stats.player2Wins).toBe(0);
    });

    it('should increment total games and player 2 wins', () => {
      const stats = recordGame(2);

      expect(stats.totalGames).toBe(1);
      expect(stats.player1Wins).toBe(0);
      expect(stats.player2Wins).toBe(1);
    });

    it('should accumulate multiple games correctly', () => {
      recordGame(1);
      recordGame(2);
      recordGame(1);
      const stats = recordGame(1);

      expect(stats.totalGames).toBe(4);
      expect(stats.player1Wins).toBe(3);
      expect(stats.player2Wins).toBe(1);
    });

    it('should persist stats to localStorage', () => {
      recordGame(1);
      recordGame(2);

      const stats = getGameStatistics();
      expect(stats.totalGames).toBe(2);
      expect(stats.player1Wins).toBe(1);
      expect(stats.player2Wins).toBe(1);
    });
  });

  describe('resetStatistics', () => {
    it('should clear stats from localStorage', () => {
      recordGame(1);
      recordGame(2);

      resetStatistics();

      const stats = getGameStatistics();
      expect(stats).toEqual({
        totalGames: 0,
        player1Wins: 0,
        player2Wins: 0,
      });
    });
  });
});
