'use client';

import React from 'react';
import type { CellState } from '@/lib/games/ultimate-tic-tac-toe/types';

interface CellProps {
  value: CellState;
  onClick: () => void;
  isActive: boolean;
  isDisabled: boolean;
}

export function Cell({ value, onClick, isActive, isDisabled }: CellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative aspect-square w-full border border-foreground/20 
        transition-all duration-200
        ${isActive && !isDisabled ? 'bg-cherry-blossom/10 hover:bg-cherry-blossom/20 cursor-pointer' : ''}
        ${!isActive || isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${!isDisabled && !value ? 'hover:bg-foreground/5' : ''}
      `}
    >
      {value && (
        <span className="text-2xl font-bold">
          {value}
        </span>
      )}
    </button>
  );
}
