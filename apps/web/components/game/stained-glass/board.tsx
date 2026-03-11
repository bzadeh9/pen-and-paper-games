'use client';

import React from 'react';
import type { GameState } from '@/lib/games/stained-glass/types';
import { cn } from '@/lib/utils';

interface BoardProps {
  gameState: GameState;
  onSectionClick: (sectionId: number) => void;
}

export function Board({ gameState, onSectionClick }: BoardProps) {
  const gridSize = Math.round(Math.sqrt(gameState.sections.length));

  const getSectionColor = (sectionId: number) => {
    const section = gameState.sections[sectionId];
    if (section.owner === 1) return 'bg-dusty-mauve text-white';
    if (section.owner === 2) return 'bg-cherry-blossom text-white';
    return 'bg-gray-200 dark:bg-gray-700';
  };

  const isClickable = (sectionId: number) => {
    if (gameState.status !== 'playing') return false;
    const section = gameState.sections[sectionId];
    if (section.owner !== null) return false;

    const currentPlayer = gameState.currentPlayer;

    if (gameState.mode === 'standard') {
      const opponent = currentPlayer === 1 ? 2 : 1;
      return !section.neighbors.some(
        (nId) => gameState.sections[nId].owner === opponent
      );
    } else {
      return !section.neighbors.some(
        (nId) => gameState.sections[nId].owner === currentPlayer
      );
    }
  };

  const showSetupOverlay = gameState.status === 'setup';

  return (
    <div className="relative rounded-xl border-4 border-foreground/30 bg-background p-4">
      {showSetupOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-xl">
          <div className="text-center p-6">
            <p className="text-lg font-semibold text-foreground/80">
              Choose a mode and click Start Game
            </p>
          </div>
        </div>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        role="grid"
        aria-label="Stained glass game board"
      >
        {gameState.sections.map((section) => {
          const clickable = isClickable(section.id);
          return (
            <button
              key={section.id}
              onClick={() => onSectionClick(section.id)}
              disabled={!clickable}
              role="gridcell"
              aria-label={
                section.owner
                  ? `Section ${section.id + 1}, colored by Player ${section.owner}`
                  : clickable
                    ? `Section ${section.id + 1}, available`
                    : `Section ${section.id + 1}, unavailable`
              }
              className={cn(
                'aspect-square rounded-lg border-2 border-foreground/20 transition-all duration-200 flex items-center justify-center text-sm font-bold',
                getSectionColor(section.id),
                clickable && 'hover:scale-105 hover:shadow-lg cursor-pointer hover:border-foreground/50',
                !clickable && gameState.status === 'playing' && section.owner === null && 'opacity-50 cursor-not-allowed',
                section.owner !== null && 'shadow-inner'
              )}
            >
              {section.owner && (
                <span className="text-xs md:text-sm font-bold opacity-80">
                  P{section.owner}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
