'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Board } from '@/components/game/sim/board';
import { SimEngine } from '@/lib/games/sim/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/sim/stats';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { Button } from '@/components/ui/button';

export default function SimPage() {
  const engine = useMemo(() => new SimEngine(), []);
  const [gameState, setGameState] = useState(engine.getState());
  const [stats, setStats] = useState(() => getGameStatistics());
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [editingPlayer, setEditingPlayer] = useState<1 | 2 | null>(null);
  const [editName, setEditName] = useState('');

  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleEdgeClick = useCallback(
    (v1: number, v2: number) => {
      const success = engine.makeMove(v1, v2);
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

  const startEditName = useCallback(
    (player: 1 | 2) => {
      setEditingPlayer(player);
      setEditName(player === 1 ? player1Name : player2Name);
    },
    [player1Name, player2Name]
  );

  const saveName = useCallback(() => {
    if (editingPlayer === 1) {
      setPlayer1Name(editName.trim() || 'Player 1');
    } else if (editingPlayer === 2) {
      setPlayer2Name(editName.trim() || 'Player 2');
    }
    setEditingPlayer(null);
  }, [editingPlayer, editName]);

  const cancelEditName = useCallback(() => {
    setEditingPlayer(null);
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

  const currentPlayerName =
    gameState.currentPlayer === 1 ? player1Name : player2Name;
  const winnerName =
    gameState.winner === 1
      ? player1Name
      : gameState.winner === 2
        ? player2Name
        : null;
  const loserName =
    gameState.loser === 1
      ? player1Name
      : gameState.loser === 2
        ? player2Name
        : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['sim']?.bg ?? 'bg-foreground/10'}`}
            >
              <GameIcon
                id="sim"
                className={`h-8 w-8 ${gameColors['sim']?.text ?? 'text-foreground/60'}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Sim</h1>
          <p className="text-lg text-foreground/60">
            Connect the dots — but don&apos;t complete a triangle in your color!
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
                      • Six dots are arranged in a hexagon shape
                    </li>
                    <li>
                      • Each player has their own color
                    </li>
                    <li>
                      • All 15 possible connections between dots are shown
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Taking Turns
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • Players take turns clicking on an unclaimed line
                      to color it
                    </li>
                    <li>
                      • Once claimed, a line cannot be changed
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Losing Condition
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • The first player to complete a triangle in their color
                      <strong> loses</strong>
                    </li>
                    <li>
                      • Only triangles connecting three outer hexagon dots count
                    </li>
                    <li>
                      • All three sides must be in the same player&apos;s color
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Strategy Tips
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • Watch out for two edges of your color sharing a vertex
                      — the third edge could complete a triangle!
                    </li>
                    <li>
                      • Try to force your opponent into a position where any
                      move creates a triangle in their color
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Turn indicator / game status */}
        <div className="mb-6">
          <div className="rounded-lg border border-foreground/20 bg-background p-4 text-center">
            {gameState.status === 'playing' ? (
              <div>
                <p className="text-sm text-foreground/60">Current Turn</p>
                <p
                  className={`text-2xl font-bold ${
                    gameState.currentPlayer === 1
                      ? 'text-baby-blue-ice'
                      : 'text-powder-blush'
                  }`}
                >
                  {currentPlayerName}
                </p>
                <p className="text-sm text-foreground/50 mt-1">
                  {gameState.edges.length} of {gameState.totalEdges} edges
                  claimed
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-foreground/60">Game Over</p>
                <p
                  className={`text-2xl font-bold ${
                    gameState.winner === 1
                      ? 'text-baby-blue-ice'
                      : 'text-powder-blush'
                  }`}
                >
                  🎉 {winnerName} wins!
                </p>
                <p className="text-sm text-foreground/50 mt-1">
                  {loserName} completed a triangle
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Left panel: Controls */}
          <div className="space-y-4">
            {/* Player names */}
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="font-semibold mb-3">Players</h3>
              {[1, 2].map((p) => {
                const player = p as 1 | 2;
                const name = player === 1 ? player1Name : player2Name;
                const isEditing = editingPlayer === player;
                return (
                  <div key={player} className="mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          player === 1 ? 'bg-baby-blue-ice' : 'bg-powder-blush'
                        }`}
                      />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) =>
                            setEditName(e.target.value.slice(0, 20))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveName();
                            if (e.key === 'Escape') cancelEditName();
                          }}
                          onBlur={saveName}
                          className="flex-1 border border-foreground/20 rounded px-2 py-1 text-sm bg-background"
                          autoFocus
                        />
                      ) : (
                        <button
                          onClick={() => startEditName(player)}
                          className="flex-1 text-left text-sm hover:text-foreground/80 transition-colors"
                        >
                          {name}{' '}
                          <span className="text-foreground/30 text-xs">
                            ✎
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Game controls */}
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <Button onClick={handleReset} className="w-full" variant="outline">
                {gameState.status === 'ended' ? 'Play Again' : 'New Game'}
              </Button>
            </div>
          </div>

          {/* Center: Game Board */}
          <div className="flex items-center justify-center">
            <div className="w-full">
              <div className="rounded-xl border-4 border-foreground/30 bg-background">
                <Board
                  gameState={gameState}
                  onEdgeClick={handleEdgeClick}
                  player1Name={player1Name}
                  player2Name={player2Name}
                />
              </div>
            </div>
          </div>

          {/* Right panel: Stats */}
          <div>
            <div className="rounded-lg border border-foreground/20 bg-background p-4">
              <h3 className="font-semibold mb-3">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/60">Games Played</span>
                  <span className="font-medium">{stats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-baby-blue-ice">{player1Name} Wins</span>
                  <span className="font-medium">{stats.player1Wins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-powder-blush">
                    {player2Name} Wins
                  </span>
                  <span className="font-medium">{stats.player2Wins}</span>
                </div>
              </div>
              <Button
                onClick={handleResetStats}
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-foreground/50"
              >
                Reset Stats
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
