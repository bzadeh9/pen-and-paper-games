'use client';

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { FlowerHopEngine } from '@/lib/games/flower-hop/engine';
import type { Player } from '@/lib/games/flower-hop/types';
import {
  BEE_HEIGHT,
  BEE_WIDTH,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FLOWER_PETAL_HEIGHT,
  FLOWER_STEM_HEIGHT,
  GEM_SIZE,
} from '@/lib/games/flower-hop/types';

interface GameBoardProps {
  onGameEnd?: (winner: Player | null) => void;
}

export function GameBoard({ onGameEnd }: GameBoardProps) {
  const engine = useMemo(() => new FlowerHopEngine(), []);
  const [gameState, setGameState] = useState(() => engine.getState());
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => setGameState(engine.getState()), [engine]);

  /* ───────── Game loop ───────── */
  useEffect(() => {
    if (gameState.status !== 'running') {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = () => {
      engine.tick();
      refresh();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [gameState.status, engine, refresh]);

  /* ───────── Notify parent on game end ───────── */
  useEffect(() => {
    if (gameState.status === 'ended') {
      onGameEnd?.(gameState.winner);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.status]);

  /* ───────── Input handling ───────── */
  const handleJump = useCallback(() => {
    if (gameState.status === 'idle') {
      engine.startRound();
      refresh();
    } else {
      engine.jump();
    }
  }, [engine, gameState.status, refresh]);

  // Keyboard handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleJump]);

  const handleReset = () => {
    engine.reset();
    refresh();
  };

  const playerName = (p: Player) => (p === 1 ? 'Abbee' : 'Dot');
  const playerColor = (p: Player) =>
    p === 1 ? 'text-powder-blush' : 'text-periwinkle';

  const {
    bee,
    flowers,
    gems,
    scores,
    scrollOffset,
    status,
    currentPlayer,
    round,
    winner,
    started,
  } = gameState;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Score header */}
      <div className="flex w-full max-w-[600px] justify-around rounded-lg border border-foreground/20 bg-background p-3">
        {([1, 2] as Player[]).map((p) => (
          <div key={p} className="flex flex-col items-center gap-1">
            <span className={`text-sm font-semibold ${playerColor(p)}`}>
              {playerName(p)}
            </span>
            <span className={`text-2xl font-bold ${playerColor(p)}`}>
              {scores[p]}
            </span>
            <span className="text-xs text-foreground/50">gems</span>
          </div>
        ))}
      </div>

      {/* Status banner */}
      {status === 'idle' && round <= 2 && (
        <div className="text-center">
          <p className="text-lg font-semibold">
            <span className={playerColor(currentPlayer)}>
              {playerName(currentPlayer)}
            </span>
            &apos;s turn
          </p>
          <p className="text-sm text-foreground/60">
            Tap, click, or press Space to start &amp; jump (double-jump too)!
          </p>
        </div>
      )}

      {status === 'running' && !started && (
        <p className="text-sm text-foreground/60">
          <span className={`font-semibold ${playerColor(currentPlayer)}`}>
            {playerName(currentPlayer)}
          </span>{' '}
          is ready — tap / Space to jump! 🐝
        </p>
      )}

      {status === 'running' && started && (
        <p className="text-sm text-foreground/60">
          <span className={`font-semibold ${playerColor(currentPlayer)}`}>
            {playerName(currentPlayer)}
          </span>{' '}
          is hopping! Tap / Space to jump 🐝
        </p>
      )}

      {status === 'ended' && (
        <div className="text-center">
          <p className="text-2xl font-bold">🎉 Game Over!</p>
          <p className="text-lg text-foreground/70">
            {winner === null ? (
              "It's a draw!"
            ) : (
              <>
                <span className={`font-semibold ${playerColor(winner)}`}>
                  {playerName(winner)}
                </span>{' '}
                wins with {scores[winner]} gems!
              </>
            )}
          </p>
        </div>
      )}

      {/* Game canvas */}
      <div
        ref={containerRef}
        className="relative cursor-pointer select-none overflow-hidden rounded-lg border-2 border-foreground/20 bg-gradient-to-b from-pink-100 via-sky-100 to-lime-100 dark:from-fuchsia-950 dark:via-indigo-950 dark:to-emerald-950"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        onClick={handleJump}
        onTouchStart={(e) => {
          e.preventDefault();
          handleJump();
        }}
        role="application"
        aria-label="Flower Hop game area"
        tabIndex={0}
      >
        {/* Sky decorations */}
        <div className="absolute left-8 top-3 text-2xl opacity-45">☁️</div>
        <div className="absolute left-[55%] top-6 text-xl opacity-35">☁️</div>
        <div className="absolute right-12 top-2 text-lg opacity-30">☁️</div>
        <div className="absolute right-8 top-8 text-sm opacity-70">✨</div>

        {/* Ground */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-300/70 to-green-200/40 dark:from-green-800/60 dark:to-green-700/30"
          style={{ height: 30 }}
        />

        {/* Flowers */}
        {flowers.map((flower, i) => {
          const fx = flower.x - scrollOffset;
          // Cull off-screen flowers
          if (fx + flower.width < -20 || fx > CANVAS_WIDTH + 20) return null;
          return (
            <div
              key={i}
              className="absolute"
              style={{ left: fx, top: flower.y }}
            >
              {/* Stem */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-b bg-gradient-to-b from-green-400 to-green-600 dark:from-green-500 dark:to-green-700"
                style={{
                  width: 6,
                  height: FLOWER_STEM_HEIGHT,
                  top: FLOWER_PETAL_HEIGHT / 2,
                }}
              />
              {/* Petals */}
              {[
                { left: '50%', top: 0 },
                { left: '25%', top: '25%' },
                { left: '75%', top: '25%' },
                { left: '35%', top: '55%' },
                { left: '65%', top: '55%' },
              ].map((petal, petalIndex) => (
                <div
                  key={petalIndex}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-300/80 bg-gradient-to-b from-pink-200 to-fuchsia-300 dark:from-pink-400/60 dark:to-fuchsia-500/60"
                  style={{
                    left: petal.left,
                    top: petal.top,
                    width: flower.width * 0.35,
                    height: FLOWER_PETAL_HEIGHT,
                  }}
                />
              ))}
              <div
                className="rounded-full border border-powder-blush bg-powder-blush/70 dark:bg-powder-blush/50"
                style={{
                  width: flower.width,
                  height: FLOWER_PETAL_HEIGHT,
                  borderRadius: '50%',
                }}
              />
              {/* Centre dot */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300 bg-apricot-cream"
                style={{ width: 8, height: 8 }}
              />
            </div>
          );
        })}

        {/* Gems */}
        {gems.map((gem, i) => {
          if (gem.collected) return null;
          const gx = gem.x - scrollOffset;
          if (gx + GEM_SIZE < -20 || gx > CANVAS_WIDTH + 20) return null;
          return (
            <div
              key={`gem-${i}`}
              className="absolute animate-pulse text-center leading-none"
              style={{
                left: gx,
                top: gem.y,
                width: GEM_SIZE,
                height: GEM_SIZE,
                fontSize: GEM_SIZE - 2,
              }}
            >
              💎
            </div>
          );
        })}

        {/* Bee */}
        <div
          className="absolute transition-none"
          style={{
            left: bee.x,
            top: bee.y,
            width: BEE_WIDTH,
            height: BEE_HEIGHT,
            fontSize: BEE_WIDTH - 4,
            lineHeight: `${BEE_HEIGHT}px`,
            textAlign: 'center',
          }}
        >
          🐝
        </div>

        {/* Idle overlay */}
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="rounded-lg bg-background/90 px-6 py-4 text-center shadow-lg">
              <p className="text-lg font-bold">
                {playerName(currentPlayer)}&apos;s Turn
              </p>
              <p className="text-sm text-foreground/60">
                Tap or press Space to start!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {status === 'ended' && (
        <button
          onClick={handleReset}
          className="w-full max-w-[600px] rounded-lg bg-foreground px-6 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
        >
          Play Again
        </button>
      )}
    </div>
  );
}
