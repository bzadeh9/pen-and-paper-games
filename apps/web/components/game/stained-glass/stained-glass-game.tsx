'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Board } from '@/components/game/stained-glass/board';
import { TurnIndicator } from '@/components/game/stained-glass/turn-indicator';
import { GameStats } from '@/components/game/stained-glass/game-stats';
import { GameControls } from '@/components/game/stained-glass/game-controls';
import { StainedGlassEngine } from '@/lib/games/stained-glass/engine';
import {
  generateWindowLayout,
  SECTION_COUNTS,
} from '@/lib/games/stained-glass/layout';
import type { WindowLayout } from '@/lib/games/stained-glass/layout';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/stained-glass/stats';
import type { GameMode } from '@/lib/games/stained-glass/types';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function StainedGlassGame() {
  const [mode, setMode] = useState<GameMode>('standard');
  const [gridSize, setGridSize] = useState(4);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  const engineRef = useRef(new StainedGlassEngine(4, 'standard'));
  const [layout, setLayout] = useState<WindowLayout>(() => {
    const l = generateWindowLayout(SECTION_COUNTS[4]);
    engineRef.current.loadSections(
      l.sections.map((s) => ({ id: s.id, neighbors: s.neighbors }))
    );
    return l;
  });
  const [gameState, setGameState] = useState(() => engineRef.current.getState());
  const [stats, setStats] = useState(() => getGameStatistics());

  const isMobile = useMediaQuery('(max-width: 767px)');

  /**
   * Regenerate a random window layout and sync the engine's sections.
   */
  const regenerateLayout = useCallback((size: number, currentMode?: GameMode) => {
    const newLayout = generateWindowLayout(SECTION_COUNTS[size] ?? 18);
    engineRef.current.loadSections(
      newLayout.sections.map((s) => ({ id: s.id, neighbors: s.neighbors }))
    );
    if (currentMode) {
      engineRef.current.setMode(currentMode);
    }
    setLayout(newLayout);
    setGameState(engineRef.current.getState());
  }, []);

  const handleModeChange = useCallback(
    (newMode: GameMode) => {
      if (gameState.status === 'setup' || gameState.status === 'ended') {
        setMode(newMode);
        engineRef.current.setMode(newMode);
        regenerateLayout(gridSize, newMode);
      }
    },
    [gameState.status, gridSize, regenerateLayout]
  );

  const handleGridSizeChange = useCallback(
    (newSize: number) => {
      if (gameState.status === 'setup' || gameState.status === 'ended') {
        setGridSize(newSize);
        regenerateLayout(newSize, mode);
      }
    },
    [gameState.status, mode, regenerateLayout]
  );

  const handleSectionClick = useCallback(
    (sectionId: number) => {
      if (gameState.status === 'setup') {
        engineRef.current.startGame();
      }

      const success = engineRef.current.makeMove(sectionId);
      if (success) {
        setGameState(engineRef.current.getState());
      }
    },
    [gameState.status]
  );

  const handleReset = useCallback(() => {
    if (gameState.status === 'setup') {
      engineRef.current.startGame();
      setGameState(engineRef.current.getState());
    } else {
      regenerateLayout(gridSize, mode);
    }
  }, [gameState.status, gridSize, mode, regenerateLayout]);

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
        const newStats = recordGame(gameState.winner as 1 | 2);
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
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['stained-glass'].bg}`}>
              <GameIcon id="stained-glass" className={`h-8 w-8 ${gameColors['stained-glass'].text}`} />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            {mode === 'standard' ? 'Stained Glass' : 'Reverse Stained Glass'}
          </h1>
          <p className="text-lg text-foreground/60">
            {mode === 'standard'
              ? 'Color panes to block your opponent — be the last to place!'
              : 'Color panes away from your own — be the last to place!'}
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
                    {mode === 'standard' ? 'Stained Glass' : 'Reverse Stained Glass'}
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>• The board is a window divided into pane sections</li>
                    <li>• Players take turns coloring one uncolored section</li>
                    {mode === 'standard' ? (
                      <>
                        <li>
                          • Your section <strong>may not</strong> share a side with any
                          section colored by your opponent
                        </li>
                        <li>
                          • Your section <strong>may</strong> touch sections of your own
                          color (corner-touching is always allowed)
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          • Your section <strong>may not</strong> share a side with any
                          section of your own color
                        </li>
                        <li>
                          • Your section <strong>may</strong> touch sections of your
                          opponent&apos;s color (corner-touching is always allowed)
                        </li>
                      </>
                    )}
                    <li>
                      • The player who <strong>cannot</strong> legally color any section
                      concedes — the opponent wins!
                    </li>
                    <li>
                      • Each new game generates a <strong>unique random</strong> window
                      layout!
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Strategy Tips
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    {mode === 'standard' ? (
                      <>
                        <li>• Place your color to block opponent options while preserving your own</li>
                        <li>• Claim corners and edges to limit your opponent&apos;s expansion</li>
                      </>
                    ) : (
                      <>
                        <li>• Spread out your color to maintain future placement options</li>
                        <li>• Force your opponent into clusters where they run out of moves</li>
                      </>
                    )}
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
            player1Name={player1Name}
            player2Name={player2Name}
          />
        </div>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left panel: Game Controls */}
          <div>
            <GameControls
              mode={mode}
              onModeChange={handleModeChange}
              gridSize={gridSize}
              onGridSizeChange={handleGridSizeChange}
              onReset={handleReset}
              gameStatus={gameState.status}
              player1Name={player1Name}
              onPlayer1NameChange={setPlayer1Name}
              player2Name={player2Name}
              onPlayer2NameChange={setPlayer2Name}
            />
          </div>

          {/* Center: Game Board */}
          <div className="flex items-start justify-center">
            <div className="w-full max-w-md">
              <Board
                gameState={gameState}
                layout={layout}
                onSectionClick={handleSectionClick}
              />
            </div>
          </div>

          {/* Right panel: Stats */}
          <div>
            <GameStats
              stats={stats}
              player1Name={player1Name}
              player2Name={player2Name}
              onReset={handleResetStats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
