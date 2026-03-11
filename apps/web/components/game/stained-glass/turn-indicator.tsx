'use client';

import React from 'react';
import type { Player, GameStatus } from '@/lib/games/stained-glass/types';

interface TurnIndicatorProps {
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | null;
  player1Score: number;
  player2Score: number;
  player1Name: string;
  player2Name: string;
}

export function TurnIndicator({
  currentPlayer,
  gameStatus,
  winner,
  player1Score,
  player2Score,
  player1Name,
  player2Name,
}: TurnIndicatorProps) {
  if (gameStatus === 'ended') {
    return (
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold">Game Over!</h2>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-dusty-mauve">
              {player1Name}:
            </span>
            <span className="text-2xl font-bold">{player1Score} sections</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-cherry-blossom">
              {player2Name}:
            </span>
            <span className="text-2xl font-bold">{player2Score} sections</span>
          </div>
        </div>
        <div className="text-xl font-bold">
          <span
            className={winner === 1 ? 'text-dusty-mauve' : 'text-cherry-blossom'}
          >
            {winner === 1 ? player1Name : player2Name} Wins! 🎉
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
      <div className="text-center">
        <div className="mt-2 text-2xl font-bold">
          <span
            className={
              currentPlayer === 1 ? 'text-dusty-mauve' : 'text-cherry-blossom'
            }
          >
            {currentPlayer === 1 ? player1Name : player2Name}&apos;s Turn
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded bg-dusty-mauve/10 dark:bg-dusty-mauve/20 p-2 text-center border border-dusty-mauve/30">
          <div className="font-semibold text-dusty-mauve">{player1Name}</div>
          <div className="text-lg font-bold">{player1Score} sections</div>
        </div>
        <div className="rounded bg-cherry-blossom/10 dark:bg-cherry-blossom/20 p-2 text-center border border-cherry-blossom/30">
          <div className="font-semibold text-cherry-blossom">{player2Name}</div>
          <div className="text-lg font-bold">{player2Score} sections</div>
        </div>
      </div>
    </div>
  );
}
