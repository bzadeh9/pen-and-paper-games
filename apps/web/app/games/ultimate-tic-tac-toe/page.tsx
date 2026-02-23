'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GlobalBoard } from '@/components/game/ultimate-tic-tac-toe/global-board';
import { TurnIndicator } from '@/components/game/ultimate-tic-tac-toe/turn-indicator';
import { GameControls } from '@/components/game/ultimate-tic-tac-toe/game-controls';
import { GameStats } from '@/components/game/ultimate-tic-tac-toe/game-stats';
import { UltimateTicTacToeEngine } from '@/lib/games/ultimate-tic-tac-toe/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/ultimate-tic-tac-toe/stats';
import type { GameMode } from '@/lib/games/ultimate-tic-tac-toe/types';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function UltimateTicTacToePage() {
  const [mode, setMode] = useState<GameMode>('standard');
  const engine = useMemo(() => new UltimateTicTacToeEngine(mode), [mode]);
  const [gameState, setGameState] = useState(engine.getState());
  const [stats, setStats] = useState(() => getGameStatistics());

  const isMobile = useMediaQuery('(max-width: 767px)');

  // Update mode when changed
  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      if (gameState.status === 'setup' || gameState.status === 'ended') {
        setMode(newMode);
        engine.setMode(newMode);
        setGameState(engine.getState());
      }
    },
    [engine, gameState.status]
  );

  const handleCellClick = useCallback(
    (localRow: number, localCol: number, cellRow: number, cellCol: number) => {
      if (gameState.status === 'setup') {
        engine.startGame();
      }

      const success = engine.makeMove({
        localRow,
        localCol,
        cellRow,
        cellCol,
      });

      if (success) {
        setGameState(engine.getState());
      }
    },
    [engine, gameState.status]
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
    if (gameState.status === 'ended' && gameState.winner) {
      // Use a microtask to avoid synchronous setState in effect
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
          <div className="mb-4 flex justify-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['ultimate-tic-tac-toe'].bg}`}>
              <GameIcon id="ultimate-tic-tac-toe" className={`h-8 w-8 ${gameColors['ultimate-tic-tac-toe'].text}`} />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Ultimate Tic-Tac-Toe
          </h1>
          <p className="text-lg text-foreground/60">
            A strategic twist on the classic game!
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
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    The Basics
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • The game board is a 3x3 grid of smaller 3x3 tic-tac-toe
                      boards
                    </li>
                    <li>• Win 3 small boards in a row to win the game</li>
                    <li>
                      • Each small board follows standard tic-tac-toe rules
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Standard Mode (Casual)
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• Play in any available cell on any board</li>
                    <li>• Perfect for learning the game</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Strict Mode (Classic)
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • Your move determines which board your opponent must play
                      in
                    </li>
                    <li>
                      • If you play in position (x, y) of a small board, your
                      opponent must play in the small board at position (x, y)
                      on the large board
                    </li>
                    <li>
                      • If that board is already won or full, your opponent may
                      play anywhere
                    </li>
                    <li>• The active board is highlighted</li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left panel: Turn Indicator (on mobile: second position after board) */}
          <div className={isMobile ? 'order-2 md:order-1' : ''}>
            <TurnIndicator
              currentPlayer={gameState.currentPlayer}
              gameStatus={gameState.status}
              winner={gameState.winner}
            />
          </div>

          {/* Center: Game Board (on mobile: first position) */}
          <div
            className={`flex items-center justify-center ${isMobile ? 'order-1 md:order-2' : ''}`}
          >
            <div className="w-full max-w-2xl">
              <GlobalBoard
                gameState={gameState}
                onCellClick={handleCellClick}
              />
            </div>
          </div>

          {/* Right panel: Game Controls and Stats */}
          <div className={`space-y-6 ${isMobile ? 'order-3' : ''}`}>
            <GameControls
              mode={mode}
              onModeChange={handleModeChange}
              onReset={handleReset}
              gameStatus={gameState.status}
            />
            <GameStats stats={stats} onReset={handleResetStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
