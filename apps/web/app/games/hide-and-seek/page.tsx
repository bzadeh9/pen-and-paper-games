'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Player, GameStatus } from '@/lib/games/hide-and-seek/types';
import {
  MIN_GRID_SIZE,
  MAX_GRID_SIZE,
  DEFAULT_GRID_SIZE,
} from '@/lib/games/hide-and-seek/types';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/hide-and-seek/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

const GameBoard = dynamic(
  () =>
    import('@/components/game/hide-and-seek/board').then(
      (mod) => mod.GameBoard
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-center text-foreground/60">Loading game…</p>
    ),
  }
);

export default function HideAndSeekPage() {
  const [stats, setStats] = useState(() => getGameStatistics());
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [gameStatus, setGameStatus] = useState<GameStatus>('hiding');
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleGameEnd = useCallback(
    (winner: Player) => {
      const newStats = recordGame(winner);
      setStats(newStats);
    },
    []
  );

  const handleStatusChange = useCallback((status: GameStatus) => {
    setGameStatus(status);
  }, []);

  const handleResetStats = () => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      resetStatistics();
      setStats(getGameStatistics());
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['hide-and-seek'].bg}`}
            >
              <GameIcon
                id="hide-and-seek"
                className={`h-8 w-8 ${gameColors['hide-and-seek'].text}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Ayyam-i-Ha Hide &amp; Seek
          </h1>
          <p className="text-lg text-foreground/60">
            A Baha&apos;i Ayyam-i-Ha gem-hiding game for families!
          </p>
        </div>

        {/* Backstory */}
        <div className="mb-6 rounded-lg border border-foreground/20 bg-powder-petal/30 px-6 py-5">
          <h2 className="mb-2 text-lg font-semibold">
            The Story of Abbee &amp; Dot
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Abbee and Dot were buzzing along on their way to help a neighbour
            prepare for the Ayyam-i-Ha celebration when — oh no! — they
            accidentally dropped four sparkling gems from their basket. The
            gems scattered across the garden path, and now they need your
            help to find them all! <strong>Abbee</strong> remembers exactly
            where each gem landed, so she will mark the hiding spots.
            Then it&apos;s <strong>Dot</strong>&apos;s turn to search the
            garden square by square until every last gem is found. The bees
            are counting on you — will Dot sniff out all four gems before the
            celebration begins?
          </p>
        </div>

        {/* Rules */}
        <Collapsible
          defaultOpen={!isMobile}
          className="mb-8 rounded-lg border border-foreground/20 bg-background"
        >
          <div className="px-6 pt-6 pb-3">
            <CollapsibleTrigger>
              <h2 className="text-xl font-semibold">How to Play</h2>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="px-6 pb-6">
              <ul className="space-y-2 text-foreground/80">
                <li>
                  •{' '}
                  <strong>Phase 1 – Hiding:</strong> The hider (Abbee) selects
                  exactly 4 gems 💎 on the grid, then taps{' '}
                  <em>Hide Gems</em>.
                </li>
                <li>
                  •{' '}
                  <strong>Handover:</strong> Pass the device to the seeker
                  (Dot) — the gems are now hidden!
                </li>
                <li>
                  •{' '}
                  <strong>Phase 2 – Seeking:</strong> The seeker selects 4
                  cells and taps <em>Reveal</em>. They are told how many gems
                  they found — but not <em>which</em> ones!
                </li>
                <li>
                  •{' '}
                  <strong>Keep guessing</strong> until all 4 gems are found.
                  The seeker wins when they get all 4 correct in one go!
                </li>
                <li>
                  • After the game, you can <strong>Switch Roles</strong> so
                  Dot hides and Abbee seeks.
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Left pane: Stats + Grid Size */}
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-3 text-lg font-semibold">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Abbee wins</span>
                  <span className="font-semibold">{stats.player1Wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Dot wins</span>
                  <span className="font-semibold">{stats.player2Wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Total games</span>
                  <span className="font-semibold">{stats.totalGames}</span>
                </div>
              </div>
              {stats.totalGames > 0 && (
                <button
                  onClick={handleResetStats}
                  className="mt-3 w-full rounded-md border border-foreground/30 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
                >
                  Reset Stats
                </button>
              )}
            </div>

            {/* Grid Size Picker */}
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-3 text-sm font-semibold">Grid Size</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  { length: MAX_GRID_SIZE - MIN_GRID_SIZE + 1 },
                  (_, i) => MIN_GRID_SIZE + i
                ).map((size) => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size)}
                    disabled={gameStatus !== 'hiding'}
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                      gridSize === size
                        ? 'border-cherry-blossom bg-cherry-blossom/20 text-cherry-blossom'
                        : 'border-foreground/20 text-foreground/50 hover:border-foreground/40 hover:text-foreground/70 disabled:opacity-50'
                    }`}
                    aria-pressed={gridSize === size}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
              {gameStatus !== 'hiding' && (
                <p className="mt-2 text-xs text-foreground/40">Locked during game</p>
              )}
            </div>
          </div>

          {/* Center: Game board */}
          <div className="flex items-start justify-center">
            <GameBoard
              gridSize={gridSize}
              onGameEnd={handleGameEnd}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Right pane: Legend */}
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-3 text-lg font-semibold">Legend</h3>
              <div className="space-y-2 text-sm text-foreground/70">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-cherry-blossom bg-cherry-blossom/30" />
                  <span>Hidden gem 💎 (hiding phase)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-dusty-mauve bg-dusty-mauve/30" />
                  <span>Selected cell ✨ (seeking phase)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-foreground/20 bg-background" />
                  <span>Empty cell</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-2 text-sm font-semibold">Players</h3>
              <div className="space-y-1 text-sm text-foreground/70">
                <p>🐝 <strong>Abbee</strong> — Player 1</p>
                <p>🐝 <strong>Dot</strong> — Player 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
