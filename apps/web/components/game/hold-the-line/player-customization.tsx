'use client';

import React from 'react';
import {
  PLAYER_COLORS,
  PlayerColor,
  PLAYER_COLOR_OPTIONS,
} from '@/lib/games/hold-the-line/types';

interface PlayerCustomizationProps {
  playerNumber: 1 | 2;
  selectedColor: PlayerColor;
  onColorChange: (color: PlayerColor) => void;
}

export function PlayerCustomization({
  playerNumber,
  selectedColor,
  onColorChange,
}: PlayerCustomizationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-foreground/20 bg-background p-4">
      <h3 className="text-lg font-semibold">Player {playerNumber}</h3>
      <div className="flex flex-wrap gap-2">
        {PLAYER_COLOR_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onColorChange(option.value)}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all hover:scale-110 ${
              selectedColor === option.value
                ? 'border-foreground shadow-lg'
                : 'border-foreground/20'
            }`}
            style={{ backgroundColor: PLAYER_COLORS[option.value] }}
            title={option.label}
          >
            {selectedColor === option.value && (
              <span className="text-xl">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
