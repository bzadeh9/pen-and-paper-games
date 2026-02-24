'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { DrawColor } from '@/lib/games/scribbl/types';

interface ColorPickerProps {
  colors: DrawColor[];
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ colors, selected, onSelect }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {colors.map((color) => (
        <button
          key={color.value}
          onClick={() => onSelect(color.value)}
          title={color.name}
          className={cn(
            'w-8 h-8 rounded-full border-2 transition-all hover:scale-110 active:scale-95',
            selected === color.value
              ? 'border-foreground scale-110 shadow-md ring-2 ring-foreground/30 ring-offset-1'
              : 'border-foreground/20 hover:border-foreground/50'
          )}
          style={{ backgroundColor: color.value }}
          aria-label={`Select ${color.name} color`}
          aria-pressed={selected === color.value}
        />
      ))}
    </div>
  );
}
