'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { GameStatus } from '@/lib/games/fences/types';
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from '@/lib/games/fences/engine';

interface GameControlsProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  onReset: () => void;
  gameStatus: GameStatus;
  player1Name: string;
  player2Name: string;
  onPlayer1NameChange: (name: string) => void;
  onPlayer2NameChange: (name: string) => void;
}

function PlayerNameEditor({
  playerNumber,
  playerName,
  onNameChange,
  colorClass,
}: {
  playerNumber: 1 | 2;
  playerName: string;
  onNameChange: (name: string) => void;
  colorClass: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = tempName.trim();
    if (trimmed.length >= 1 && trimmed.length <= 20) {
      onNameChange(trimmed);
    } else {
      setTempName(playerName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') {
      setTempName(playerName);
      setIsEditing(false);
    }
  };

  return isEditing ? (
    <input
      ref={inputRef}
      type="text"
      value={tempName}
      onChange={(e) => setTempName(e.target.value)}
      onBlur={handleSave}
      onKeyDown={handleKeyDown}
      maxLength={20}
      className={`w-full rounded border border-foreground/20 bg-background px-2 py-1 text-sm font-semibold ${colorClass} focus:outline-none focus:ring-2 focus:ring-offset-1`}
      aria-label={`Edit player ${playerNumber} name`}
    />
  ) : (
    <button
      onClick={() => {
        setTempName(playerName);
        setIsEditing(true);
      }}
      className={`flex w-full items-center gap-1.5 rounded px-2 py-1 text-sm font-semibold ${colorClass} transition-colors hover:bg-foreground/5`}
      title="Click to edit name"
      aria-label={`Edit player ${playerNumber} name`}
    >
      <span className="truncate">{playerName}</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 opacity-50"
        aria-hidden="true"
      >
        <path
          d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

export function GameControls({
  gridSize,
  onGridSizeChange,
  onReset,
  gameStatus,
  player1Name,
  player2Name,
  onPlayer1NameChange,
  onPlayer2NameChange,
}: GameControlsProps) {
  const isSizeChangeable = gameStatus === 'setup' || gameStatus === 'ended';
  const isSetup = gameStatus === 'setup';

  return (
    <div className="space-y-4">
      {/* Player Names */}
      <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
        <h3 className="mb-3 text-lg font-semibold">Players</h3>
        <div className="space-y-2">
          <PlayerNameEditor
            playerNumber={1}
            playerName={player1Name}
            onNameChange={onPlayer1NameChange}
            colorClass="text-dusk-blue"
          />
          <PlayerNameEditor
            playerNumber={2}
            playerName={player2Name}
            onNameChange={onPlayer2NameChange}
            colorClass="text-powder-blush"
          />
        </div>
      </div>

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
