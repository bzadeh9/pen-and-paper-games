'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  PLAYER_COLORS,
  PlayerColor,
  PLAYER_COLOR_OPTIONS,
} from '@/lib/games/hold-the-line/types';
import { cn } from '@/lib/utils';

interface PlayerCustomizationProps {
  playerNumber: 1 | 2;
  selectedColor: PlayerColor;
  onColorChange: (color: PlayerColor) => void;
  otherPlayerColor?: PlayerColor;
  playerName?: string;
  onNameChange?: (name: string) => void;
}

export function PlayerCustomization({
  playerNumber,
  selectedColor,
  onColorChange,
  otherPlayerColor,
  playerName = `Player ${playerNumber}`,
  onNameChange,
}: PlayerCustomizationProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameSave = () => {
    const trimmedName = tempName.trim();
    if (trimmedName.length >= 1 && trimmedName.length <= 20) {
      onNameChange?.(trimmedName);
      setIsEditingName(false);
    } else {
      // Reset to current name if invalid
      setTempName(playerName);
      setIsEditingName(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      setTempName(playerName);
      setIsEditingName(false);
    }
  };

  // Helper to get contrasting color for checkmark
  const getCheckmarkColor = (color: PlayerColor): string => {
    // Use dark checkmark for light colors
    const lightColors = ['alabasterGrey', 'powderPetal', 'pastelPink'];
    return lightColors.includes(color) ? '#000000' : '#FFFFFF';
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-foreground/20 bg-background p-4">
      {isEditingName ? (
        <input
          ref={inputRef}
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleNameSave}
          onKeyDown={handleNameKeyDown}
          maxLength={20}
          className="rounded border border-foreground/20 bg-background px-2 py-1 text-lg font-semibold focus:border-foreground focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label={`Edit player ${playerNumber} name`}
        />
      ) : (
        <button
          onClick={() => {
            if (onNameChange) {
              setIsEditingName(true);
            }
          }}
          disabled={!onNameChange}
          className={cn(
            'text-left text-lg font-semibold',
            onNameChange &&
              'cursor-pointer rounded px-2 py-1 transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          )}
          title={onNameChange ? 'Click to edit name' : undefined}
          aria-label={
            onNameChange ? `Edit player ${playerNumber} name` : undefined
          }
        >
          {playerName}
        </button>
      )}
      <div className="flex flex-wrap gap-2">
        {PLAYER_COLOR_OPTIONS.map((option) => {
          const isSelected = selectedColor === option.value;
          const isDisabled = otherPlayerColor === option.value;

          return (
            <button
              key={option.value}
              onClick={() => !isDisabled && onColorChange(option.value)}
              disabled={isDisabled}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all',
                isSelected && 'border-foreground shadow-lg',
                !isSelected && !isDisabled && 'border-foreground/20',
                !isDisabled && 'hover:scale-110',
                isDisabled && 'cursor-not-allowed opacity-40 border-foreground/10'
              )}
              style={{ backgroundColor: PLAYER_COLORS[option.value] }}
              title={
                isDisabled
                  ? `${option.label} (selected by other player)`
                  : option.label
              }
              aria-label={
                isDisabled
                  ? `${option.label}, unavailable, selected by other player`
                  : `${option.label}${isSelected ? ', selected' : ''}`
              }
              aria-disabled={isDisabled}
            >
              {isSelected && (
                <span
                  className="text-xl font-bold"
                  style={{ color: getCheckmarkColor(option.value) }}
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
