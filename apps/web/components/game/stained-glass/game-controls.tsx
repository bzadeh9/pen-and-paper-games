'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import type { GameMode, GameStatus } from '@/lib/games/stained-glass/types';

interface GameControlsProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  onReset: () => void;
  gameStatus: GameStatus;
  player1Name: string;
  onPlayer1NameChange: (name: string) => void;
  player2Name: string;
  onPlayer2NameChange: (name: string) => void;
}

export function GameControls({
  mode,
  onModeChange,
  gridSize,
  onGridSizeChange,
  onReset,
  gameStatus,
  player1Name,
  onPlayer1NameChange,
  player2Name,
  onPlayer2NameChange,
}: GameControlsProps) {
  const isChangeable = gameStatus === 'setup' || gameStatus === 'ended';
  const isSetup = gameStatus === 'setup';

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
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
              disabled={!isChangeable}
              className="h-4 w-4"
            />
            <span className={`text-sm ${!isChangeable ? 'text-foreground/60' : ''}`}>
              <strong>Stained Glass:</strong> Cannot color next to opponent
            </span>
          </label>
          <label
            htmlFor="mode-reverse"
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              id="mode-reverse"
              type="radio"
              name="mode"
              value="reverse"
              checked={mode === 'reverse'}
              onChange={() => onModeChange('reverse')}
              disabled={!isChangeable}
              className="h-4 w-4"
            />
            <span className={`text-sm ${!isChangeable ? 'text-foreground/60' : ''}`}>
              <strong>Reverse Stained Glass:</strong> Cannot color next to yourself
            </span>
          </label>
        </div>
        {gameStatus === 'playing' && (
          <p className="mt-2 text-xs text-foreground/60">Mode locked during game</p>
        )}
      </div>

      {/* Window Complexity Selector */}
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
        <h3 className="mb-3 text-lg font-semibold">Window Size</h3>
        <div className="flex items-center gap-3">
          <label htmlFor="grid-size" className="text-sm text-foreground/80 whitespace-nowrap">
            {['Small', 'Medium', 'Large', 'Extra Large'][gridSize - 3]}
          </label>
          <input
            id="grid-size"
            type="range"
            min={3}
            max={6}
            value={gridSize}
            onChange={(e) => onGridSizeChange(Number(e.target.value))}
            disabled={!isChangeable}
            className="flex-1"
          />
        </div>
        {gameStatus === 'playing' && (
          <p className="mt-2 text-xs text-foreground/60">Size locked during game</p>
        )}
      </div>

      {/* Player Names */}
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
        <h3 className="mb-3 text-lg font-semibold">Players</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="player1-name" className="block text-sm font-medium text-periwinkle mb-1">
              Player 1
            </label>
            <input
              id="player1-name"
              type="text"
              value={player1Name}
              onChange={(e) => onPlayer1NameChange(e.target.value.slice(0, 20))}
              className="w-full rounded border border-foreground/20 bg-background px-3 py-1.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="player2-name" className="block text-sm font-medium text-powder-blush mb-1">
              Player 2
            </label>
            <input
              id="player2-name"
              type="text"
              value={player2Name}
              onChange={(e) => onPlayer2NameChange(e.target.value.slice(0, 20))}
              className="w-full rounded border border-foreground/20 bg-background px-3 py-1.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Start/Reset Button */}
      <Button onClick={onReset} className="w-full" variant="default">
        {isSetup ? 'Start Game' : gameStatus === 'ended' ? 'Play Again' : 'New Game'}
      </Button>
    </div>
  );
}
