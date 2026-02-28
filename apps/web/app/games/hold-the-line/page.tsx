'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useCallback } from 'react';
import { GameBoard } from '@/components/game/hold-the-line/board';
import { PlayerCustomization } from '@/components/game/hold-the-line/player-customization';
import { GameStats } from '@/components/game/hold-the-line/game-stats';
import { GridSizeSelector } from '@/components/game/hold-the-line/grid-size-selector';
import { RoundsSelector } from '@/components/game/hold-the-line/rounds-selector';
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
import { useMediaQuery } from '@/lib/hooks/use-media-query';

export default function HoldTheLinePage() {
  const [player1Color, setPlayer1Color] =
    useState<PlayerColor>('cherryBlossom');
  const [player2Color, setPlayer2Color] = useState<PlayerColor>('dustyMauve');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [gridSize, setGridSize] = useState(4);
  const [totalRounds, setTotalRounds] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundWins, setRoundWins] = useState({ player1: 0, player2: 0 });
  const [gameStatus, setGameStatus] = useState<'setup' | 'playing' | 'ended'>(
    'setup'
  );
  const [tournamentStatus, setTournamentStatus] = useState<
    'inactive' | 'active' | 'ended'
  >('inactive');
  const [stats, setStats] = useState(() => getGameStatistics());

  // Use media query to detect mobile
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleGameEnd = useCallback(
    (winningPlayer: Player) => {
      // Record the game and update stats
      const newStats = recordGame(winningPlayer);
      setStats(newStats);

      // Update tournament tracking
      if (totalRounds > 1 && tournamentStatus === 'active') {
        const newRoundWins = { ...roundWins };
        if (winningPlayer === 1) {
          newRoundWins.player1 += 1;
        } else {
          newRoundWins.player2 += 1;
        }
        setRoundWins(newRoundWins);

        // Check if tournament is complete
        const requiredWins = Math.ceil(totalRounds / 2);
        if (
          newRoundWins.player1 >= requiredWins ||
          newRoundWins.player2 >= requiredWins
        ) {
          setTournamentStatus('ended');
        }
      }
    },
    [totalRounds, tournamentStatus, roundWins]
  );

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
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['hold-the-line'].bg}`}>
              <GameIcon id="hold-the-line" className={`h-8 w-8 ${gameColors['hold-the-line'].text}`} />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Hold The Line
          </h1>
          <p className="text-lg text-foreground/60">
            Connect the dots, and be the last one to move!
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
                  • Both players must press &quot;Ready&quot; to start the game
                </li>
                <li>
                  • Players take turns drawing lines between adjacent dots
                  (horizontal, vertical, or diagonal)
                </li>
                <li>
                  • Each line must connect to one of the two ends of the
                  existing path
                </li>
                <li>• You cannot visit a dot that has already been used</li>
                <li>
                  • The player who has no more legal moves left is the loser
                  (the other player <strong>WINS</strong>)
                </li>
              </ul>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left pane: Player options and settings */}
          <div className="flex flex-col gap-4">
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

            {/* Rounds Selector */}
            <Collapsible
              defaultOpen={!isMobile}
              className="rounded-lg border border-foreground/20 bg-background"
            >
              <div className="px-4 pt-4 pb-2">
                <CollapsibleTrigger>
                  <h3 className="text-lg font-semibold">Tournament Mode</h3>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <RoundsSelector
                    rounds={totalRounds}
                    onRoundsChange={setTotalRounds}
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
          <div className="flex items-start justify-center">
            <GameBoard
              player1Color={player1Color}
              player2Color={player2Color}
              player1Name={player1Name}
              player2Name={player2Name}
              gridSize={gridSize}
              onGameEnd={handleGameEnd}
              onGameStateChange={setGameStatus}
              onGameStart={() => {
                if (totalRounds > 1 && tournamentStatus === 'inactive') {
                  setTournamentStatus('active');
                  setCurrentRound(1);
                  setRoundWins({ player1: 0, player2: 0 });
                }
              }}
              onNewGameRequest={() => {
                if (totalRounds > 1 && tournamentStatus === 'active') {
                  // Start next round
                  setCurrentRound((prev) => prev + 1);
                }
              }}
              tournamentMode={totalRounds > 1}
              currentRound={currentRound}
              totalRounds={totalRounds}
              roundWins={roundWins}
              tournamentEnded={tournamentStatus === 'ended'}
            />
          </div>

          {/* Right pane: Game over message (when ended) and stats */}
          <div className="flex flex-col gap-4">
            {/* Game over message will be rendered by the board component but we keep stats here */}
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
