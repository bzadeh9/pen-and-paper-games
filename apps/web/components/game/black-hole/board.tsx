'use client';

import React from 'react';
import type { GameState } from '@/lib/games/black-hole/types';
import { cn } from '@/lib/utils';

interface BoardProps {
  gameState: GameState;
  onCircleClick: (circleId: number) => void;
}

export function Board({ gameState, onCircleClick }: BoardProps) {
  const getCirclesByRow = (row: number) => {
    return gameState.circles.filter((c) => c.row === row);
  };

  const getCircleColor = (circleId: number) => {
    const circle = gameState.circles[circleId];
    if (circle.owner === 1) return 'bg-dusty-mauve text-white';
    if (circle.owner === 2) return 'bg-cherry-blossom text-white';
    return 'bg-gray-200 dark:bg-gray-700 text-foreground/60';
  };

  const isBlackHole = (circleId: number) => {
    return gameState.blackHoleId === circleId;
  };

  const isClickable = (circleId: number) => {
    return gameState.status === 'playing' && gameState.circles[circleId].value === null;
  };

  const showSetupOverlay = gameState.status === 'setup';

  return (
    <div className="flex flex-col items-center gap-3 p-6 relative">
      {showSetupOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-xl">
          <div className="text-center p-6">
            <p className="text-lg font-semibold text-foreground/80">
              Select a game mode and click Start Game
            </p>
          </div>
        </div>
      )}
      {[0, 1, 2, 3, 4, 5].map((row) => {
        const circles = getCirclesByRow(row);
        return (
          <div key={row} className="flex gap-3 justify-center">
            {circles.map((circle) => (
              <button
                key={circle.id}
                onClick={() => onCircleClick(circle.id)}
                disabled={!isClickable(circle.id)}
                className={cn(
                  'w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all duration-200',
                  getCircleColor(circle.id),
                  isBlackHole(circle.id) && 'bg-black dark:bg-gray-950 ring-4 ring-yellow-400 animate-pulse',
                  isClickable(circle.id) && 'hover:scale-110 hover:shadow-lg cursor-pointer',
                  !isClickable(circle.id) && gameState.status === 'playing' && 'cursor-not-allowed opacity-90',
                  circle.value !== null && 'scale-100 hover:scale-105'
                )}
                aria-label={
                  isBlackHole(circle.id)
                    ? 'Black Hole'
                    : circle.value
                      ? `Circle with value ${circle.value}`
                      : 'Empty circle'
                }
              >
                {isBlackHole(circle.id) ? '🕳️' : circle.value || ''}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
