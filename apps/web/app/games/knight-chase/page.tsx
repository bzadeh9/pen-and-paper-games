'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useCallback } from 'react';
import { GameBoard } from '@/components/game/knight-chase/board';
import { PlayerCustomization } from '@/components/game/knight-chase/player-customization';
import { GameStats } from '@/components/game/knight-chase/game-stats';
import { PlayerColor, Player } from '@/lib/games/knight-chase/types';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/knight-chase/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function KnightChasePage() {
  const [player1Color, setPlayer1Color] =
    useState<PlayerColor>('powderBlush');
  const [player2Color, setPlayer2Color] = useState<PlayerColor>('periwinkle');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
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
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['knight-chase'].bg}`}>
              <GameIcon id="knight-chase" className={`h-8 w-8 ${gameColors['knight-chase'].text}`} />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Knight Chase
          </h1>
          <p className="text-lg text-foreground/60">
            Strategic knight movement with a twist!
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
                <li>• Players start at opposite corners of an 8x8 board</li>
                <li>
                  • Move like a chess knight: in an L-shape (2 squares in one
                  direction, then 1 square perpendicular)
                </li>
                <li>
                  • Once you leave a square, it becomes &quot;exhausted&quot;
                  and cannot be entered again
                </li>
                <li>
                  • Win by landing on your opponent&apos;s square (elimination)
                </li>
                <li>
                  • Or win when your opponent has no valid moves left
                  (entrapment)
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left pane: Player options */}
          <div className="flex flex-col gap-4">
            {/* Player 1 customization */}
            <Collapsible
              defaultOpen={!isMobile}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">
                    {player1Name} Options
                  </h3>
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
                  <h3 className="text-lg font-semibold">
                    {player2Name} Options
                  </h3>
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
              onGameEnd={handleGameEnd}
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
