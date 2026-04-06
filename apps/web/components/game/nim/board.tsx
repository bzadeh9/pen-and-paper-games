'use client';

import React, { useCallback, useState } from 'react';
import type { GameState } from '@/lib/games/nim/types';
import { Button } from '@/components/ui/button';

interface BoardProps {
  gameState: GameState;
  onMove: (rowIndex: number, count: number) => void;
  player1Name: string;
  player2Name: string;
}

const LINE_SIZE_CLASSES = 'h-8 w-1.5 md:h-10 md:w-2';
const ROW_GAP_CLASSES = 'gap-3 md:gap-4';

export function Board({ gameState, onMove, player1Name, player2Name }: BoardProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [removeCount, setRemoveCount] = useState<number>(1);

  const isPlaying = gameState.status === 'playing';

  const handleRowSelect = useCallback(
    (rowIndex: number) => {
      if (!isPlaying) return;
      if (gameState.rows[rowIndex] === 0) return;
      setSelectedRow(rowIndex);
      setRemoveCount((current) => Math.min(current, gameState.rows[rowIndex]));
    },
    [isPlaying, gameState.rows]
  );

  const handleRemove = useCallback(() => {
    if (!isPlaying || selectedRow === null) return;
    const rowRemaining = gameState.rows[selectedRow];
    if (rowRemaining <= 0) return;
    const count = Math.min(removeCount, rowRemaining);
    onMove(selectedRow, count);
    setSelectedRow(null);
    setRemoveCount(1);
  }, [isPlaying, selectedRow, gameState.rows, removeCount, onMove]);

  const currentPlayerName =
    gameState.currentPlayer === 1 ? player1Name : player2Name;

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-6">
      {gameState.rows.map((rowCount, rowIndex) => {
        const isSelectedRow = selectedRow === rowIndex;
        const rowClasses = ['flex', ROW_GAP_CLASSES, 'justify-center'].join(' ');

        return (
          <div
            key={rowIndex}
            className="flex items-center justify-center gap-2"
          >
            <span className="mr-2 w-6 text-center text-xs font-medium text-foreground/40">
              {rowCount}
            </span>
            <button
              onClick={() => handleRowSelect(rowIndex)}
              disabled={!isPlaying || rowCount === 0}
              className={`${rowClasses} rounded-lg border px-3 py-2 transition-colors ${
                isSelectedRow
                  ? gameState.currentPlayer === 1
                    ? 'border-periwinkle bg-periwinkle/10'
                    : 'border-powder-blush bg-powder-blush/10'
                  : 'border-transparent hover:border-foreground/20'
              } ${isPlaying && rowCount > 0 ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
              aria-label={`Select row ${rowIndex + 1} with ${rowCount} lines`}
            >
              {Array.from({ length: rowCount }, (_, itemIndex) => {
                return (
                  <span
                    key={itemIndex}
                    className={`${LINE_SIZE_CLASSES} inline-block rounded-full bg-foreground/70`}
                    aria-hidden="true"
                  />
                );
              })}
            </button>
          </div>
        );
      })}

      {isPlaying && selectedRow !== null && gameState.rows[selectedRow] > 0 && (
        <div className="w-full max-w-md rounded-lg border border-foreground/20 bg-background p-3 md:p-4">
          <p className="mb-3 text-center text-sm text-foreground/60">
            {currentPlayerName}: row {selectedRow + 1}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRemoveCount((current) => Math.max(1, current - 1))}
              disabled={removeCount === 1}
              aria-label="Remove one fewer line"
            >
              −
            </Button>
            <span
              className="min-w-24 text-center text-sm font-medium"
              aria-live="polite"
              aria-atomic="true"
            >
              Remove {removeCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setRemoveCount((current) =>
                  Math.min(gameState.rows[selectedRow], current + 1)
                )
              }
              disabled={removeCount === gameState.rows[selectedRow]}
              aria-label="Remove one more line"
            >
              +
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleRemove}
              aria-label={`Confirm removing ${removeCount} lines from row ${selectedRow + 1}`}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
