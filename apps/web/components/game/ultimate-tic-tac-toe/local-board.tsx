'use client';

import React from 'react';
import { Cell } from './cell';
import type { LocalBoard as LocalBoardType } from '@/lib/games/ultimate-tic-tac-toe/types';

interface LocalBoardProps {
  board: LocalBoardType;
  isActive: boolean;
  onCellClick: (cellRow: number, cellCol: number) => void;
}

export function LocalBoard({ board, isActive, onCellClick }: LocalBoardProps) {
  const hasWinner = board.winner !== null;

  const getWinnerColor = () => {
    if (board.winner === 'X') return 'text-dusty-mauve';
    if (board.winner === 'O') return 'text-pastel-pink';
    return 'text-foreground/60';
  };

  return (
    <div
      className={`
        relative rounded-lg border-2 transition-all duration-300 p-1
        ${isActive ? 'border-cherry-blossom shadow-lg shadow-cherry-blossom/30' : 'border-foreground/20'}
        ${hasWinner ? 'bg-foreground/5' : 'bg-background'}
      `}
    >
      {/* Winner overlay */}
      {hasWinner && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80">
          <span className={`text-6xl font-bold ${getWinnerColor()}`}>
            {board.winner === 'draw' ? '=' : board.winner}
          </span>
        </div>
      )}

      {/* 3x3 grid of cells */}
      <div className="grid grid-cols-3 gap-1">
        {board.cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              onClick={() => onCellClick(rowIndex, colIndex)}
              isActive={isActive && !hasWinner}
              isDisabled={hasWinner || cell !== null}
            />
          ))
        )}
      </div>
    </div>
  );
}
