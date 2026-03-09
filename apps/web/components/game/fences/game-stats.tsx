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
  player1Name: string;
  player2Name: string;
}

export function GameStats({ stats, onReset, player1Name, player2Name }: GameStatsProps) {
  return (
    <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
      <h2 className="mb-4 text-xl font-bold">Statistics</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-foreground/80">Games Played:</span>
          <span className="font-semibold">{stats.gamesPlayed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-prussian-blue font-medium">{player1Name} Wins:</span>
          <span className="font-semibold text-prussian-blue">
            {stats.player1Wins}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-cherry-blossom font-medium">
            {player2Name} Wins:
          </span>
          <span className="font-semibold text-cherry-blossom">
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
