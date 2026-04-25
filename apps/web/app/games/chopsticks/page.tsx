'use client';

import { GameIcon, gameColors } from '@/components/game-icon';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Board } from '@/components/game/chopsticks/board';
import { ChopsticksEngine } from '@/lib/games/chopsticks/engine';
import {
  getGameStatistics,
  recordGame,
  resetStatistics,
} from '@/lib/games/chopsticks/stats';
import type { Hand } from '@/lib/games/chopsticks/types';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { useMediaQuery } from '@/lib/hooks/use-media-query';
import { Button } from '@/components/ui/button';

const MAX_PLAYER_NAME_LENGTH = 20;

export default function ChopsticksPage() {
  const engine = useMemo(() => new ChopsticksEngine(), []);
  const [gameState, setGameState] = useState(engine.getState());
  const [stats, setStats] = useState(() => getGameStatistics());
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [editingPlayer, setEditingPlayer] = useState<1 | 2 | null>(null);
  const [editName, setEditName] = useState('');

  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleAttack = useCallback(
    (attackerHand: Hand, targetHand: Hand) => {
      const success = engine.attack(attackerHand, targetHand);
      if (success) {
        setGameState(engine.getState());
      }
    },
    [engine]
  );

  const handleSplit = useCallback(
    (newLeft: number, newRight: number) => {
      const success = engine.split(newLeft, newRight);
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
      const newStats = recordGame(gameState.winner);
      setStats(newStats);
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${gameColors['chopsticks']?.bg ?? 'bg-foreground/10'}`}
            >
              <GameIcon
                id="chopsticks"
                className={`h-8 w-8 ${gameColors['chopsticks']?.text ?? 'text-foreground/60'}`}
              />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Chopsticks</h1>
          <p className="text-lg text-foreground/60">
            Tap hands to transfer fingers — eliminate both of your opponent&apos;s hands to win!
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
                    <li>• Each player starts with 1 finger on each hand</li>
                    <li>• Players alternate turns</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    On Your Turn
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • <strong>Attack:</strong> tap one of your alive hands,
                      then tap one of your opponent&apos;s alive hands to add
                      your count to theirs
                    </li>
                    <li>
                      • <strong>Split:</strong> redistribute your own total
                      finger count between your two hands in any valid way
                      (each hand can hold 0–4 fingers; result must differ from
                      current)
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Finger Counting
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • Fingers are counted modulo 5: if a hand reaches
                      exactly 5 it becomes <strong>dead (0)</strong>; if it
                      exceeds 5 it wraps around (e.g. 3 + 4 = 7 → 2)
                    </li>
                    <li>• A dead hand (0) cannot attack or be attacked</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground/90 mb-2">
                    Winning
                  </h3>
                  <ul className="space-y-2 text-foreground/80">
                    <li>
                      • Eliminate <strong>both</strong> of your opponent&apos;s
                      hands to win
                    </li>
                    <li>
                      • Use splits strategically to revive a dead hand or
                      create awkward counts for your opponent
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
                      ? 'text-periwinkle'
                      : 'text-powder-blush'
                  }`}
                >
                  {currentPlayerName}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-foreground/60">Game Over</p>
                <p
                  className={`text-2xl font-bold ${
                    gameState.winner === 1
                      ? 'text-periwinkle'
                      : 'text-powder-blush'
                  }`}
                >
                  🎉 {winnerName} wins!
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
                          player === 1 ? 'bg-periwinkle' : 'bg-powder-blush'
                        }`}
                      />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) =>
                            setEditName(e.target.value.slice(0, MAX_PLAYER_NAME_LENGTH))
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
                          <span className="text-foreground/30 text-xs" aria-hidden="true">
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
                  onAttack={handleAttack}
                  onSplit={handleSplit}
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
                  <span className="text-periwinkle">{player1Name} Wins</span>
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
