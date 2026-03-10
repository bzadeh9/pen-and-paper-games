'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Board } from '@/components/game/fences/board';
import { TurnIndicator } from '@/components/game/fences/turn-indicator';
import { GameStats } from '@/components/game/fences/game-stats';
import { GameControls } from '@/components/game/fences/game-controls';
import { FencesEngine, DEFAULT_GRID_SIZE } from '@/lib/games/fences/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/fences/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function FencesPage() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const engine = useMemo(() => new FencesEngine(gridSize), [gridSize]);
  const [gameState, setGameState] = useState(engine.getState());
  const [stats, setStats] = useState(() => getGameStatistics());
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleGridSizeChange = useCallback(
    (newSize: number) => {
      if (gameState.status === 'setup' || gameState.status === 'ended') {
        setGridSize(newSize);
      }
    },
    [gameState.status]
  );

  const handleLineClick = useCallback(
    (row: number, col: number, orientation: 'h' | 'v') => {
      if (gameState.status === 'setup') {
        engine.startGame();
      }

      const success = engine.makeMove(row, col, orientation);
      if (success) {
        setGameState(engine.getState());
      }
    },
    [engine, gameState.status]
  );

  const handleReset = useCallback(() => {
    if (gameState.status === 'setup') {
      engine.startGame();
      setGameState(engine.getState());
    } else {
      engine.reset();
      setGameState(engine.getState());
    }
  }, [engine, gameState.status]);

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
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['fences']?.bg ?? 'bg-foreground/10'}`}
            >
              <GameIcon
                id="fences"
                className={`h-8 w-8 ${gameColors['fences']?.text ?? 'text-foreground/60'}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Fences</h1>
          <p className="text-lg text-foreground/60">
            Connect dots, complete boxes, and claim the most territory!
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
                      • Choose a grid size (3×3 to 8×8 dots)
                    </li>
                    <li>
                      • Players take turns drawing lines between adjacent dots
                    </li>
                    <li>
                      • Lines can be horizontal or vertical
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Completing Boxes
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • When you draw the 4th side of a box, you claim it and
                      earn a point
                    </li>
                    <li>
                      • <strong>Bonus:</strong> When you complete a box, you get
                      another turn!
                    </li>
                    <li>
                      • You can complete multiple boxes with a single line
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Winning the Game
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • The game ends when all boxes are claimed
                    </li>
                    <li>
                      • The player with the most boxes wins!
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Strategy Tips
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • Avoid placing the 3rd side of a box — your opponent will
                      complete it!
                    </li>
                    <li>
                      • Try to force chains where completing one box leads to
                      completing many
                    </li>
                    <li>
                      • Count carefully in the endgame to maximize your boxes
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
            gameStatus={gameState.status}
            winner={gameState.winner}
            player1Score={gameState.player1Score}
            player2Score={gameState.player2Score}
            totalBoxes={gameState.totalBoxes}
            player1Name={player1Name}
            player2Name={player2Name}
          />
        </div>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left panel: Game Controls */}
          <div>
            <GameControls
              gridSize={gridSize}
              onGridSizeChange={handleGridSizeChange}
              onReset={handleReset}
              gameStatus={gameState.status}
              player1Name={player1Name}
              player2Name={player2Name}
              onPlayer1NameChange={setPlayer1Name}
              onPlayer2NameChange={setPlayer2Name}
            />
          </div>

          {/* Center: Game Board */}
          <div className="flex items-center justify-center">
            <div className="w-full">
              <div className="rounded-xl border-4 border-foreground/30 bg-background">
                <Board
                  gameState={gameState}
                  onLineClick={handleLineClick}
                  player1Name={player1Name}
                  player2Name={player2Name}
                />
              </div>
            </div>
          </div>

          {/* Right panel: Stats */}
          <div>
            <GameStats
              stats={stats}
              onReset={handleResetStats}
              player1Name={player1Name}
              player2Name={player2Name}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
