import { Player } from './engine';

export interface GameStatistics {
  totalGames: number;
  player1Wins: number;
  player2Wins: number;
}

const STATS_STORAGE_KEY = 'hold-the-line-stats';

/**
 * Get game statistics from localStorage
 */
export function getGameStatistics(): GameStatistics {
  if (typeof window === 'undefined') {
    return { totalGames: 0, player1Wins: 0, player2Wins: 0 };
  }

  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading game statistics:', error);
  }

  return { totalGames: 0, player1Wins: 0, player2Wins: 0 };
}

/**
 * Save game statistics to localStorage
 */
export function saveGameStatistics(stats: GameStatistics): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving game statistics:', error);
  }
}

/**
 * Record a completed game
 */
export function recordGame(winner: Player): GameStatistics {
  const stats = getGameStatistics();
  stats.totalGames += 1;

  if (winner === 1) {
    stats.player1Wins += 1;
  } else {
    stats.player2Wins += 1;
  }

  saveGameStatistics(stats);
  return stats;
}

/**
 * Reset all statistics
 */
export function resetStatistics(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STATS_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting game statistics:', error);
  }
}
