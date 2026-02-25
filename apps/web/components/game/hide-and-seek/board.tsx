'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { HideAndSeekEngine } from '@/lib/games/hide-and-seek/engine';
import type { Position, Player, GameStatus } from '@/lib/games/hide-and-seek/types';
import { DEFAULT_GRID_SIZE, GEMS_TO_HIDE } from '@/lib/games/hide-and-seek/types';

interface GameBoardProps {
  gridSize?: number;
  onGameEnd?: (winner: Player) => void;
  onStatusChange?: (status: GameStatus) => void;
}

const GEM_EMOJI = '💎';

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

function hasPos(list: Position[], pos: Position): boolean {
  return list.some((p) => p.row === pos.row && p.col === pos.col);
}

export function GameBoard({ gridSize, onGameEnd, onStatusChange }: GameBoardProps) {
  const engine = useMemo(() => new HideAndSeekEngine(1, gridSize ?? DEFAULT_GRID_SIZE), []);
  const [gameState, setGameState] = useState(() => engine.getState());
  const [lastGuessCorrect, setLastGuessCorrect] = useState<number | null>(null);
  /** When true, show all gem locations to the seeker before starting a new game */
  const [restartRevealMode, setRestartRevealMode] = useState(false);

  const refresh = () => setGameState(engine.getState());

  // Sync external gridSize prop into engine (only takes effect during hiding phase)
  useEffect(() => {
    engine.setGridSize(gridSize ?? DEFAULT_GRID_SIZE);
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  // Notify parent when game phase changes
  useEffect(() => {
    onStatusChange?.(gameState.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status]);

  const hiderName = gameState.hider === 1 ? 'Abbee' : 'Dot';
  const seekerName = gameState.seeker === 1 ? 'Abbee' : 'Dot';
  const currentGridSize = gameState.gridSize;

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
      engine.startSeeking();
      setLastGuessCorrect(null);
      refresh();
    }
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
    setRestartRevealMode(false);
    refresh();
  };

  const handleSwitchRoles = () => {
    engine.switchRoles();
    setLastGuessCorrect(null);
    setRestartRevealMode(false);
    refresh();
  };

  const handleUseHint = () => {
    engine.useHint();
    refresh();
  };

  /** Reveal gem locations before confirming restart */
  const handleRestartRequest = () => {
    setRestartRevealMode(true);
  };

  const renderGrid = () => {
    const { status, hiddenGems, currentSelection, guesses, hintPosition } = gameState;
    const lastGuess = guesses[guesses.length - 1];

    return (
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${currentGridSize}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="Hide and seek grid"
      >
        {Array.from({ length: currentGridSize }).map((_, row) =>
          Array.from({ length: currentGridSize }).map((_, col) => {
            const pos: Position = { row, col };
            const key = posKey(pos);

            const isHiddenGem = hasPos(hiddenGems, pos);
            const isSelected = hasPos(currentSelection, pos);
            const wasInLastGuess = lastGuess ? hasPos(lastGuess.positions, pos) : false;
            const isRevealed = (status === 'ended' || restartRevealMode) && isHiddenGem;
            const isHinted =
              !restartRevealMode &&
              hintPosition !== null &&
              hintPosition.row === row &&
              hintPosition.col === col;

            let cellClass =
              'relative flex items-center justify-center rounded-full border-2 aspect-square transition-all select-none ';

            if (status === 'hiding') {
              if (isHiddenGem) {
                cellClass += 'cursor-pointer border-cherry-blossom bg-cherry-blossom/40 scale-105 shadow-md';
              } else {
                cellClass += 'cursor-pointer border-foreground/20 bg-background hover:border-cherry-blossom/60 hover:bg-cherry-blossom/10';
              }
            } else if (status === 'seeking') {
              if (restartRevealMode) {
                if (isRevealed) {
                  cellClass += 'cursor-default border-cherry-blossom bg-cherry-blossom/40';
                } else {
                  cellClass += 'cursor-default border-foreground/20 bg-background';
                }
              } else if (isHinted && !isSelected) {
                cellClass += 'cursor-pointer border-cherry-blossom bg-cherry-blossom/20 hover:border-dusty-mauve/60 hover:bg-dusty-mauve/10';
              } else if (isSelected) {
                cellClass += 'cursor-pointer border-dusty-mauve bg-dusty-mauve/40 scale-105 shadow-md';
              } else if (wasInLastGuess) {
                cellClass += 'cursor-pointer border-foreground/30 bg-foreground/5 hover:border-dusty-mauve/60 hover:bg-dusty-mauve/10';
              } else {
                cellClass += 'cursor-pointer border-foreground/20 bg-background hover:border-dusty-mauve/60 hover:bg-dusty-mauve/10';
              }
            } else if (status === 'ended') {
              if (isRevealed) {
                cellClass += 'cursor-default border-cherry-blossom bg-cherry-blossom/40';
              } else {
                cellClass += 'cursor-default border-foreground/20 bg-background';
              }
            }

            const onClick =
              status === 'hiding'
                ? () => handleHidingClick(pos)
                : status === 'seeking' && !restartRevealMode
                  ? () => handleSeekingClick(pos)
                  : undefined;

            return (
              <div
                key={key}
                className={cellClass}
                style={{ minWidth: '36px', minHeight: '36px' }}
                onClick={onClick}
                role="gridcell"
                aria-label={`Cell ${row + 1},${col + 1}${isRevealed ? ' - gem' : ''}${isSelected ? ' - selected' : ''}${isHinted ? ' - hint' : ''}`}
              >
                {status === 'hiding' && isHiddenGem && (
                  <span className="text-sm md:text-base" aria-hidden="true">
                    {GEM_EMOJI}
                  </span>
                )}
                {restartRevealMode && isRevealed && (
                  <span className="text-sm md:text-base" aria-hidden="true">
                    {GEM_EMOJI}
                  </span>
                )}
                {status === 'seeking' && !restartRevealMode && isHinted && !isSelected && (
                  <span className="text-sm md:text-base" aria-hidden="true" title="Hint from Abbee!">
                    🐝
                  </span>
                )}
                {status === 'seeking' && !restartRevealMode && isSelected && (
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
        <div className="text-center">
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
        </div>
      )}

      {gameState.status === 'seeking' && !restartRevealMode && (
        <div className="text-center">
          <p className="text-lg font-semibold">
            <span className="text-dusty-mauve">{seekerName}</span> is searching!
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

      {gameState.status === 'seeking' && restartRevealMode && (
        <div className="text-center">
          <p className="text-lg font-semibold text-cherry-blossom">
            Here&apos;s where the gems were! 💎
          </p>
          <p className="text-sm text-foreground/60">
            {hiderName} had hidden the gems in these spots.
          </p>
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

        {gameState.status === 'seeking' && !restartRevealMode && (
          <div className="flex w-full gap-3">
            <button
              onClick={handleSubmitGuess}
              disabled={gameState.currentSelection.length !== GEMS_TO_HIDE}
              className="flex-1 rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            >
              Reveal! 🔍
            </button>
            <button
              onClick={handleUseHint}
              disabled={gameState.hintUsed}
              title={gameState.hintUsed ? 'Hint already used' : 'Ask Abbee for a hint!'}
              className="rounded-lg border-2 border-cherry-blossom px-4 py-3 text-sm font-bold text-cherry-blossom transition-all hover:bg-cherry-blossom/10 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cherry-blossom focus:ring-offset-2"
            >
              🐝 Hint
            </button>
            <button
              onClick={handleRestartRequest}
              title="Restart the game"
              className="rounded-lg border border-foreground/30 px-3 py-3 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            >
              ↺
            </button>
          </div>
        )}

        {gameState.status === 'seeking' && restartRevealMode && (
          <button
            onClick={handleReset}
            className="w-full rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          >
            New Game
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
      {gameState.guesses.length > 0 && !restartRevealMode && (
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
