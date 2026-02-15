'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { GameMode } from '@/lib/games/ultimate-tic-tac-toe/types';

interface GameControlsProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onReset: () => void;
  gameStatus: 'setup' | 'playing' | 'ended';
}

export function GameControls({
  mode,
  onModeChange,
  onReset,
  gameStatus,
}: GameControlsProps) {
  const isModeChangeable = gameStatus === 'setup' || gameStatus === 'ended';

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="rounded-lg border border-foreground/20 bg-background p-4">
        <h3 className="mb-3 text-lg font-semibold">Game Mode</h3>
        <div className="space-y-2">
          <label
            htmlFor="mode-standard"
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              id="mode-standard"
              type="radio"
              name="mode"
              value="standard"
              checked={mode === 'standard'}
              onChange={() => onModeChange('standard')}
              disabled={!isModeChangeable}
              className="h-4 w-4"
            />
            <span
              className={`text-sm ${!isModeChangeable ? 'text-foreground/60' : ''}`}
            >
              <strong>Standard (Casual):</strong> Play anywhere on the board
            </span>
          </label>
          <label
            htmlFor="mode-strict"
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              id="mode-strict"
              type="radio"
              name="mode"
              value="strict"
              checked={mode === 'strict'}
              onChange={() => onModeChange('strict')}
              disabled={!isModeChangeable}
              className="h-4 w-4"
            />
            <span
              className={`text-sm ${!isModeChangeable ? 'text-foreground/60' : ''}`}
            >
              <strong>Strict (Classic):</strong> Follow the board rules
            </span>
          </label>
        </div>
        {gameStatus === 'playing' && (
          <p className="mt-2 text-xs text-foreground/60">
            Mode locked during game
          </p>
        )}
      </div>

      {/* Reset Button */}
      <Button onClick={onReset} className="w-full" variant="default">
        {gameStatus === 'ended' ? 'Play Again' : 'Reset Game'}
      </Button>
    </div>
  );
}
