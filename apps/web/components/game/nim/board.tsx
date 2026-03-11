'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { GameState } from '@/lib/games/nim/types';

interface BoardProps {
  gameState: GameState;
  onMove: (rowIndex: number, count: number) => void;
  player1Name: string;
  player2Name: string;
}

export function Board({ gameState, onMove, player1Name, player2Name }: BoardProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [hoverCount, setHoverCount] = useState<number>(0);

  const isPlaying = gameState.status === 'playing';

  const handleItemClick = useCallback(
    (rowIndex: number, itemIndex: number) => {
      if (!isPlaying) return;
      if (gameState.rows[rowIndex] === 0) return;

      // itemIndex is 0-based; clicking on item i means removing items from
      // the end of the row down to (and including) item i.
      // So count = row length - itemIndex
      const count = gameState.rows[rowIndex] - itemIndex;
      onMove(rowIndex, count);
      setSelectedRow(null);
      setHoverCount(0);
    },
    [isPlaying, gameState.rows, onMove]
  );

  const handleItemHover = useCallback(
    (rowIndex: number, itemIndex: number) => {
      if (!isPlaying) return;
      if (gameState.rows[rowIndex] === 0) return;
      setSelectedRow(rowIndex);
      // Items from itemIndex to end will be "selected" for removal
      setHoverCount(gameState.rows[rowIndex] - itemIndex);
    },
    [isPlaying, gameState.rows]
  );

  const handleMouseLeave = useCallback(() => {
    setSelectedRow(null);
    setHoverCount(0);
  }, []);

  const maxItems = useMemo(
    () => Math.max(...gameState.rows),
    [gameState.rows]
  );

  const currentPlayerName =
    gameState.currentPlayer === 1 ? player1Name : player2Name;

  return (
    <div className="flex flex-col items-center gap-4 p-4 md:p-6">
      {gameState.rows.map((rowCount, rowIndex) => {
        const isHoveredRow = selectedRow === rowIndex;
        // Items that would be removed start at (rowCount - hoverCount)
        const removeStart = isHoveredRow ? rowCount - hoverCount : rowCount;

        return (
          <div
            key={rowIndex}
            className="flex items-center gap-1 justify-center"
            onMouseLeave={handleMouseLeave}
          >
            <span className="w-6 text-center text-xs font-medium text-foreground/40 mr-1">
              {rowCount}
            </span>
            <div className="flex gap-1.5 md:gap-2">
              {Array.from({ length: maxItems }, (_, itemIndex) => {
                if (itemIndex >= rowCount) {
                  // Empty slot (item was removed or never existed in this row)
                  return (
                    <div
                      key={itemIndex}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-dashed border-foreground/10"
                      aria-hidden="true"
                    />
                  );
                }

                const wouldBeRemoved = isHoveredRow && itemIndex >= removeStart;

                return (
                  <button
                    key={itemIndex}
                    onClick={() => handleItemClick(rowIndex, itemIndex)}
                    onMouseEnter={() => handleItemHover(rowIndex, itemIndex)}
                    disabled={!isPlaying}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 transition-all duration-150
                      ${
                        wouldBeRemoved
                          ? gameState.currentPlayer === 1
                            ? 'border-dusk-blue bg-dusk-blue/30 scale-110'
                            : 'border-cherry-blossom bg-cherry-blossom/30 scale-110'
                          : 'border-foreground/30 bg-foreground/10 hover:border-foreground/50'
                      }
                      ${isPlaying ? 'cursor-pointer' : 'cursor-default'}
                    `}
                    aria-label={`Row ${rowIndex + 1}, item ${itemIndex + 1}${wouldBeRemoved ? ' (will be removed)' : ''}`}
                  >
                    <div
                      className={`w-full h-full rounded-full ${
                        wouldBeRemoved ? 'opacity-50' : ''
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {isPlaying && selectedRow !== null && hoverCount > 0 && (
        <p className="text-sm text-foreground/50 mt-2">
          {currentPlayerName} removes {hoverCount} from row {selectedRow + 1}
        </p>
      )}
    </div>
  );
}
