'use client';

import React from 'react';
import type { Player, GameStatus } from '@/lib/games/fences/types';

interface TurnIndicatorProps {
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner: Player | 'draw' | null;
  player1Score: number;
  player2Score: number;
  totalBoxes: number;
  player1Name: string;
  player2Name: string;
}

export function TurnIndicator({
  currentPlayer,
  gameStatus,
  winner,
  player1Score,
  player2Score,
  totalBoxes,
  player1Name,
  player2Name,
}: TurnIndicatorProps) {
  if (gameStatus === 'ended') {
    return (
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-6 text-center">
        <h2 className="mb-4 text-2xl font-bold">Game Over!</h2>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-dusk-blue">
              {player1Name}:
            </span>
            <span className="text-2xl font-bold">{player1Score} boxes</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-powder-blush">
              {player2Name}:
            </span>
            <span className="text-2xl font-bold">{player2Score} boxes</span>
          </div>
        </div>
        <div className="text-xl font-bold">
          {winner === 'draw' ? (
            <span className="text-yellow-500">It&apos;s a Draw!</span>
          ) : (
            <span
              className={
                winner === 1 ? 'text-dusk-blue' : 'text-powder-blush'
              }
            >
              {winner === 1 ? player1Name : player2Name} Wins! 🎉
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
      <div className="mb-3 text-center">
        <div className="text-sm text-foreground/60">
          {player1Score + player2Score} of {totalBoxes} boxes claimed
        </div>
        <div className="mt-2 text-2xl font-bold">
          <span
            className={
              currentPlayer === 1 ? 'text-dusk-blue' : 'text-powder-blush'
            }
          >
            {currentPlayer === 1 ? player1Name : player2Name}&apos;s Turn
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="rounded bg-dusk-blue/10 dark:bg-dusk-blue/20 p-2 text-center border border-dusk-blue/30">
          <div className="font-semibold text-dusk-blue">{player1Name}</div>
          <div className="text-lg font-bold">{player1Score}</div>
        </div>
        <div className="rounded bg-powder-blush/10 dark:bg-powder-blush/20 p-2 text-center border border-powder-blush/30">
          <div className="font-semibold text-powder-blush">{player2Name}</div>
          <div className="text-lg font-bold">{player2Score}</div>
        </div>
      </div>
    </div>
  );
}
