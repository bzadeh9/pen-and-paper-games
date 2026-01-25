'use client';

import React from 'react';
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from '@/lib/games/hold-the-line/engine';

interface GridSizeSelectorProps {
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  disabled?: boolean;
}

export function GridSizeSelector({
  gridSize,
  onGridSizeChange,
  disabled = false,
}: GridSizeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="grid-size" className="text-sm font-medium">
        Grid Size: {gridSize}x{gridSize}
      </label>
      <input
        id="grid-size"
        type="range"
        min={MIN_GRID_SIZE}
        max={MAX_GRID_SIZE}
        value={gridSize}
        onChange={(e) => onGridSizeChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Grid size slider, current value ${gridSize}x${gridSize}`}
      />
      <div className="flex justify-between text-xs text-foreground/60">
        <span>{MIN_GRID_SIZE}x{MIN_GRID_SIZE}</span>
        <span>{MAX_GRID_SIZE}x{MAX_GRID_SIZE}</span>
      </div>
      {disabled && (
        <p className="text-xs text-foreground/60">
          Grid size can only be changed before the game starts
        </p>
      )}
    </div>
  );
}
