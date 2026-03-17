'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Board } from '@/components/game/row-call/board';
import { TurnIndicator } from '@/components/game/row-call/turn-indicator';
import { GameStats } from '@/components/game/row-call/game-stats';
import { GameControls } from '@/components/game/row-call/game-controls';
import { RowCallEngine } from '@/lib/games/row-call/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/row-call/stats';
import type { LineSelection } from '@/lib/games/row-call/types';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function RowCallPage() {
  const engine = useMemo(() => new RowCallEngine(), []);
  const [gameState, setGameState] = useState(engine.getState());
  const [stats, setStats] = useState(() => getGameStatistics());

  const isMobile = useMediaQuery('(max-width: 767px)');

  const actingPlayer = engine.getActingPlayer();
  const validPlacements = engine.getValidPlacements();
  const selectableLines = engine.getSelectableLines();

  const handleLineSelect = useCallback(
    (selection: LineSelection) => {
      const success = engine.selectLine(selection);
      if (success) {
        setGameState(engine.getState());
      }
    },
    [engine]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      const success = engine.placePiece(row, col);
      if (success) {
        setGameState(engine.getState());
      }
    },
    [engine]
  );

  const handleReset = useCallback(() => {
    engine.reset();
    setGameState(engine.getState());
  }, [engine]);

  const handleResetStats = useCallback(() => {
    if (confirm('Are you sure you want to reset all statistics?')) {
      resetStatistics();
      setStats(getGameStatistics());
    }
  }, []);

  // Record game when it ends
  useEffect(() => {
    if (gameState.status === 'ended') {
      Promise.resolve().then(() => {
        const newStats = recordGame(gameState.winner);
        setStats(newStats);
      });
    }
  }, [gameState.status, gameState.winner]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['row-call'].bg}`}
            >
              <GameIcon
                id="row-call"
                className={`h-8 w-8 ${gameColors['row-call'].text}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Row Call</h1>
          <p className="text-lg text-foreground/60">
            Choose the line, but your opponent picks the spot!
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
                Row Call is a strategic twist on connect-three games. You choose
                which row or column your dot goes into — but your opponent
                decides exactly where in that line it lands. Plan ahead, because
                your opponent will try to place your dot where it helps them
                most!
              </p>

              <h3 className="text-lg font-semibold mb-2">Setup</h3>
              <p className="mb-4">
                The game is played on a 4×4 grid. Columns are labelled A, B, C,
                D and rows are labelled 1, 2, 3, 4.
              </p>

              <h3 className="text-lg font-semibold mb-2">How Turns Work</h3>
              <ul className="mb-4 space-y-2">
                <li>
                  <strong className="text-powder-blush">Step 1:</strong> The
                  active player (whose dot will be placed) chooses a row or
                  column.
                </li>
                <li>
                  <strong className="text-periwinkle">Step 2:</strong> Their
                  opponent then picks exactly which empty cell in that row or
                  column to place the dot.
                </li>
                <li>
                  <strong>Then switch:</strong> Roles reverse — the other
                  player now chooses a row or column for their dot, and the
                  first player picks where to put it.
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Winning</h3>
              <p className="mb-4">
                The first player to get <strong>3 dots in a row</strong>{' '}
                (horizontally or vertically) wins! Diagonal lines do not count.
                If the board fills up with no winner, the game is a draw.
              </p>

              <h3 className="text-lg font-semibold mb-2">
                Accessibility Notes
              </h3>
              <ul className="mb-4 space-y-2">
                <li>
                  All cells are labelled with their grid coordinate (e.g.
                  &quot;A1&quot;, &quot;C3&quot;) for screen readers.
                </li>
                <li>
                  Row and column buttons are clearly labelled and keyboard
                  accessible.
                </li>
                <li>
                  Player dots use distinct colours (pink and purple) with
                  sufficient contrast.
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">Strategy Tips</h3>
              <ul className="mb-4 space-y-2">
                <li>
                  <strong>The Fork:</strong> Try to choose a line where multiple
                  empty cells would advance your position — your opponent can
                  only block one.
                </li>
                <li>
                  <strong>Edge Control:</strong> When placing your
                  opponent&apos;s dot, push them to the edges where they have
                  fewer paths to three in a row.
                </li>
                <li>
                  <strong>Line Restriction:</strong> Choose a row or column
                  where every empty cell benefits you, leaving your opponent no
                  good options.
                </li>
                <li>
                  <strong>Defensive Placement:</strong> When placing your
                  opponent&apos;s dot, always check if any cell would give them
                  two in a row before placing there.
                </li>
              </ul>

              <h3 className="text-lg font-semibold mb-2">
                What Makes It Unique
              </h3>
              <p>
                Unlike tic-tac-toe or connect four, you never have full control
                over where your dot goes. This creates a tug-of-war dynamic:
                you narrow the options by choosing the line, but your opponent
                makes the final call. Every move is a negotiation between attack
                and defence.
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Game area */}
        <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
          {/* Left panel - Turn Indicator + Stats (desktop) */}
          <div className={`space-y-6 ${isMobile ? 'order-1' : ''}`}>
            <TurnIndicator
              activePlayer={gameState.activePlayer}
              actingPlayer={actingPlayer}
              turnPhase={gameState.turnPhase}
              selectedLine={gameState.selectedLine}
              isGameEnded={gameState.status === 'ended'}
              selectableLines={selectableLines}
              onLineSelect={handleLineSelect}
            />
            {!isMobile && (
              <GameStats
                player1Wins={stats.player1Wins}
                player2Wins={stats.player2Wins}
                draws={stats.draws}
                gamesPlayed={stats.gamesPlayed}
                onReset={handleResetStats}
              />
            )}
          </div>

          {/* Center - Board */}
          <div
            className={`flex items-start justify-center ${isMobile ? 'order-2' : ''}`}
          >
            <Board
              board={gameState.board}
              onCellClick={handleCellClick}
              isGameEnded={gameState.status === 'ended'}
              selectedLine={gameState.selectedLine}
              validPlacements={validPlacements}
            />
          </div>

          {/* Right panel - Controls + Stats (mobile) */}
          <div className={`space-y-6 ${isMobile ? 'order-3' : ''}`}>
            <GameControls
              onReset={handleReset}
              winner={gameState.winner}
              isGameEnded={gameState.status === 'ended'}
              gameStatus={gameState.status}
            />
            {isMobile && (
              <GameStats
                player1Wins={stats.player1Wins}
                player2Wins={stats.player2Wins}
                draws={stats.draws}
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
