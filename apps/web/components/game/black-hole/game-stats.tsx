'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface GameStatsProps {
  stats: {
    player1Wins: number;
    player2Wins: number;
    draws: number;
    gamesPlayed: number;
  };
  onReset: () => void;
}

export function GameStats({ stats, onReset }: GameStatsProps) {
  return (
    <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
      <h2 className="mb-4 text-xl font-bold">Statistics</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-foreground/80">Games Played:</span>
          <span className="font-semibold">{stats.gamesPlayed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-periwinkle font-medium">Player 1 Wins:</span>
          <span className="font-semibold text-periwinkle">
            {stats.player1Wins}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-powder-blush font-medium">
            Player 2 Wins:
          </span>
          <span className="font-semibold text-powder-blush">
            {stats.player2Wins}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-foreground/80">Draws:</span>
          <span className="font-semibold">{stats.draws}</span>
        </div>
      </div>
      <Button
        onClick={onReset}
        variant="outline"
        className="mt-4 w-full"
        size="sm"
      >
        Reset Stats
      </Button>
    </div>
  );
}
