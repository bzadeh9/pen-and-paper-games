'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { VirtueMemoryEngine } from '@/lib/games/virtue-memory/engine';
import { VIRTUE_EMOJI } from '@/lib/games/virtue-memory/types';
import type { Player } from '@/lib/games/virtue-memory/types';

const FLIP_DELAY_MS = 1000;

interface GameBoardProps {
  onGameEnd?: (winner: Player | null) => void;
}

export function GameBoard({ onGameEnd }: GameBoardProps) {
  const engine = useMemo(() => new VirtueMemoryEngine(), []);
  const [gameState, setGameState] = useState(() => engine.getState());

  const refresh = useCallback(() => setGameState(engine.getState()), [engine]);

  // When two non-matching cards are shown, close them after a delay
  useEffect(() => {
    if (!gameState.isChecking) return;
    const timer = setTimeout(() => {
      engine.closeCards();
      refresh();
    }, FLIP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [gameState.isChecking, engine, refresh]);

  // Notify parent on game end
  useEffect(() => {
    if (gameState.status === 'ended') {
      onGameEnd?.(gameState.winner);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status]);

  const handleCardClick = (index: number) => {
    engine.flipCard(index);
    refresh();
  };

  const handleReset = () => {
    engine.reset();
    refresh();
  };

  const playerName = (p: Player) => (p === 1 ? 'Abbee' : 'Dot');
  const playerColor = (p: Player) =>
    p === 1 ? 'text-powder-blush' : 'text-periwinkle';

  const { cards, currentPlayer, status, winner, scores, isChecking } = gameState;

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      {/* Score header */}
      <div className="flex w-full justify-around rounded-lg border border-foreground/20 bg-background p-3">
        {([1, 2] as Player[]).map((p) => (
          <div key={p} className="flex flex-col items-center gap-1">
            <span className={`text-sm font-semibold ${playerColor(p)}`}>
              {playerName(p)}
            </span>
            <span className={`text-2xl font-bold ${playerColor(p)}`}>
              {scores[p]}
            </span>
            <span className="text-xs text-foreground/50">pairs</span>
          </div>
        ))}
      </div>

      {/* Current-turn indicator */}
      {status === 'playing' && (
        <p className="text-sm text-foreground/70">
          {isChecking ? (
            <span>Not a match — closing cards…</span>
          ) : (
            <>
              <span className={`font-semibold ${playerColor(currentPlayer)}`}>
                {playerName(currentPlayer)}
              </span>
              &apos;s turn — flip a card!
            </>
          )}
        </p>
      )}

      {status === 'ended' && (
        <div className="text-center">
          <p className="text-2xl font-bold">🎉 All pairs found!</p>
          <p className="text-lg text-foreground/70">
            {winner === null ? (
              "It's a draw!"
            ) : (
              <>
                <span className={`font-semibold ${playerColor(winner)}`}>
                  {playerName(winner)}
                </span>{' '}
                wins!
              </>
            )}
          </p>
        </div>
      )}

      {/* Card grid */}
      <div
        className="grid grid-cols-4 gap-2"
        role="grid"
        aria-label="Virtue memory card grid"
      >
        {cards.map((card, index) => {
          const faceUp = card.isFlipped || card.isMatched;
          const canClick =
            status === 'playing' && !isChecking && !card.isFlipped && !card.isMatched;

          let cellClass =
            'relative flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all select-none text-2xl ';

          if (card.isMatched) {
            cellClass += 'border-powder-blush bg-powder-blush/20 cursor-default';
          } else if (card.isFlipped) {
            cellClass += 'border-periwinkle bg-periwinkle/20 cursor-default';
          } else if (canClick) {
            cellClass +=
              'border-foreground/20 bg-background cursor-pointer hover:border-foreground/50 hover:bg-foreground/5 hover:scale-105';
          } else {
            cellClass += 'border-foreground/10 bg-foreground/5 cursor-default opacity-70';
          }

          return (
            <div
              key={card.id}
              className={cellClass}
              onClick={canClick ? () => handleCardClick(index) : undefined}
              role="gridcell"
              aria-label={
                faceUp
                  ? `${card.virtue} card${card.isMatched ? ' (matched)' : ''}`
                  : `Face-down card ${index + 1}`
              }
            >
              {faceUp ? (
                <span aria-hidden="true">{VIRTUE_EMOJI[card.virtue]}</span>
              ) : (
                <span className="text-foreground/30 text-lg" aria-hidden="true">
                  🐝
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Virtue name label for flipped cards */}
      <div className="flex min-h-[1.5rem] items-center justify-center">
        {cards
          .filter((c) => c.isFlipped && !c.isMatched)
          .map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-periwinkle/10 px-3 py-1 text-xs font-medium text-periwinkle"
            >
              {c.virtue}
            </span>
          ))}
      </div>

      {/* Action buttons */}
      {status === 'ended' && (
        <button
          onClick={handleReset}
          className="w-full rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
        >
          Play Again
        </button>
      )}
      {status === 'playing' && (
        <button
          onClick={handleReset}
          className="rounded-lg border border-foreground/30 px-4 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
        >
          ↺ New Game
        </button>
      )}
    </div>
  );
}
