import type { Player } from './types';

interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
  gamesPlayed: number;
}

const STORAGE_KEY = 'ultimate-tic-tac-toe-stats';

export function getGameStatistics(): GameStats {
  if (typeof window === 'undefined') {
    return { xWins: 0, oWins: 0, draws: 0, gamesPlayed: 0 };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load game statistics:', error);
  }

  return { xWins: 0, oWins: 0, draws: 0, gamesPlayed: 0 };
}

export function recordGame(winner: Player | 'draw'): GameStats {
  const stats = getGameStatistics();

  stats.gamesPlayed += 1;
  if (winner === 'X') {
    stats.xWins += 1;
  } else if (winner === 'O') {
    stats.oWins += 1;
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
