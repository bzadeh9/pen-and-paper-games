'use client';

import React from 'react';
import { SetupMode } from '@/lib/games/splatter/engine';

interface SetupModeSelectorProps {
  setupMode: SetupMode;
  onSetupModeChange: (mode: SetupMode) => void;
  disabled?: boolean;
}

export function SetupModeSelector({
  setupMode,
  onSetupModeChange,
  disabled = false,
}: SetupModeSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">Setup Mode</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSetupModeChange('auto')}
          disabled={disabled}
          className={`rounded-md border-2 px-4 py-2 text-sm font-medium transition-all ${
            setupMode === 'auto'
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground/20 hover:border-foreground/40'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          Auto
        </button>
        <button
          onClick={() => onSetupModeChange('manual')}
          disabled={disabled}
          className={`rounded-md border-2 px-4 py-2 text-sm font-medium transition-all ${
            setupMode === 'manual'
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground/20 hover:border-foreground/40'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          Manual
        </button>
      </div>
      <p className="mt-2 text-xs text-foreground/60">
        {setupMode === 'auto'
          ? 'Board will be randomly filled'
          : 'Players take turns placing dots'}
      </p>
    </div>
  );
}
