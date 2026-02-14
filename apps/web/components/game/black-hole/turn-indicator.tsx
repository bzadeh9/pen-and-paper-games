'use client';

import React from 'react';
import type { Player, GameStatus } from '@/lib/games/black-hole/types';

interface TurnIndicatorProps {
  currentPlayer: Player;
  currentTurnNumber: number;
  player1Counter: number;
  player2Counter: number;
  gameStatus: GameStatus;
  winner: Player | 'draw' | null;
  player1Score: number;
  player2Score: number;
}

export function TurnIndicator({
  currentPlayer,
  currentTurnNumber,
  player1Counter,
  player2Counter,
  gameStatus,
  winner,
  player1Score,
  player2Score,
}: TurnIndicatorProps) {
  if (gameStatus === 'ended') {
    return (
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold">Game Over!</h2>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-dusty-mauve">
              Player 1:
            </span>
            <span className="text-2xl font-bold">{player1Score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-cherry-blossom">
              Player 2:
            </span>
            <span className="text-2xl font-bold">{player2Score}</span>
          </div>
        </div>
        <div className="text-xl font-bold">
          {winner === 'draw' ? (
            <span className="text-yellow-500">It&apos;s a Draw!</span>
          ) : (
            <span
              className={winner === 1 ? 'text-dusty-mauve' : 'text-cherry-blossom'}
            >
              Player {winner} Wins! 🎉
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-foreground/60">
          (Lowest score wins in Black Hole)
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
      <div className="mb-3 text-center">
        <div className="text-sm text-foreground/60">Turn {currentTurnNumber} of 20</div>
        <div className="mt-2 text-2xl font-bold">
          <span className={currentPlayer === 1 ? 'text-dusty-mauve' : 'text-cherry-blossom'}>
            Player {currentPlayer}&apos;s Turn
          </span>
        </div>
        <div className="mt-2 text-lg font-semibold">
          Next number: {currentPlayer === 1 ? player1Counter : player2Counter}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded bg-dusty-mauve/10 dark:bg-dusty-mauve/20 p-2 text-center border border-dusty-mauve/30">
          <div className="font-semibold text-dusty-mauve">Player 1</div>
          <div className="text-lg font-bold">Next: {player1Counter}</div>
        </div>
        <div className="rounded bg-cherry-blossom/10 dark:bg-cherry-blossom/20 p-2 text-center border border-cherry-blossom/30">
          <div className="font-semibold text-cherry-blossom">Player 2</div>
          <div className="text-lg font-bold">Next: {player2Counter}</div>
        </div>
      </div>
    </div>
  );
}
