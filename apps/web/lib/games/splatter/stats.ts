import { Player } from './engine';

const STORAGE_KEY = 'splatter-game-stats';

export interface GameStatistics {
  totalGames: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
}

const DEFAULT_STATS: GameStatistics = {
  totalGames: 0,
  player1Wins: 0,
  player2Wins: 0,
  draws: 0,
};

export function getGameStatistics(): GameStatistics {
  if (typeof window === 'undefined') {
    return DEFAULT_STATS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_STATS;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load game statistics:', error);
    return DEFAULT_STATS;
  }
}

export function recordGame(winner: Player | 'draw'): GameStatistics {
  const stats = getGameStatistics();

  stats.totalGames++;
  if (winner === 1) {
    stats.player1Wins++;
  } else if (winner === 2) {
    stats.player2Wins++;
  } else {
    stats.draws++;
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
      console.error('Failed to reset game statistics:', error);
    }
  }
}
