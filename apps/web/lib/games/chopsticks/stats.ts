import type { Player } from './types';

interface GameStats {
  player1Wins: number;
  player2Wins: number;
  draws: number;
  gamesPlayed: number;
}

const STORAGE_KEY = 'chopsticks-stats';

export function getGameStatistics(): GameStats {
  if (typeof window === 'undefined') {
    return { player1Wins: 0, player2Wins: 0, draws: 0, gamesPlayed: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        parsed &&
        typeof parsed === 'object' &&
        typeof parsed.player1Wins === 'number' && parsed.player1Wins >= 0 &&
        typeof parsed.player2Wins === 'number' && parsed.player2Wins >= 0 &&
        typeof parsed.draws === 'number' && parsed.draws >= 0 &&
        typeof parsed.gamesPlayed === 'number' && parsed.gamesPlayed >= 0
      ) {
        return parsed as GameStats;
      }
    }
  } catch (error) {
    console.error('Failed to load game statistics:', error);
  }

  return { player1Wins: 0, player2Wins: 0, draws: 0, gamesPlayed: 0 };
}

/** Record a completed game. Draws should not occur in Chopsticks but are tracked
 *  for interface consistency with other games. */
export function recordGame(winner: Player | 'draw'): GameStats {
  const stats = getGameStatistics();

  stats.gamesPlayed += 1;
  if (winner === 1) {
    stats.player1Wins += 1;
  } else if (winner === 2) {
    stats.player2Wins += 1;
  } else if (winner === 'draw') {
    stats.draws += 1;
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save game statistics:', error);
    }
  }

  return stats;
}

export function resetStatistics(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset statistics:', error);
    }
  }
}
