'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Player } from '@/lib/games/flower-hop/types';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/flower-hop/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

const GameBoard = dynamic(
  () =>
    import('@/components/game/flower-hop/board').then((mod) => mod.GameBoard),
  {
    ssr: false,
    loading: () => (
      <p className="text-center text-foreground/60">Loading game…</p>
    ),
  }
);

export default function FlowerHopPage() {
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
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['flower-hop'].bg}`}
            >
              <GameIcon
                id="flower-hop"
                className={`h-8 w-8 ${gameColors['flower-hop'].text}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Ayyam-i-Ha Flower Hop
          </h1>
          <p className="text-lg text-foreground/60">
            Jump across flowers and collect gems with Abbee &amp; Dot!
          </p>
        </div>

        {/* Backstory */}
        <div className="mb-6 rounded-lg border border-foreground/20 bg-cream/30 px-6 py-5">
          <h2 className="mb-2 text-lg font-semibold">
            The Story of Abbee &amp; Dot
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            On the first morning of Ayyam-i-Ha, Abbee and Dot spotted a trail
            of sparkling gems scattered across the garden flowers. The gems
            had been left by the dawn breeze as gifts for all the creatures
            who celebrate this joyous season. The two bees set off, hopping
            from flower to flower, to see who could gather the most gems
            before the petals closed for the evening. Can you help them hop
            across the garden and collect every gem?
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
                  • Each player takes a turn hopping across the garden
                  flowers.
                </li>
                <li>
                  • <strong>Tap</strong>, <strong>click</strong>, or press{' '}
                  <strong>Space</strong> to make the bee jump.
                </li>
                <li>
                  • Land on flowers to stay in the air — miss one and
                  you&apos;ll fall!
                </li>
                <li>
                  • Collect 💎 <strong>gems</strong> sitting on the flowers
                  as you hop.
                </li>
                <li>
                  • After both Abbee and Dot have had a turn, the bee with
                  the <strong>most gems</strong> wins!
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
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-2 text-sm font-semibold">Controls</h3>
              <div className="space-y-1 text-sm text-foreground/70">
                <p>🖱️ Click / Tap to jump</p>
                <p>⌨️ Space or ↑ to jump</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
