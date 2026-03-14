'use client';

import React from 'react';
import {
  PLAYER_COLORS,
  PLAYER_COLOR_OPTIONS,
  PlayerColor,
} from '@/lib/games/splatter/types';

interface PlayerCustomizationProps {
  playerNumber: 1 | 2;
  selectedColor: PlayerColor;
  onColorChange: (color: PlayerColor) => void;
  otherPlayerColor: PlayerColor;
  playerName: string;
  onNameChange: (name: string) => void;
}

export function PlayerCustomization({
  playerNumber,
  selectedColor,
  onColorChange,
  otherPlayerColor,
  playerName,
  onNameChange,
}: PlayerCustomizationProps) {
  return (
    <div className="space-y-4">
      {/* Player name input */}
      <div>
        <label
          htmlFor={`player-${playerNumber}-name`}
          className="mb-2 block text-sm font-medium"
        >
          Name
        </label>
        <input
          id={`player-${playerNumber}-name`}
          type="text"
          value={playerName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm focus:border-foreground/40 focus:outline-none"
          placeholder={`Player ${playerNumber}`}
        />
      </div>

      {/* Color selection */}
      <div>
        <label className="mb-2 block text-sm font-medium">Color</label>
        <div className="flex flex-wrap gap-2">
          {PLAYER_COLOR_OPTIONS.map((option) => {
            const isSelected = selectedColor === option.value;
            const isDisabled = otherPlayerColor === option.value;
            const color = PLAYER_COLORS[option.value];

            return (
              <button
                key={option.value}
                onClick={() => !isDisabled && onColorChange(option.value)}
                disabled={isDisabled}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected
                    ? 'border-foreground shadow-md'
                    : 'border-foreground/20 hover:border-foreground/40'
                } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  backgroundColor: isDisabled ? '#9ca3af' : color,
                }}
                title={
                  isDisabled ? 'Already selected by other player' : option.label
                }
              >
                {isSelected && (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      color: '#1a1a1a',
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
