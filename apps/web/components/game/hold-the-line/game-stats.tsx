'use client';

import React from 'react';
import { GameStatistics } from '@/lib/games/hold-the-line/stats';

interface GameStatsProps {
  stats: GameStatistics;
  player1Name?: string;
  player2Name?: string;
  onReset?: () => void;
}

export function GameStats({ stats, player1Name = 'Player 1', player2Name = 'Player 2', onReset }: GameStatsProps) {
  return (
    <div
      className="rounded-lg border border-foreground/20 bg-background p-4"
      role="region"
      aria-label="Game statistics"
    >
      <h3 className="mb-3 text-lg font-semibold">Game Statistics</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-foreground/60">Total Games:</span>
          <span className="font-semibold" aria-label={`${stats.totalGames} games played`}>
            {stats.totalGames}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">{player1Name} Wins:</span>
          <span className="font-semibold" aria-label={`${player1Name} has won ${stats.player1Wins} games`}>
            {stats.player1Wins}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/60">{player2Name} Wins:</span>
          <span className="font-semibold" aria-label={`${player2Name} has won ${stats.player2Wins} games`}>
            {stats.player2Wins}
          </span>
        </div>
      </div>
      {onReset && stats.totalGames > 0 && (
        <button
          onClick={onReset}
          className="mt-4 w-full rounded-lg border border-foreground/20 px-3 py-2 text-sm transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground/50"
          aria-label="Reset all statistics"
        >
          Reset Statistics
        </button>
      )}
    </div>
  );
}
