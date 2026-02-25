'use client';

import React, { useState, useMemo } from 'react';
import { HideAndSeekEngine } from '@/lib/games/hide-and-seek/engine';
import type { Position, Player } from '@/lib/games/hide-and-seek/types';
import { MIN_GRID_SIZE, MAX_GRID_SIZE, GEMS_TO_HIDE } from '@/lib/games/hide-and-seek/types';

interface GameBoardProps {
  onGameEnd?: (winner: Player) => void;
}

const GEM_EMOJI = '💎';

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

function hasPos(list: Position[], pos: Position): boolean {
  return list.some((p) => p.row === pos.row && p.col === pos.col);
}

export function GameBoard({ onGameEnd }: GameBoardProps) {
  const engine = useMemo(() => new HideAndSeekEngine(), []);
  const [gameState, setGameState] = useState(() => engine.getState());
  const [lastGuessCorrect, setLastGuessCorrect] = useState<number | null>(null);

  const refresh = () => setGameState(engine.getState());

  const hiderName = gameState.hider === 1 ? 'Abbee' : 'Dot';
  const seekerName = gameState.seeker === 1 ? 'Abbee' : 'Dot';
  const gridSize = gameState.gridSize;

  const handleHidingClick = (pos: Position) => {
    engine.toggleHidingGem(pos);
    refresh();
  };

  const handleSeekingClick = (pos: Position) => {
    engine.toggleSelection(pos);
    refresh();
  };

  const handleConfirmHiding = () => {
    if (engine.confirmHiding()) {
      refresh();
    }
  };

  const handleStartSeeking = () => {
    engine.startSeeking();
    setLastGuessCorrect(null);
    refresh();
  };

  const handleSubmitGuess = () => {
    const correct = engine.submitGuess();
    if (correct >= 0) {
      setLastGuessCorrect(correct);
      const newState = engine.getState();
      setGameState(newState);
      if (newState.status === 'ended' && newState.winner && onGameEnd) {
        onGameEnd(newState.winner);
      }
    }
  };

  const handleReset = () => {
    engine.reset();
    setLastGuessCorrect(null);
    refresh();
  };

  const handleSwitchRoles = () => {
    engine.switchRoles();
    setLastGuessCorrect(null);
    refresh();
  };

  const handleSetGridSize = (size: number) => {
    engine.setGridSize(size);
    refresh();
  };

  const renderGrid = () => {
    const { status, hiddenGems, currentSelection, guesses } = gameState;
    const lastGuess = guesses[guesses.length - 1];

    return (
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Hide and seek grid"
      >
        {Array.from({ length: gridSize }).map((_, row) =>
          Array.from({ length: gridSize }).map((_, col) => {
            const pos: Position = { row, col };
            const key = posKey(pos);

            const isHiddenGem = hasPos(hiddenGems, pos);
            const isSelected = hasPos(currentSelection, pos);
            const wasInLastGuess = lastGuess ? hasPos(lastGuess.positions, pos) : false;
            const isRevealed = status === 'ended' && isHiddenGem;

            let cellClass =
              'relative flex items-center justify-center rounded-full border-2 aspect-square transition-all cursor-pointer select-none ';

            if (status === 'hiding') {
              if (isHiddenGem) {
                cellClass +=
                  'border-cherry-blossom bg-cherry-blossom/40 scale-105 shadow-md';
              } else {
                cellClass +=
                  'border-foreground/20 bg-background hover:border-cherry-blossom/60 hover:bg-cherry-blossom/10';
              }
            } else if (status === 'transition') {
              if (isHiddenGem) {
                cellClass += 'border-cherry-blossom bg-cherry-blossom/40';
              } else {
                cellClass += 'border-foreground/20 bg-background cursor-default';
              }
            } else if (status === 'seeking') {
              if (isSelected) {
                cellClass +=
                  'border-dusty-mauve bg-dusty-mauve/40 scale-105 shadow-md';
              } else if (wasInLastGuess) {
                cellClass +=
                  'border-foreground/30 bg-foreground/5 hover:border-dusty-mauve/60 hover:bg-dusty-mauve/10';
              } else {
                cellClass +=
                  'border-foreground/20 bg-background hover:border-dusty-mauve/60 hover:bg-dusty-mauve/10';
              }
            } else if (status === 'ended') {
              if (isRevealed) {
                cellClass += 'border-cherry-blossom bg-cherry-blossom/40';
              } else {
                cellClass += 'border-foreground/20 bg-background cursor-default';
              }
            }

            const onClick =
              status === 'hiding'
                ? () => handleHidingClick(pos)
                : status === 'seeking'
                  ? () => handleSeekingClick(pos)
                  : undefined;

            return (
              <div
                key={key}
                className={cellClass}
                style={{ minWidth: '36px', minHeight: '36px' }}
                onClick={onClick}
                role="gridcell"
                aria-label={`Cell ${row + 1},${col + 1}${isHiddenGem && (status === 'hiding' || status === 'transition' || status === 'ended') ? ' - gem' : ''}${isSelected ? ' - selected' : ''}`}
              >
                {(status === 'hiding' || status === 'transition') && isHiddenGem && (
                  <span className="text-sm md:text-base" aria-hidden="true">
                    {GEM_EMOJI}
                  </span>
                )}
                {status === 'seeking' && isSelected && (
                  <span className="text-sm md:text-base" aria-hidden="true">
                    ✨
                  </span>
                )}
                {status === 'ended' && isRevealed && (
                  <span className="text-sm md:text-base" aria-hidden="true">
                    {GEM_EMOJI}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      {/* Phase header */}
      {gameState.status === 'hiding' && (
        <div className="text-center w-full">
          <p className="text-lg font-semibold">
            <span className="text-cherry-blossom">{hiderName}</span> is hiding the gems!
          </p>
          <p className="text-sm text-foreground/60">
            Select {GEMS_TO_HIDE} gems to hide.{' '}
            <span className="font-medium text-cherry-blossom">
              {gameState.hiddenGems.length}/{GEMS_TO_HIDE}
            </span>{' '}
            placed.
          </p>

          {/* Grid size selector */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-xs text-foreground/50">Grid size:</span>
            {Array.from({ length: MAX_GRID_SIZE - MIN_GRID_SIZE + 1 }, (_, i) => MIN_GRID_SIZE + i).map((size) => (
              <button
                key={size}
                onClick={() => handleSetGridSize(size)}
                className={`rounded-md border px-2 py-0.5 text-xs font-medium transition-all ${
                  gridSize === size
                    ? 'border-cherry-blossom bg-cherry-blossom/20 text-cherry-blossom'
                    : 'border-foreground/20 text-foreground/50 hover:border-foreground/40 hover:text-foreground/70'
                }`}
                aria-pressed={gridSize === size}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameState.status === 'transition' && (
        <div className="text-center">
          <p className="text-lg font-semibold text-cherry-blossom">
            Gems hidden! ✅
          </p>
          <p className="text-sm text-foreground/60">
            Pass the device to{' '}
            <span className="font-semibold">{seekerName}</span>, then tap
            &quot;Start Seeking&quot;.
          </p>
        </div>
      )}

      {gameState.status === 'seeking' && (
        <div className="text-center">
          <p className="text-lg font-semibold">
            <span className="text-dusty-mauve">{seekerName}</span> is
            searching!
          </p>
          {lastGuessCorrect !== null && (
            <p className="mt-2 rounded-lg border border-foreground/20 bg-background px-4 py-2 text-sm font-medium">
              Last guess:{' '}
              <span className="font-bold text-dusty-mauve">
                {lastGuessCorrect} / {GEMS_TO_HIDE}
              </span>{' '}
              correct · Attempt {gameState.guesses.length}
            </p>
          )}
        </div>
      )}

      {gameState.status === 'ended' && (
        <div className="text-center">
          <p className="text-2xl font-bold">🎉 Found them all!</p>
          <p className="text-lg text-foreground/70">
            <span className="font-semibold text-dusty-mauve">{seekerName}</span>{' '}
            found all {GEMS_TO_HIDE} gems in{' '}
            <span className="font-semibold">{gameState.guesses.length}</span>{' '}
            {gameState.guesses.length === 1 ? 'guess' : 'guesses'}!
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="w-full">{renderGrid()}</div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3 w-full">
        {gameState.status === 'hiding' && (
          <button
            onClick={handleConfirmHiding}
            disabled={gameState.hiddenGems.length !== GEMS_TO_HIDE}
            className="w-full rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          >
            Hide Gems →
          </button>
        )}

        {gameState.status === 'transition' && (
          <button
            onClick={handleStartSeeking}
            className="w-full rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          >
            Start Seeking!
          </button>
        )}

        {gameState.status === 'seeking' && (
          <button
            onClick={handleSubmitGuess}
            disabled={gameState.currentSelection.length !== GEMS_TO_HIDE}
            className="w-full rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          >
            Reveal! 🔍
          </button>
        )}

        {gameState.status === 'ended' && (
          <div className="flex w-full gap-3">
            <button
              onClick={handleReset}
              className="flex-1 rounded-lg border border-foreground/30 px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            >
              Play Again
            </button>
            <button
              onClick={handleSwitchRoles}
              className="flex-1 rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            >
              Switch Roles
            </button>
          </div>
        )}
      </div>

      {/* Guess history */}
      {gameState.guesses.length > 0 && (
        <div className="w-full">
          <h3 className="mb-2 text-sm font-semibold text-foreground/70">
            Guess History
          </h3>
          <div className="flex flex-col gap-1">
            {gameState.guesses.map((g, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-foreground/10 bg-background px-3 py-2 text-sm"
              >
                <span className="text-foreground/60">Guess {i + 1}</span>
                <span
                  className={`font-bold ${
                    g.correct === GEMS_TO_HIDE
                      ? 'text-cherry-blossom'
                      : g.correct >= 2
                        ? 'text-dusty-mauve'
                        : 'text-foreground/50'
                  }`}
                >
                  {g.correct} / {GEMS_TO_HIDE} correct
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
