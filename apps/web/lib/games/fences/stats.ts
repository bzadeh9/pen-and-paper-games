import type { Player } from './types';

interface GameStats {
  player1Wins: number;
  player2Wins: number;
  draws: number;
  gamesPlayed: number;
}

const STORAGE_KEY = 'fences-stats';

export function getGameStatistics(): GameStats {
  if (typeof window === 'undefined') {
    return { player1Wins: 0, player2Wins: 0, draws: 0, gamesPlayed: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load game statistics:', error);
  }

  return { player1Wins: 0, player2Wins: 0, draws: 0, gamesPlayed: 0 };
}

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
