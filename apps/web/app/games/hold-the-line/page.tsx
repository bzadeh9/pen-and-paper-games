'use client';

import React, { useState } from 'react';
import { GameBoard } from '@/components/game/hold-the-line/board';
import { PlayerCustomization } from '@/components/game/hold-the-line/player-customization';
import { PlayerColor } from '@/lib/games/hold-the-line/types';
import { Player } from '@/lib/games/hold-the-line/engine';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function HoldTheLinePage() {
  const [player1Color, setPlayer1Color] = useState<PlayerColor>('cherryBlossom');
  const [player2Color, setPlayer2Color] = useState<PlayerColor>('dustyMauve');
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameKey, setGameKey] = useState(0);

  const handleGameEnd = (winningPlayer: Player) => {
    setWinner(winningPlayer);
    setShowWinDialog(true);
  };

  const handleNewGame = () => {
    setShowWinDialog(false);
    setWinner(null);
    setGameKey((prev) => prev + 1); // Force remount of GameBoard
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">Hold The Line</h1>
          <p className="text-lg text-foreground/60">
            Connect the dots, but don't make the last move!
          </p>
        </div>

        {/* Game rules */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-background p-6">
          <h2 className="mb-3 text-xl font-semibold">How to Play</h2>
          <ul className="space-y-2 text-foreground/80">
            <li>• Players take turns drawing lines between adjacent dots (horizontal, vertical, or diagonal)</li>
            <li>• Each line must connect to one of the two ends of the existing path</li>
            <li>• You cannot visit a dot that has already been used</li>
            <li>• <strong>Winning Condition:</strong> The player who makes the last move <strong>LOSES</strong> (Misère play)</li>
          </ul>
        </div>

        {/* Main game area */}
        <div className="grid gap-6 md:grid-cols-[1fr_2fr_1fr]">
          {/* Player 1 customization */}
          <div className="flex flex-col gap-4">
            <PlayerCustomization
              playerNumber={1}
              selectedColor={player1Color}
              onColorChange={setPlayer1Color}
            />
          </div>

          {/* Game board */}
          <div className="flex items-center justify-center">
            <GameBoard
              key={gameKey}
              player1Color={player1Color}
              player2Color={player2Color}
              onGameEnd={handleGameEnd}
            />
          </div>

          {/* Player 2 customization */}
          <div className="flex flex-col gap-4">
            <PlayerCustomization
              playerNumber={2}
              selectedColor={player2Color}
              onColorChange={setPlayer2Color}
            />
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block rounded-lg border border-foreground/20 px-6 py-2 transition-colors hover:bg-foreground/10"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Win dialog */}
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
            <DialogDescription>
              Player {winner} wins the game!
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleNewGame}
              className="flex-1 rounded-lg bg-foreground px-4 py-2 text-background transition-colors hover:bg-foreground/90"
            >
              New Game
            </button>
            <button
              onClick={() => setShowWinDialog(false)}
              className="flex-1 rounded-lg border border-foreground/20 px-4 py-2 transition-colors hover:bg-foreground/10"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
