'use client';

import React, { useState, useCallback } from 'react';
import { GameBoard } from '@/components/game/splatter/board';
import { PlayerCustomization } from '@/components/game/splatter/player-customization';
import { GameStats } from '@/components/game/splatter/game-stats';
import { GridSizeSelector } from '@/components/game/splatter/grid-size-selector';
import { SetupModeSelector } from '@/components/game/splatter/setup-mode-selector';
import { PlayerColor } from '@/lib/games/splatter/types';
import { Player, SetupMode } from '@/lib/games/splatter/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/splatter/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function SplatterPage() {
  const [player1Color, setPlayer1Color] = useState<PlayerColor>('cherryBlossom');
  const [player2Color, setPlayer2Color] = useState<PlayerColor>('dustyMauve');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [gridSize, setGridSize] = useState(5);
  const [setupMode, setSetupMode] = useState<SetupMode>('auto');
  const [gameStatus, setGameStatus] = useState<'setup' | 'playing' | 'ended'>('setup');
  const [stats, setStats] = useState(() => getGameStatistics());

  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleGameEnd = useCallback((winner: Player | 'draw') => {
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
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Splatter</h1>
          <p className="text-lg text-foreground/60">
            Strategic elimination - be the last one standing!
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
                  • Choose between <strong>Auto</strong> (random board setup) or{' '}
                  <strong>Manual</strong> (take turns placing dots) mode
                </li>
                <li>
                  • Once setup is complete, click "Start Game" to begin
                </li>
                <li>
                  • On your turn, click one of your colored dots to perform a{' '}
                  <strong>Single Splatter</strong> (removes only that dot)
                </li>
                <li>
                  • Or right-click / Ctrl+Click for an{' '}
                  <strong>Area Splatter</strong> (removes the dot and all 8
                  surrounding cells)
                </li>
                <li>
                  • Area Splatter removes all dots in the area, regardless of
                  color
                </li>
                <li>
                  • The player who still has dots remaining when their opponent
                  has none <strong>WINS</strong>
                </li>
                <li>
                  • If both players lose their last dot simultaneously, the
                  player who made the move loses
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left pane: Settings */}
          <div className="flex flex-col gap-4">
            {/* Setup Mode Selector */}
            <Collapsible
              defaultOpen={!isMobile}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">Setup</h3>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <SetupModeSelector
                    setupMode={setupMode}
                    onSetupModeChange={setSetupMode}
                    disabled={gameStatus !== 'setup'}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Grid Size Selector */}
            <Collapsible
              defaultOpen={!isMobile}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">Grid Size</h3>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <GridSizeSelector
                    gridSize={gridSize}
                    onGridSizeChange={setGridSize}
                    disabled={gameStatus !== 'setup'}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Player 1 customization */}
            <Collapsible
              defaultOpen={!isMobile}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">{player1Name} Options</h3>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <PlayerCustomization
                    playerNumber={1}
                    selectedColor={player1Color}
                    onColorChange={setPlayer1Color}
                    otherPlayerColor={player2Color}
                    playerName={player1Name}
                    onNameChange={setPlayer1Name}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Player 2 customization */}
            <Collapsible
              defaultOpen={!isMobile}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">{player2Name} Options</h3>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <PlayerCustomization
                    playerNumber={2}
                    selectedColor={player2Color}
                    onColorChange={setPlayer2Color}
                    otherPlayerColor={player1Color}
                    playerName={player2Name}
                    onNameChange={setPlayer2Name}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Center: Game board */}
          <div className="flex items-center justify-center">
            <GameBoard
              player1Color={player1Color}
              player2Color={player2Color}
              player1Name={player1Name}
              player2Name={player2Name}
              gridSize={gridSize}
              setupMode={setupMode}
              onGameEnd={handleGameEnd}
              onGameStateChange={setGameStatus}
            />
          </div>

          {/* Right pane: Stats */}
          <div className="flex flex-col gap-4">
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
