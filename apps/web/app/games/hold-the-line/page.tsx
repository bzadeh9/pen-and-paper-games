'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GameBoard } from '@/components/game/hold-the-line/board';
import { PlayerCustomization } from '@/components/game/hold-the-line/player-customization';
import { GameStats } from '@/components/game/hold-the-line/game-stats';
import { PlayerColor } from '@/lib/games/hold-the-line/types';
import { Player } from '@/lib/games/hold-the-line/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/hold-the-line/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

export default function HoldTheLinePage() {
  const [player1Color, setPlayer1Color] =
    useState<PlayerColor>('cherryBlossom');
  const [player2Color, setPlayer2Color] = useState<PlayerColor>('dustyMauve');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [stats, setStats] = useState(() => getGameStatistics());
  
  // Use media query to detect mobile - this avoids hydration mismatch
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    setIsMobile(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const handleGameEnd = useCallback((winningPlayer: Player) => {
    // Record the game and update stats
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
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Hold The Line
          </h1>
          <p className="text-lg text-foreground/60">
            Connect the dots, but don&apos;t make the last move!
          </p>
        </div>

        {/* Game rules */}
        <Collapsible
          defaultOpen={!isMobile}
          key={`rules-${isClient}`}
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
                  • Both players must press &quot;Ready&quot; to start the game
                </li>
                <li>
                  • Players take turns drawing lines between adjacent dots
                  (horizontal, vertical, or diagonal)
                </li>
                <li>
                  • Each line must connect to one of the two ends of the existing
                  path
                </li>
                <li>• You cannot visit a dot that has already been used</li>
                <li>
                  • The player who makes the last move <strong>LOSES</strong>{' '}
                  (Misère play)
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Player 1 customization */}
          <div className="flex flex-col gap-4">
            <Collapsible
              defaultOpen={!isMobile}
              key={`player1-${isClient}`}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">
                    Choose {player1Name} Colour
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
          </div>

          {/* Game board */}
          <div className="flex items-center justify-center">
            <GameBoard
              player1Color={player1Color}
              player2Color={player2Color}
              onGameEnd={handleGameEnd}
            />
          </div>

          {/* Player 2 customization and stats */}
          <div className="flex flex-col gap-4">
            <Collapsible
              defaultOpen={!isMobile}
              key={`player2-${isClient}`}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">
                    Choose {player2Name} Colour
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
            <GameStats stats={stats} onReset={handleResetStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
