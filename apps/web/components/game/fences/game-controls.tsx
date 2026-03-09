'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { GameStatus } from '@/lib/games/fences/types';
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from '@/lib/games/fences/engine';

interface GameControlsProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  onReset: () => void;
  gameStatus: GameStatus;
}

export function GameControls({
  gridSize,
  onGridSizeChange,
  onReset,
  gameStatus,
}: GameControlsProps) {
  const isSizeChangeable = gameStatus === 'setup' || gameStatus === 'ended';
  const isSetup = gameStatus === 'setup';

  return (
    <div className="space-y-4">
      {/* Grid Size Selector */}
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
        <h3 className="mb-3 text-lg font-semibold">Grid Size</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(
            { length: MAX_GRID_SIZE - MIN_GRID_SIZE + 1 },
            (_, i) => MIN_GRID_SIZE + i
          ).map((size) => (
            <button
              key={size}
              onClick={() => onGridSizeChange(size)}
              disabled={!isSizeChangeable}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                gridSize === size
                  ? 'bg-foreground text-background'
                  : isSizeChangeable
                    ? 'bg-foreground/10 hover:bg-foreground/20'
                    : 'bg-foreground/5 text-foreground/40'
              }`}
            >
              {size}×{size}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-foreground/60">
          {(gridSize - 1) * (gridSize - 1)} boxes to fill
        </p>
        {gameStatus === 'playing' && (
          <p className="mt-1 text-xs text-foreground/60">
            Grid size locked during game
          </p>
        )}
      </div>

      {/* Reset/Start Button */}
      <Button onClick={onReset} className="w-full" variant="default">
        {isSetup
          ? 'Start Game'
          : gameStatus === 'ended'
            ? 'Play Again'
            : 'New Game'}
      </Button>
    </div>
  );
}
