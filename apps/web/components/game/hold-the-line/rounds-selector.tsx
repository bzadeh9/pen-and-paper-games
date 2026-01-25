'use client';

import React from 'react';

interface RoundsSelectorProps {
  rounds: number;
  onRoundsChange: (rounds: number) => void;
  disabled?: boolean;
}

export function RoundsSelector({
  rounds,
  onRoundsChange,
  disabled = false,
}: RoundsSelectorProps) {
  const roundOptions = [1, 3, 5, 7];

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground/60">
        Select number of rounds (best of):
      </p>
      <div className="grid grid-cols-4 gap-2">
        {roundOptions.map((option) => (
          <button
            key={option}
            onClick={() => onRoundsChange(option)}
            disabled={disabled}
            className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-foreground/50 ${
              rounds === option
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 bg-background text-foreground hover:border-foreground/40'
            } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            aria-label={`Select ${option} round${option > 1 ? 's' : ''}`}
            aria-pressed={rounds === option}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
