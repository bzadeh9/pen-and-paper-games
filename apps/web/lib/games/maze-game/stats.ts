const STATS_STORAGE_KEY = 'maze-game-stats';

export interface GameStatistics {
  gamesCompleted: number;
  totalMoves: number;
  lastUpdated: string;
}

export function getGameStatistics(): GameStatistics {
  if (typeof window === 'undefined') {
    return {
      gamesCompleted: 0,
      totalMoves: 0,
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
    gamesCompleted: 0,
    totalMoves: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export function recordGame(totalMoves: number): GameStatistics {
  const stats = getGameStatistics();

  stats.gamesCompleted += 1;
  stats.totalMoves += totalMoves;
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
