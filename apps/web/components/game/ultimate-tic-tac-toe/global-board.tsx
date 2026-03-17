'use client';

import React from 'react';
import { LocalBoard } from './local-board';
import type { GameState } from '@/lib/games/ultimate-tic-tac-toe/types';

interface GlobalBoardProps {
  gameState: GameState;
  onCellClick: (
    localRow: number,
    localCol: number,
    cellRow: number,
    cellCol: number
  ) => void;
}

export function GlobalBoard({ gameState, onCellClick }: GlobalBoardProps) {
  const isLocalBoardActive = (localRow: number, localCol: number): boolean => {
    if (gameState.status !== 'playing') return false;
    if (gameState.mode === 'standard') return true;

    // In strict mode
    if (!gameState.activeBoard) {
      // Any board is active if activeBoard is null
      return gameState.localBoards[localRow][localCol].winner === null;
    }

    // Only the active board is active
    return (
      gameState.activeBoard.row === localRow &&
      gameState.activeBoard.col === localCol
    );
  };

  const getBorderColor = () => {
    if (gameState.status !== 'playing') return 'border-foreground/30';
    if (gameState.currentPlayer === 'X') return 'border-periwinkle';
    if (gameState.currentPlayer === 'O') return 'border-mauve';
    return 'border-foreground/30';
  };

  return (
    <div
      className={`grid grid-cols-3 gap-3 rounded-xl border-4 bg-background p-3 transition-colors duration-300 ${getBorderColor()}`}
    >
      {gameState.localBoards.map((row, rowIndex) =>
        row.map((board, colIndex) => (
          <LocalBoard
            key={`${rowIndex}-${colIndex}`}
            board={board}
            isActive={isLocalBoardActive(rowIndex, colIndex)}
            onCellClick={(cellRow, cellCol) =>
              onCellClick(rowIndex, colIndex, cellRow, cellCol)
            }
          />
        ))
      )}
    </div>
  );
}
