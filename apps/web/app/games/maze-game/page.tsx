'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getGameStatistics, recordGame, resetStatistics } from '@/lib/games/maze-game/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

const GameBoard = dynamic(
  () =>
    import('@/components/game/maze-game/board').then((mod) => mod.GameBoard),
  {
    ssr: false,
    loading: () => (
      <p className="text-center text-foreground/60">Loading game…</p>
    ),
  }
);

export default function MazeGamePage() {
  const [stats, setStats] = useState(() => getGameStatistics());
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleGameEnd = useCallback((totalMoves: number) => {
    const newStats = recordGame(totalMoves);
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
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['maze-game'].bg}`}
            >
              <GameIcon
                id="maze-game"
                className={`h-8 w-8 ${gameColors['maze-game'].text}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Ayyam-i-Ha Maze
          </h1>
          <p className="text-lg text-foreground/60">
            Navigate the maze together — help each other cross the bridges!
          </p>
        </div>

        {/* Backstory */}
        <div className="mb-6 rounded-lg border border-foreground/20 bg-powder-petal/30 px-6 py-5">
          <h2 className="mb-2 text-lg font-semibold">
            The Story of Abbee &amp; Dot
          </h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Abbee and Dot are on their way to the Ayyam-i-Ha celebration, but
            the garden path has turned into a tricky maze! The little bees are
            separated somewhere in the paths, but they can hear the flowers
            calling at the other end. To reach the beautiful blossoms, they
            must work <em>together</em> — especially when they come across the
            old rope bridges. One bee must hold the lever to lower the bridge
            so the other can cross, then the other bee holds the far lever so
            the first bee can follow. Can you guide both Abbee and Dot to the
            flowers?
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
                  • Both bees (<strong>Abbee 🐝</strong> and{' '}
                  <strong>Dot 🐝</strong>) start at the <strong>Home 🏠</strong>{' '}
                  tile and must both reach the{' '}
                  <strong>flowers 🌸</strong> to win!
                </li>
                <li>
                  • Players take turns — click a <em>highlighted</em> (pink)
                  tile to move the current bee one step through the maze.
                </li>
                <li>
                  • The maze is fully visible — plan your route carefully!
                </li>
                <li>
                  • Watch out for the <strong>bridge 🌉</strong> (striped
                  passage). You can only cross it when the other bee is
                  standing on the matching <strong>lever 🔧</strong>:
                  <ul className="mt-1 ml-4 space-y-1 text-foreground/70">
                    <li>
                      — Stand on <em>Lever A</em> (🔧, side A) so the other
                      bee can cross from side A to side B.
                    </li>
                    <li>
                      — Then the other bee stands on <em>Lever B</em> (🔧,
                      side B) so you can follow.
                    </li>
                  </ul>
                </li>
                <li>
                  • Once <em>one</em> bee reaches the flowers, it waits there
                  while the other finds its way!
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
          {/* Stats panel */}
          <div className="w-full max-w-xs rounded-lg border border-foreground/20 bg-background p-4 lg:w-48">
            <h3 className="mb-3 text-lg font-semibold">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground/70">Completed</span>
                <span className="font-semibold">{stats.gamesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground/70">Total moves</span>
                <span className="font-semibold">{stats.totalMoves}</span>
              </div>
              {stats.gamesCompleted > 0 && (
                <div className="flex justify-between">
                  <span className="text-foreground/70">Avg moves</span>
                  <span className="font-semibold">
                    {Math.round(stats.totalMoves / stats.gamesCompleted)}
                  </span>
                </div>
              )}
            </div>
            {stats.gamesCompleted > 0 && (
              <button
                onClick={handleResetStats}
                className="mt-3 w-full rounded-md border border-foreground/30 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              >
                Reset Stats
              </button>
            )}
          </div>

          {/* Game board */}
          <div className="flex items-start justify-center">
            <GameBoard onGameEnd={handleGameEnd} />
          </div>
        </div>
      </div>
    </div>
  );
}
