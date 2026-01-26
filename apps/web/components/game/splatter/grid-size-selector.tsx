'use client';

import React from 'react';
import { MIN_GRID_SIZE, MAX_GRID_SIZE } from '@/lib/games/splatter/engine';

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
  const gridSizes = Array.from(
    { length: MAX_GRID_SIZE - MIN_GRID_SIZE + 1 },
    (_, i) => MIN_GRID_SIZE + i
  );

  return (
    <div>
      <label htmlFor="grid-size" className="mb-2 block text-sm font-medium">
        Board Size: {gridSize} × {gridSize}
      </label>
      <input
        id="grid-size"
        type="range"
        min={MIN_GRID_SIZE}
        max={MAX_GRID_SIZE}
        value={gridSize}
        onChange={(e) => onGridSizeChange(parseInt(e.target.value))}
        disabled={disabled}
        className="w-full"
      />
      <div className="mt-2 flex justify-between text-xs text-foreground/60">
        <span>{MIN_GRID_SIZE}×{MIN_GRID_SIZE}</span>
        <span>{MAX_GRID_SIZE}×{MAX_GRID_SIZE}</span>
      </div>
    </div>
  );
}
