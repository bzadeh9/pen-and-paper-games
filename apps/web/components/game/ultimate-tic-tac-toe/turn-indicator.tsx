'use client';

import React from 'react';
import type { Player } from '@/lib/games/ultimate-tic-tac-toe/types';

interface TurnIndicatorProps {
  currentPlayer: Player;
  gameStatus: 'setup' | 'playing' | 'ended';
  winner: Player | 'draw' | null;
}

export function TurnIndicator({
  currentPlayer,
  gameStatus,
  winner,
}: TurnIndicatorProps) {
  const getPlayerColor = (player: Player | null) => {
    if (player === 'X') return 'text-dusty-mauve';
    if (player === 'O') return 'text-pastel-pink';
    return 'text-cherry-blossom';
  };

  const getPlayerBgColor = (player: Player | null) => {
    if (player === 'X') return 'bg-dusty-mauve/10 border-dusty-mauve';
    if (player === 'O') return 'bg-pastel-pink/10 border-pastel-pink';
    return 'bg-cherry-blossom/10 border-cherry-blossom';
  };

  if (gameStatus === 'setup') {
    return (
      <div className="rounded-lg border border-foreground/20 bg-background p-6 text-center">
        <h2 className="text-2xl font-bold">Ready to Play?</h2>
        <p className="mt-2 text-foreground/60">
          Choose your mode and make your first move!
        </p>
      </div>
    );
  }

  if (gameStatus === 'ended') {
    return (
      <div
        className={`rounded-lg border-2 p-6 text-center ${getPlayerBgColor(winner === 'draw' ? null : winner)}`}
      >
        <h2 className="text-3xl font-bold">Game Over!</h2>
        {winner === 'draw' ? (
          <p className="mt-3 text-xl text-foreground/80">
            It&apos;s a draw! 🤝
          </p>
        ) : (
          <p className="mt-3 text-xl text-foreground/80">
            <span className={`text-3xl font-bold ${getPlayerColor(winner)}`}>
              {winner}
            </span>{' '}
            wins! 🎉
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border-2 p-6 text-center ${getPlayerBgColor(currentPlayer)}`}
    >
      <h2 className="text-2xl font-semibold text-foreground/70">
        Current Turn
      </h2>
      <div
        className={`mt-2 text-5xl font-bold ${getPlayerColor(currentPlayer)}`}
      >
        {currentPlayer}
      </div>
    </div>
  );
}
