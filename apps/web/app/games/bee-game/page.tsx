'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { GameStats } from '@/components/game/bee-game/game-stats';
import type { Player } from '@/lib/games/bee-game/types';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/bee-game/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

const GameBoard = dynamic(
  () =>
    import('@/components/game/bee-game/board').then((mod) => mod.GameBoard),
  { ssr: false, loading: () => <p className="text-center text-foreground/60">Loading game…</p> }
);

export default function BeeGamePage() {
  const [stats, setStats] = useState(() => getGameStatistics());

  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleGameEnd = useCallback((winningPlayer: Player) => {
    const newStats = recordGame(winningPlayer);
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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['bee-game'].bg}`}>
              <GameIcon id="bee-game" className={`h-8 w-8 ${gameColors['bee-game'].text}`} />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Ayyam-i-Ha Virtue Chase
          </h1>
          <p className="text-lg text-foreground/60">
            A Baha&apos;i Ayyam-i-ha bee chase game for families!
          </p>
        </div>

        {/* Backstory */}
        <div className="mb-6 rounded-lg border border-foreground/20 bg-powder-petal/30 px-6 py-5">
          <h2 className="mb-2 text-lg font-semibold">The Story of Abbee &amp; Dot</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Every year during Ayyam-i-ha, two tiny bees named Abbee and Dot
            wake up from their winter nap. Their hive has given them a special
            mission: fly across the garden, visit flowers that hold different
            virtues, and bring those virtues back Home before the celebration
            begins. But there&apos;s a twist — only one bee can be the
            collector at a time! If the chasing bee catches the collector,
            they swap jobs and the new collector must keep gathering. The
            first bee to collect at least one virtue and buzz all the way Home
            wins the admiration of the whole hive. Ready to help Abbee and Dot
            complete their mission?
          </p>
        </div>

        {/* Game rules */}
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
                  • <strong>Runner (🐝)</strong> moves up to 2 spaces per turn,
                  collecting virtue zones and heading toward Home.
                </li>
                <li>
                  • <strong>Chaser (🐝)</strong> moves up to 3 spaces per turn,
                  trying to tag the runner. The chaser cannot enter virtue zones.
                </li>
                <li>
                  • The chaser <strong>cannot tag</strong> the runner inside a
                  virtue zone (safe!).
                </li>
                <li>
                  • When the chaser catches the runner, they{' '}
                  <strong>swap roles</strong>. The new runner starts on a random
                  virtue zone.
                </li>
                <li>
                  • If all virtues are collected, new ones appear in fresh spots!
                </li>
                <li>
                  • The runner wins by collecting at least one virtue and
                  reaching the <strong>Home</strong> square.
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_3fr_1fr]">
          {/* Left pane: Info */}
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="mb-2 text-lg font-semibold">About the Game</h3>
              <p className="text-sm text-foreground/70">
                Abbee &amp; Dot are two plushie bees who visit during the
                Ayyam-i-ha celebration. Help them fly across the garden,
                gather virtues and buzz Home!
              </p>
            </div>
          </div>

          {/* Center: Game board */}
          <div className="flex items-center justify-center">
            <GameBoard onGameEnd={handleGameEnd} />
          </div>

          {/* Right pane: Stats */}
          <div className="flex flex-col gap-4">
            <GameStats stats={stats} onReset={handleResetStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
