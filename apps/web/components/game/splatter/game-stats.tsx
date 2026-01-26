'use client';

import React from 'react';
import { GameStatistics } from '@/lib/games/splatter/stats';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

interface GameStatsProps {
  stats: GameStatistics;
  player1Name: string;
  player2Name: string;
  onReset: () => void;
}

export function GameStats({
  stats,
  player1Name,
  player2Name,
  onReset,
}: GameStatsProps) {
  const player1WinRate =
    stats.totalGames > 0
      ? ((stats.player1Wins / stats.totalGames) * 100).toFixed(1)
      : '0.0';
  const player2WinRate =
    stats.totalGames > 0
      ? ((stats.player2Wins / stats.totalGames) * 100).toFixed(1)
      : '0.0';

  return (
    <Collapsible
      defaultOpen={true}
      className="rounded-lg border border-foreground/20 bg-background"
    >
      <div className="px-4 pt-4 pb-2">
        <CollapsibleTrigger>
          <h3 className="text-lg font-semibold">Statistics</h3>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">Total Games</span>
            <span className="font-semibold">{stats.totalGames}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">{player1Name} Wins</span>
            <span className="font-semibold">
              {stats.player1Wins} ({player1WinRate}%)
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">{player2Name} Wins</span>
            <span className="font-semibold">
              {stats.player2Wins} ({player2WinRate}%)
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-foreground/60">Draws</span>
            <span className="font-semibold">{stats.draws}</span>
          </div>

          {stats.totalGames > 0 && (
            <Button
              onClick={onReset}
              variant="outline"
              className="w-full mt-2 text-xs"
            >
              Reset Stats
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
