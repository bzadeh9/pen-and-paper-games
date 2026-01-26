import type { Player } from './types';

const STATS_STORAGE_KEY = 'knight-chase-stats';

export interface GameStatistics {
  player1Wins: number;
  player2Wins: number;
  totalGames: number;
  lastUpdated: string;
}

export function getGameStatistics(): GameStatistics {
  if (typeof window === 'undefined') {
    return {
      player1Wins: 0,
      player2Wins: 0,
      totalGames: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading statistics:', error);
  }

  return {
    player1Wins: 0,
    player2Wins: 0,
    totalGames: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export function recordGame(winner: Player): GameStatistics {
  const stats = getGameStatistics();

  if (winner === 1) {
    stats.player1Wins += 1;
  } else {
    stats.player2Wins += 1;
  }
  stats.totalGames += 1;
  stats.lastUpdated = new Date().toISOString();

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving statistics:', error);
    }
  }

  return stats;
}

export function resetStatistics(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STATS_STORAGE_KEY);
    } catch (error) {
      console.error('Error resetting statistics:', error);
    }
  }
}
