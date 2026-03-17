'use client';

import React from 'react';
import {
  PLAYER_COLORS,
  PLAYER_COLOR_OPTIONS,
  PlayerColor,
} from '@/lib/games/knight-chase/types';

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
      {/* Player Name Input */}
      <div>
        <label
          htmlFor={`player-${playerNumber}-name`}
          className="mb-2 block text-sm font-medium"
        >
          Player Name
        </label>
        <input
          id={`player-${playerNumber}-name`}
          type="text"
          value={playerName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          placeholder={`Player ${playerNumber}`}
          maxLength={20}
        />
      </div>

      {/* Color Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium">Knight Color</label>
        <div className="grid grid-cols-5 gap-2">
          {PLAYER_COLOR_OPTIONS.map(({ value, label }) => {
            const isSelected = value === selectedColor;
            const isDisabled = value === otherPlayerColor;
            return (
              <button
                key={value}
                onClick={() => !isDisabled && onColorChange(value)}
                disabled={isDisabled}
                className={`h-10 w-10 rounded-full border-2 transition-all ${
                  isSelected
                    ? 'border-foreground scale-110'
                    : isDisabled
                      ? 'border-foreground/20 cursor-not-allowed'
                      : 'border-foreground/20 hover:border-foreground/40 hover:scale-105'
                }`}
                style={{
                  backgroundColor: isDisabled
                    ? '#9ca3af'
                    : PLAYER_COLORS[value],
                }}
                aria-label={`${label} ${isDisabled ? '(in use)' : ''}`}
                title={`${label} ${isDisabled ? '(in use)' : ''}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
