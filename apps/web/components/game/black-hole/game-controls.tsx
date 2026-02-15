'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { GameMode, GameStatus } from '@/lib/games/black-hole/types';

interface GameControlsProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  onReset: () => void;
  gameStatus: GameStatus;
}

export function GameControls({
  mode,
  onModeChange,
  onReset,
  gameStatus,
}: GameControlsProps) {
  const isModeChangeable = gameStatus === 'setup' || gameStatus === 'ended';
  const isSetup = gameStatus === 'setup';

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
        <h3 className="mb-3 text-lg font-semibold">Game Mode</h3>
        <div className="space-y-2">
          <label htmlFor="mode-lowest" className="flex items-center gap-2 cursor-pointer">
            <input
              id="mode-lowest"
              type="radio"
              name="mode"
              value="lowest"
              checked={mode === 'lowest'}
              onChange={() => onModeChange('lowest')}
              disabled={!isModeChangeable}
              className="h-4 w-4"
            />
            <span className={`text-sm ${!isModeChangeable ? 'text-foreground/60' : ''}`}>
              <strong>Lowest Score Wins:</strong> Avoid the black hole
            </span>
          </label>
          <label htmlFor="mode-highest" className="flex items-center gap-2 cursor-pointer">
            <input
              id="mode-highest"
              type="radio"
              name="mode"
              value="highest"
              checked={mode === 'highest'}
              onChange={() => onModeChange('highest')}
              disabled={!isModeChangeable}
              className="h-4 w-4"
            />
            <span className={`text-sm ${!isModeChangeable ? 'text-foreground/60' : ''}`}>
              <strong>Highest Score Wins:</strong> Aim for the black hole
            </span>
          </label>
        </div>
        {gameStatus === 'playing' && (
          <p className="mt-2 text-xs text-foreground/60">
            Mode locked during game
          </p>
        )}
      </div>

      {/* Reset/Start Button */}
      <Button
        onClick={onReset}
        className="w-full"
        variant="default"
      >
        {isSetup ? 'Start Game' : gameStatus === 'ended' ? 'Play Again' : 'New Game'}
      </Button>
    </div>
  );
}
