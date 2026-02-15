'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
  gamesPlayed: number;
}

interface GameStatsProps {
  stats: GameStats;
  onReset: () => void;
}

export function GameStats({ stats, onReset }: GameStatsProps) {
  return (
    <div className="rounded-lg border border-foreground/20 bg-background p-4">
      <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-foreground/70">Games Played:</span>
          <span className="font-bold">{stats.gamesPlayed}</span>
        </div>
        
        <div className="h-px bg-foreground/10" />
        
        <div className="flex items-center justify-between">
          <span className="text-foreground/70">X Wins:</span>
          <span className="font-bold text-cherry-blossom">{stats.xWins}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-foreground/70">O Wins:</span>
          <span className="font-bold text-dusty-mauve">{stats.oWins}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-foreground/70">Draws:</span>
          <span className="font-bold text-foreground/60">{stats.draws}</span>
        </div>
      </div>

      {stats.gamesPlayed > 0 && (
        <Button
          onClick={onReset}
          variant="outline"
          className="mt-4 w-full"
          size="sm"
        >
          Reset Stats
        </Button>
      )}
    </div>
  );
}
