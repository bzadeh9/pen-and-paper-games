'use client';

import React from 'react';
import { GameStatistics } from '@/lib/games/bee-game/stats';

interface GameStatsProps {
  stats: GameStatistics;
  onReset: () => void;
}

export function GameStats({ stats, onReset }: GameStatsProps) {
  const player1WinRate =
    stats.totalGames > 0
      ? ((stats.player1Wins / stats.totalGames) * 100).toFixed(1)
      : '0.0';
  const player2WinRate =
    stats.totalGames > 0
      ? ((stats.player2Wins / stats.totalGames) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="rounded-lg border border-foreground/20 bg-background p-6">
      <h3 className="mb-4 text-lg font-semibold">Game Statistics</h3>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium">Abbee (Player 1)</p>
          <p className="text-foreground/60">
            {stats.player1Wins} wins ({player1WinRate}%)
          </p>
        </div>

        <div>
          <p className="font-medium">Dot (Player 2)</p>
          <p className="text-foreground/60">
            {stats.player2Wins} wins ({player2WinRate}%)
          </p>
        </div>

        <div className="border-t border-foreground/20 pt-3">
          <p className="font-medium">Total Games</p>
          <p className="text-foreground/60">{stats.totalGames}</p>
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-4 w-full rounded-md border border-foreground/20 bg-background px-4 py-2 text-sm transition-all hover:border-foreground/40 hover:bg-foreground/5 focus:outline-none focus:ring-2 focus:ring-foreground/20"
      >
        Reset Statistics
      </button>
    </div>
  );
}
