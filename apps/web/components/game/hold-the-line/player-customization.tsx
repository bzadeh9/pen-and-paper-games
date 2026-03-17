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
  // All unified palette colors are pastel/light, so always use dark checkmark
  const getCheckmarkColor = (_color: PlayerColor): string => {
    return '#000000';
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
            'flex items-center gap-2 text-left text-lg font-semibold',
            onNameChange &&
              'cursor-pointer rounded px-2 py-1 transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
          )}
          title={onNameChange ? 'Click to edit name' : undefined}
          aria-label={
            onNameChange ? `Edit player ${playerNumber} name` : undefined
          }
        >
          <span>{playerName}</span>
          {onNameChange && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-60"
              aria-hidden="true"
            >
              <path
                d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61Zm.176 4.823L9.75 4.81l-6.286 6.287a.253.253 0 0 0-.064.108l-.558 1.953 1.953-.558a.253.253 0 0 0 .108-.064Zm1.238-3.763a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354Z"
                fill="currentColor"
              />
            </svg>
          )}
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
                isDisabled &&
                  'cursor-not-allowed border-foreground/10'
              )}
              style={{
                backgroundColor: isDisabled
                  ? '#9ca3af'
                  : PLAYER_COLORS[option.value],
              }}
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
