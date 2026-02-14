'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Board } from '@/components/game/black-hole/board';
import { TurnIndicator } from '@/components/game/black-hole/turn-indicator';
import { GameStats } from '@/components/game/black-hole/game-stats';
import { BlackHoleEngine } from '@/lib/games/black-hole/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/black-hole/stats';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function BlackHolePage() {
  const engine = useMemo(() => new BlackHoleEngine(), []);
  const [gameState, setGameState] = useState(engine.getState());
  const [stats, setStats] = useState(() => getGameStatistics());

  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleCircleClick = useCallback(
    (circleId: number) => {
      const success = engine.makeMove(circleId);
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
            Black Hole
          </h1>
          <p className="text-lg text-foreground/60">
            A game of reverse-area control
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
                    Game Setup
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • The board consists of 21 circles arranged in a pyramid (rows 1-6)
                    </li>
                    <li>
                      • Player 1 (Blue) and Player 2 (Red) take turns placing numbers
                    </li>
                    <li>
                      • Each player places numbers 1 through 10 in sequence
                    </li>
                    <li>
                      • After 20 numbers are placed, the remaining empty circle becomes the &quot;Black Hole&quot;
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Winning the Game
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • At the end, all numbers adjacent to the Black Hole are scored
                    </li>
                    <li>
                      • Each player&apos;s score is the sum of their numbers touching the Black Hole
                    </li>
                    <li>
                      • The player with the <strong>lowest</strong> score wins!
                    </li>
                    <li>
                      • This is reverse-area control: you want to isolate your high numbers
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Strategy Tips
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • Try to place your low numbers near potential Black Hole locations
                    </li>
                    <li>
                      • Force your opponent to place high numbers in dangerous positions
                    </li>
                    <li>
                      • Remember: the last empty circle becomes the Black Hole!
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Turn indicator */}
        <div className="mb-6">
          <TurnIndicator
            currentPlayer={gameState.currentPlayer}
            currentTurnNumber={gameState.currentTurnNumber}
            player1Counter={gameState.player1Counter}
            player2Counter={gameState.player2Counter}
            gameStatus={gameState.status}
            winner={gameState.winner}
            player1Score={gameState.player1Score}
            player2Score={gameState.player2Score}
          />
        </div>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left panel: New Game button */}
          <div>
            <div className="rounded-lg border-2 border-foreground/20 bg-background p-4">
              <h2 className="mb-4 text-xl font-bold">Controls</h2>
              <Button onClick={handleReset} className="w-full">
                New Game
              </Button>
            </div>
          </div>

          {/* Center: Game Board */}
          <div className="flex items-center justify-center">
            <div className="w-full">
              <div className="rounded-xl border-4 border-foreground/30 bg-background">
                <Board gameState={gameState} onCircleClick={handleCircleClick} />
              </div>
            </div>
          </div>

          {/* Right panel: Stats */}
          <div>
            <GameStats stats={stats} onReset={handleResetStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
