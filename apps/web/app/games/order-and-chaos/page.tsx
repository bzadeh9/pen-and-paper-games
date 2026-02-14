'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Board } from '@/components/game/order-and-chaos/board';
import { TurnIndicator } from '@/components/game/order-and-chaos/turn-indicator';
import { GameStats } from '@/components/game/order-and-chaos/game-stats';
import { GameControls } from '@/components/game/order-and-chaos/game-controls';
import { OrderAndChaosEngine } from '@/lib/games/order-and-chaos/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/order-and-chaos/stats';
import type { PieceColor } from '@/lib/games/order-and-chaos/types';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function OrderAndChaosPage() {
  const engine = useMemo(() => new OrderAndChaosEngine(), []);
  const [gameState, setGameState] = useState(engine.getState());
  const [stats, setStats] = useState(() => getGameStatistics());
  const [selectedColor, setSelectedColor] = useState<PieceColor | null>(null);

  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleCellClick = useCallback(
    (row: number, col: number, color: PieceColor) => {
      const success = engine.makeMove(row, col, color);
      if (success) {
        setGameState(engine.getState());
      }
    },
    [engine]
  );

  const handleReset = useCallback(() => {
    engine.reset();
    setGameState(engine.getState());
    setSelectedColor(null);
  }, [engine]);

  const handleResetStats = useCallback(() => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      resetStatistics();
      setStats(getGameStatistics());
    }
  }, []);

  const handleColorSelect = useCallback((color: PieceColor) => {
    setSelectedColor(color);
  }, []);

  // Record game when it ends
  useEffect(() => {
    if (gameState.status === 'ended' && gameState.winner) {
      Promise.resolve().then(() => {
        const newStats = recordGame(gameState.winner!);
        setStats(newStats);
      });
    }
  }, [gameState.status, gameState.winner]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Order and Chaos
          </h1>
          <p className="text-lg text-foreground/60">
            Asymmetric strategy on a 6×6 grid
          </p>
        </div>

        {/* Game rules */}
        <Collapsible className="mb-8">
          <CollapsibleTrigger className="w-full rounded-lg border border-foreground/20 bg-background px-6 py-4 text-left transition-colors hover:bg-foreground/5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">How to Play</h2>
              <svg
                className="h-5 w-5 transition-transform ui-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg border border-foreground/20 bg-background p-6">
            <div className="prose prose-sm max-w-none text-foreground/80">
              <h3 className="text-lg font-semibold mb-2">The Core Concept</h3>
              <p className="mb-4">
                Order and Chaos is a masterpiece of asymmetric design. The game is played with shared pieces
                (cherry blossom and dusty mauve markers). Unlike Tic-Tac-Toe, where you &quot;own&quot; a symbol,
                in Order and Chaos, both players can use both colors.
              </p>

              <h3 className="text-lg font-semibold mb-2">The Roles</h3>
              <ul className="mb-4 space-y-2">
                <li>
                  <strong className="text-cherry-blossom">Order:</strong> The builder. Order&apos;s goal is to create
                  a sequence of five-in-a-row of the same color (horizontal, vertical, or diagonal).
                </li>
                <li>
                  <strong className="text-dusty-mauve">Chaos:</strong> The spoiler. Chaos&apos;s goal is to prevent
                  Order from completing a line until the entire board is filled.
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">How to Play</h3>
              <ul className="mb-4 space-y-2">
                <li>
                  <strong>The Turn:</strong> On your turn, select a color (cherry blossom or dusty mauve) and place
                  it in any empty cell on the 6×6 grid.
                </li>
                <li>
                  <strong>The Flexibility:</strong> You are never locked into one color. You might play cherry blossom
                  on turn one and dusty mauve on turn two if it helps your objective.
                </li>
                <li>
                  <strong>Winning:</strong>
                  <ul className="mt-2 ml-4 space-y-1">
                    <li>• As soon as a line of five same-colored pieces appears, Order wins immediately.</li>
                    <li>• If the 36th piece is placed and no five-in-a-row exists, Chaos wins.</li>
                  </ul>
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Strategic Depth</h3>
              <p className="mb-4">
                Because the board is only 6×6, the margin for error is razor-thin. It is mathematically proven that
                the game favors Order if played perfectly, but for human players, the psychological battle is intense.
              </p>

              <h3 className="text-lg font-semibold mb-2">Strategies for Order</h3>
              <ul className="mb-4 space-y-2">
                <li>
                  <strong>The Fork:</strong> Attempt to build two potential lines of four simultaneously. If Chaos
                  blocks one, you complete the other.
                </li>
                <li>
                  <strong>The Open-Ended Four:</strong> A line of three pieces with empty spaces on both ends. This
                  is a powerful setup because Chaos can only block one side at a time.
                </li>
                <li>
                  <strong>The Decoy:</strong> Start building a cherry blossom line to force Chaos to react, then
                  suddenly pivot to a dusty mauve line on the other side of the board.
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Strategies for Chaos</h3>
              <ul className="mb-4 space-y-2">
                <li>
                  <strong>The Splitter:</strong> Never let Order get three pieces in a row. As soon as a pair is
                  formed, place the opposite color at one end to &quot;pollute&quot; the line.
                </li>
                <li>
                  <strong>Edge Management:</strong> Push Order&apos;s builds toward the edges of the board where there
                  is less room to complete a full line of five.
                </li>
                <li>
                  <strong>Neutrality:</strong> Avoid placing pieces that contribute to a long chain unless you are
                  forced to block. Your goal is to keep the board &quot;messy.&quot;
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Why It&apos;s Unique</h3>
              <p>
                Order and Chaos is often used in game theory and AI research because it removes the &quot;ownership&quot;
                of pieces. It forces you to think about the entire board state rather than just your own moves.
                It&apos;s a game where every move you make could potentially be used against you by your opponent.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Game area */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left panel - Stats and Turn Indicator (or Turn Indicator on mobile) */}
          <div className={`space-y-6 ${isMobile ? 'order-1' : ''}`}>
            <TurnIndicator
              currentPlayer={gameState.currentPlayer}
              selectedColor={selectedColor}
              onColorSelect={handleColorSelect}
              isGameEnded={gameState.status === 'ended'}
            />
            {!isMobile && (
              <GameStats
                orderWins={stats.orderWins}
                chaosWins={stats.chaosWins}
                gamesPlayed={stats.gamesPlayed}
                onReset={handleResetStats}
              />
            )}
          </div>

          {/* Center - Board */}
          <div className={`flex items-start justify-center ${isMobile ? 'order-2' : ''}`}>
            <Board
              board={gameState.board}
              onCellClick={handleCellClick}
              isGameEnded={gameState.status === 'ended'}
              selectedColor={selectedColor}
            />
          </div>

          {/* Right panel - Controls (or Stats and Controls on mobile) */}
          <div className={`space-y-6 ${isMobile ? 'order-3' : ''}`}>
            <GameControls
              onReset={handleReset}
              winner={gameState.winner}
              isGameEnded={gameState.status === 'ended'}
            />
            {isMobile && (
              <GameStats
                orderWins={stats.orderWins}
                chaosWins={stats.chaosWins}
                gamesPlayed={stats.gamesPlayed}
                onReset={handleResetStats}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
