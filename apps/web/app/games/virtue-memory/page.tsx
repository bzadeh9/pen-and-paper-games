'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Player } from '@/lib/games/virtue-memory/types';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/virtue-memory/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

const GameBoard = dynamic(
  () =>
    import('@/components/game/virtue-memory/board').then(
      (mod) => mod.GameBoard
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-center text-foreground/60">Loading game…</p>
    ),
  }
);

export default function VirtueMemoryPage() {
  const [stats, setStats] = useState(() => getGameStatistics());
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleGameEnd = useCallback((winner: Player | null) => {
    const newStats = recordGame(winner);
    setStats(newStats);
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
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['virtue-memory'].bg}`}
            >
              <GameIcon
                id="virtue-memory"
                className={`h-8 w-8 ${gameColors['virtue-memory'].text}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Ayyam-i-Ha Virtue Memory
          </h1>
          <p className="text-lg text-foreground/60">
            Match pairs of Ayyam-i-Ha virtues with Abbee &amp; Dot!
          </p>
        </div>

        {/* Backstory */}
        <div className="mb-6 rounded-lg border border-foreground/20 bg-cream/30 px-6 py-5">
          <h2 className="mb-2 text-lg font-semibold">
            The Story of Abbee &amp; Dot
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            During Ayyam-i-Ha, Abbee and Dot discovered a magical garden where
            virtues had been scattered as glowing cards across the flower beds.
            Each virtue appeared twice — once near the roses and once near the
            sunflowers — and the bees knew that to bring harmony back to the
            garden they must pair every virtue with its twin. Abbee and Dot
            take turns flipping cards, using their memories to find every
            matching pair. The bee who collects the most pairs wins the
            admiration of the whole hive. Will you help them remember where
            each virtue is hiding?
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
                  • Players take turns. On your turn, flip{' '}
                  <strong>two cards</strong> by tapping them.
                </li>
                <li>
                  • If both cards show the <strong>same virtue</strong>, you
                  keep the pair and <strong>go again</strong>!
                </li>
                <li>
                  • If the cards are <strong>different</strong>, they flip back
                  over and it&apos;s the other player&apos;s turn.
                </li>
                <li>
                  • The player with the <strong>most pairs</strong> when all
                  cards are matched wins!
                </li>
                <li>
                  • Face-down cards show a 🐝 — Abbee &amp; Dot are hiding
                  inside!
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Left pane: Stats */}
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
                  <span className="text-foreground/70">Draws</span>
                  <span className="font-semibold">{stats.draws}</span>
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

            {/* Virtue legend */}
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-3 text-sm font-semibold">Virtues</h3>
              <div className="space-y-1 text-sm text-foreground/70">
                <p>💝 Generosity</p>
                <p>🤝 Service</p>
                <p>🌟 Unity</p>
                <p>😊 Joy</p>
                <p>❤️ Love</p>
                <p>🌸 Kindness</p>
                <p>🙏 Gratitude</p>
                <p>🦁 Courage</p>
              </div>
            </div>
          </div>

          {/* Center: Game board */}
          <div className="flex items-start justify-center">
            <GameBoard onGameEnd={handleGameEnd} />
          </div>

          {/* Right pane: Players */}
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-2 text-sm font-semibold">Players</h3>
              <div className="space-y-1 text-sm text-foreground/70">
                <p>
                  🐝 <strong>Abbee</strong> — Player 1
                </p>
                <p>
                  🐝 <strong>Dot</strong> — Player 2
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
