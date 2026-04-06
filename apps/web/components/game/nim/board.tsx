'use client';

import React, { useCallback, useState } from 'react';
import type { GameState } from '@/lib/games/nim/types';
import { Button } from '@/components/ui/button';
import {
  getFirstValidSegmentStart,
  getValidSegmentStarts,
} from '@/lib/games/nim/segments';

interface BoardProps {
  gameState: GameState;
  onMove: (rowIndex: number, count: number, startIndex?: number) => void;
  player1Name: string;
  player2Name: string;
}

const LINE_SIZE_CLASSES = 'h-8 w-1.5 md:h-10 md:w-2';
const ROW_GAP_CLASSES = 'gap-3 md:gap-4';

export function Board({ gameState, onMove, player1Name, player2Name }: BoardProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [removeCount, setRemoveCount] = useState<number>(1);
  const [removeStart, setRemoveStart] = useState<number>(0);

  const isPlaying = gameState.status === 'playing';

  const handleRowSelect = useCallback(
    (rowIndex: number) => {
      if (!isPlaying) return;
      if (gameState.rows[rowIndex] === 0) return;
      setSelectedRow(rowIndex);
      const nextCount = Math.min(removeCount, gameState.rows[rowIndex]);
      const nextStart = getFirstValidSegmentStart(gameState.rowStates[rowIndex], nextCount) ?? 0;
      setRemoveCount(nextCount);
      setRemoveStart(nextStart);
    },
    [isPlaying, gameState.rows, gameState.rowStates, removeCount]
  );

  const validSegmentStarts =
    selectedRow === null
      ? []
      : getValidSegmentStarts(gameState.rowStates[selectedRow], removeCount);

  const handleRemove = useCallback(() => {
    if (!isPlaying || selectedRow === null) return;
    const rowRemaining = gameState.rows[selectedRow];
    if (rowRemaining <= 0) return;
    const count = Math.min(removeCount, rowRemaining);
    const startIndex = validSegmentStarts.includes(removeStart)
      ? removeStart
      : validSegmentStarts[0];
    if (startIndex === undefined) return;
    onMove(selectedRow, count, startIndex);
    setSelectedRow(null);
    setRemoveCount(1);
    setRemoveStart(0);
  }, [isPlaying, selectedRow, gameState.rows, removeCount, removeStart, onMove, validSegmentStarts]);

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
              {gameState.rowStates[rowIndex].map((isActive, itemIndex) => {
                return (
                  <span
                    key={itemIndex}
                    className={`${LINE_SIZE_CLASSES} inline-block rounded-full ${
                      isActive ? 'bg-foreground/70' : 'bg-foreground/20'
                    }`}
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
          <div className="mb-3 flex items-center justify-center gap-2">
            {validSegmentStarts.map((start, idx) => {
              let positionLabel = 'Middle';
              const totalPositions = validSegmentStarts.length;

              if (totalPositions === 1) {
                positionLabel = 'Only';
              } else if (idx === 0) {
                positionLabel = 'Left';
              } else if (idx === totalPositions - 1) {
                positionLabel = 'Right';
              } else if (totalPositions === 3) {
                positionLabel = 'Middle';
              } else if (totalPositions === 4) {
                positionLabel = idx === 1 ? 'Mid-Left' : 'Mid-Right';
              } else if (totalPositions > 4) {
                const middleIndex = Math.floor(totalPositions / 2);
                if (totalPositions % 2 === 1 && idx === middleIndex) {
                  positionLabel = 'Middle';
                } else if (idx < middleIndex) {
                  positionLabel = 'Mid-Left';
                } else {
                  positionLabel = 'Mid-Right';
                }
              }

              return (
                <Button
                  key={start}
                  type="button"
                  variant={removeStart === start ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRemoveStart(start)}
                  aria-label={`Select ${positionLabel.toLowerCase()} segment`}
                >
                  {positionLabel}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const nextCount = Math.max(1, removeCount - 1);
                setRemoveCount(nextCount);
                const nextStart =
                  getFirstValidSegmentStart(
                    gameState.rowStates[selectedRow],
                    nextCount
                  ) ?? 0;
                setRemoveStart(nextStart);
              }}
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
              Cross Out {removeCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const nextCount = Math.min(gameState.rows[selectedRow], removeCount + 1);
                setRemoveCount(nextCount);
                const nextStart =
                  getFirstValidSegmentStart(
                    gameState.rowStates[selectedRow],
                    nextCount
                  ) ?? 0;
                setRemoveStart(nextStart);
              }}
              disabled={removeCount === gameState.rows[selectedRow]}
              aria-label="Remove one more line"
            >
              +
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleRemove}
              disabled={!validSegmentStarts.includes(removeStart)}
              aria-label={`Confirm crossing out ${removeCount} lines from row ${selectedRow + 1}`}
            >
              Cross Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
