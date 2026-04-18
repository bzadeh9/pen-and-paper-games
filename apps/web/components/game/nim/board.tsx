'use client';

import React, { useCallback, useState } from 'react';
import type { GameState } from '@/lib/games/nim/types';
import { Button } from '@/components/ui/button';

interface BoardProps {
  gameState: GameState;
  onMove: (rowIndex: number, count: number, startIndex?: number) => void;
  player1Name: string;
  player2Name: string;
}

const LINE_SIZE_CLASSES = 'h-8 w-1.5 md:h-10 md:w-2';
const ROW_GAP_CLASSES = 'gap-3 md:gap-4';
const LINE_FOCUS_CLASSES =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 focus-visible:ring-offset-1';

export function Board({ gameState, onMove, player1Name, player2Name }: BoardProps) {
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [activeGroupEnd, setActiveGroupEnd] = useState<number | null>(null);
  const [removeStart, setRemoveStart] = useState<number | null>(null);
  const [removeCount, setRemoveCount] = useState<number>(0);
  const [selectionBase, setSelectionBase] = useState<boolean[][] | null>(null);

  const isPlaying = gameState.status === 'playing';

  const clearTurnSelection = useCallback(() => {
    setActiveRow(null);
    setActiveGroupEnd(null);
    setRemoveStart(null);
    setRemoveCount(0);
    setSelectionBase(null);
  }, []);

  const isSelectionActive =
    isPlaying &&
    activeRow !== null &&
    removeStart !== null &&
    activeGroupEnd !== null &&
    selectionBase === gameState.rowStates;
  const selectedRow = isSelectionActive ? activeRow : null;
  const selectedStart = isSelectionActive ? removeStart : null;
  const selectedGroupEnd = isSelectionActive ? activeGroupEnd : null;
  const selectedCount = isSelectionActive ? removeCount : 0;

  const getGroupEnd = useCallback((row: boolean[], startIndex: number): number => {
    let end = startIndex;
    while (end + 1 < row.length && row[end + 1]) {
      end += 1;
    }
    return end;
  }, []);

  const getNextSelectableIndex = useCallback((): number | null => {
    if (selectedRow === null || selectedStart === null || selectedGroupEnd === null) {
      return null;
    }
    const nextIndex = selectedStart + selectedCount;
    if (nextIndex > selectedGroupEnd) return null;
    return gameState.rowStates[selectedRow][nextIndex] ? nextIndex : null;
  }, [selectedRow, selectedGroupEnd, selectedCount, selectedStart, gameState.rowStates]);

  const handleLineCrossOut = useCallback(
    (rowIndex: number, lineIndex: number) => {
      if (!isPlaying || !gameState.rowStates[rowIndex][lineIndex]) return;

      if (selectedRow === null) {
        const groupEnd = getGroupEnd(gameState.rowStates[rowIndex], lineIndex);
        setActiveRow(rowIndex);
        setActiveGroupEnd(groupEnd);
        setRemoveStart(lineIndex);
        setRemoveCount(1);
        setSelectionBase(gameState.rowStates);
        return;
      }

      const nextIndex = getNextSelectableIndex();
      if (rowIndex !== selectedRow || nextIndex === null || lineIndex !== nextIndex) return;
      setRemoveCount((count) => count + 1);
    },
    [
      isPlaying,
      gameState.rowStates,
      selectedRow,
      getGroupEnd,
      getNextSelectableIndex,
    ]
  );

  const currentPlayerName =
    gameState.currentPlayer === 1 ? player1Name : player2Name;

  const nextSelectableIndex = getNextSelectableIndex();

  const handleDone = useCallback(() => {
    if (!isPlaying || selectedRow === null || selectedStart === null || selectedCount < 1) return;
    onMove(selectedRow, selectedCount, selectedStart);
    clearTurnSelection();
  }, [isPlaying, selectedRow, selectedStart, selectedCount, onMove, clearTurnSelection]);

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-6">
      {gameState.rows.map((rowCount, rowIndex) => {
        const isSelectedRow = selectedRow === rowIndex;
        const isRowInteractable =
          isPlaying && rowCount > 0 && (selectedRow === null || isSelectedRow);
        const rowClasses = ['flex', ROW_GAP_CLASSES, 'justify-center'].join(' ');

        return (
          <div
            key={rowIndex}
            className="flex items-center justify-center gap-2"
          >
            <span className="mr-2 w-6 text-center text-xs font-medium text-foreground/40">
              {rowCount}
            </span>
            <div
              role="group"
              className={`${rowClasses} rounded-lg border px-3 py-2 transition-colors ${
                isSelectedRow
                  ? gameState.currentPlayer === 1
                    ? 'border-periwinkle bg-periwinkle/10'
                    : 'border-powder-blush bg-powder-blush/10'
                  : 'border-transparent hover:border-foreground/20'
              } ${isRowInteractable ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
              aria-label={`Row ${rowIndex + 1} with ${rowCount} lines${isSelectedRow ? ', active group selected' : ''}`}
            >
              {gameState.rowStates[rowIndex].map((isActive, itemIndex) => {
                const isPreviewedSegment =
                  isSelectedRow &&
                  selectedStart !== null &&
                  itemIndex >= selectedStart &&
                  itemIndex < selectedStart + selectedCount;
                const isWithinActiveGroup =
                  isSelectedRow &&
                  selectedStart !== null &&
                  selectedGroupEnd !== null &&
                  itemIndex >= selectedStart &&
                  itemIndex <= selectedGroupEnd;
                const lineColorClass = !isActive
                  ? 'bg-foreground/20'
                  : isPreviewedSegment
                    ? gameState.currentPlayer === 1
                      ? 'bg-periwinkle'
                      : 'bg-powder-blush'
                    : 'bg-foreground/70';
                const isSelectableLine = isPlaying && isActive && (
                  selectedRow === null ||
                  (isSelectedRow && nextSelectableIndex !== null && itemIndex === nextSelectableIndex)
                );
                const activeGroupClass = isWithinActiveGroup && !isPreviewedSegment
                  ? 'ring-1 ring-foreground/20'
                  : '';

                if (isSelectableLine) {
                  return (
                    <button
                      key={itemIndex}
                      type="button"
                      className={`rounded px-1 py-1 ${LINE_FOCUS_CLASSES}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleLineCrossOut(rowIndex, itemIndex);
                      }}
                      aria-label={`Cross out line ${itemIndex + 1} in row ${rowIndex + 1}`}
                    >
                      <span
                        className={`${LINE_SIZE_CLASSES} inline-block rounded-full ${lineColorClass} ${activeGroupClass}`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                }

                return (
                  <span
                    key={itemIndex}
                    className={`${LINE_SIZE_CLASSES} inline-block rounded-full ${lineColorClass} ${activeGroupClass}`}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {isPlaying && (
        <div className="w-full max-w-md rounded-lg border border-foreground/20 bg-background p-3 md:p-4">
          <p className="mb-3 text-center text-sm text-foreground/60">
            {currentPlayerName}
          </p>
          <p className="mb-3 text-center text-xs text-foreground/50">
            {selectedRow === null
              ? 'Tap/click any active line to start crossing out that group.'
              : `Keep crossing out subsequent lines in row ${selectedRow + 1}, then end your turn.`}
          </p>
          <div
            className="mb-3 text-center text-sm font-medium"
            aria-live="polite"
            aria-atomic="true"
          >
            {selectedCount > 0 && selectedRow !== null
              ? `Crossed out ${selectedCount} line${selectedCount === 1 ? '' : 's'} in row ${selectedRow + 1}`
              : 'No lines crossed out this turn yet'}
          </div>
          <div className="flex items-center justify-center">
            <Button
              type="button"
              onClick={handleDone}
              disabled={selectedCount < 1}
              aria-label="I'm done with my turn"
            >
              I&apos;m done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
