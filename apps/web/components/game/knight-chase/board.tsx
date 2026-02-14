'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { KnightChaseEngine } from '@/lib/games/knight-chase/engine';
import { PLAYER_COLORS, PlayerColor } from '@/lib/games/knight-chase/types';
import type { Position, Player } from '@/lib/games/knight-chase/types';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

interface GameBoardProps {
  player1Color: PlayerColor;
  player2Color: PlayerColor;
  player1Name?: string;
  player2Name?: string;
  onGameEnd?: (winner: Player) => void;
  onGameStateChange?: (status: 'setup' | 'playing' | 'ended') => void;
}

export function GameBoard({
  player1Color,
  player2Color,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
  onGameEnd,
  onGameStateChange,
}: GameBoardProps) {
  const engine = useMemo(() => new KnightChaseEngine(), []);
  const [gameState, setGameState] = useState(engine.getState());
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPossibleMoves, setShowPossibleMoves] = useState(false);

  useEffect(() => {
    if (gameState.status === 'ended' && gameState.winner && onGameEnd) {
      onGameEnd(gameState.winner);
    }
    if (onGameStateChange) {
      onGameStateChange(gameState.status);
    }
  }, [gameState.status, gameState.winner, onGameEnd, onGameStateChange]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleCellClick = (pos: Position) => {
    if (gameState.status !== 'playing') return;

    if (!engine.isValidMove(pos)) {
      setErrorMessage('Invalid move: Must be a valid L-shaped knight move.');
      return;
    }

    if (engine.makeMove(pos)) {
      setGameState(engine.getState());
      setErrorMessage(null);
      playSound();
    }
  };

  const playSound = () => {
    if (typeof window !== 'undefined') {
      const audioContext = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      )();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        150,
        audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const handleReset = () => {
    engine.reset();
    setGameState(engine.getState());
  };

  const validMoves = engine.getValidMoves();
  const isValidMove = (pos: Position) =>
    validMoves.some((move) => move.row === pos.row && move.col === pos.col);

  const currentPlayerColor =
    gameState.currentPlayer === 1
      ? PLAYER_COLORS[player1Color]
      : PLAYER_COLORS[player2Color];

  const isMobile = useMediaQuery('(max-width: 767px)');
  const CELL_SIZE = isMobile ? 40 : 60;
  const KNIGHT_SIZE = isMobile ? 28 : 40;

  return (
    <div className="flex flex-col items-center gap-6">
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border-2 border-red-500 bg-red-100 px-4 py-2 text-red-800 dark:bg-red-900 dark:text-red-200"
        >
          {errorMessage}
        </div>
      )}

      {gameState.status === 'setup' && (
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold">Ready to Chase?</p>
          <button
            onClick={() => {
              engine.startGame();
              setGameState(engine.getState());
            }}
            className="rounded-lg bg-foreground px-8 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            aria-label="Start Game"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState.status === 'playing' && (
        <div className="text-center">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold">
              {gameState.currentPlayer === 1 ? player1Name : player2Name}&apos;s
              Turn
            </p>
            <div className="flex items-center justify-center gap-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: currentPlayerColor }}
                aria-label={`${gameState.currentPlayer === 1 ? player1Name : player2Name}'s turn indicator`}
              />
            </div>
          </div>
        </div>
      )}

      {gameState.status === 'ended' && (
        <div className="text-center">
          <div className="mb-4 rounded-lg border-2 border-foreground/20 bg-background p-6">
            <p className="mb-2 text-2xl font-bold">Game Over!</p>
            <p className="text-lg">
              {gameState.winner === 1 ? player1Name : player2Name} wins by{' '}
              {gameState.winReason}!
            </p>
          </div>
          <button
            onClick={handleReset}
            className="rounded-lg bg-foreground px-8 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            aria-label="Play Again"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Game board */}
      <div
        className="grid gap-0 border-2 border-foreground/40"
        style={{
          gridTemplateColumns: `repeat(${gameState.gridSize}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${gameState.gridSize}, ${CELL_SIZE}px)`,
        }}
      >
        {Array.from({ length: gameState.gridSize }).map((_, row) =>
          Array.from({ length: gameState.gridSize }).map((_, col) => {
            const cellState = gameState.grid[row][col];
            const pos: Position = { row, col };
            const isValid = isValidMove(pos);
            const isHovered =
              hoveredCell?.row === row && hoveredCell?.col === col;
            const isPlayer1 = cellState === 1;
            const isPlayer2 = cellState === 2;
            const isExhausted = cellState === 'exhausted';

            return (
              <div
                key={`${row}-${col}`}
                className={`relative flex items-center justify-center border border-foreground/20 transition-all ${
                  isExhausted
                    ? 'bg-foreground/5 dark:bg-foreground/10 cursor-not-allowed'
                    : isValid && gameState.status === 'playing'
                      ? `${showPossibleMoves ? 'bg-green-100 dark:bg-green-900/30' : 'bg-background'} cursor-pointer hover:bg-green-200 dark:hover:bg-green-900/50`
                      : 'bg-background cursor-default'
                } ${isHovered && isValid ? 'ring-2 ring-green-500' : ''}`}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
                onClick={() => handleCellClick(pos)}
                onMouseEnter={() => setHoveredCell(pos)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {isExhausted && (
                  <svg
                    className="absolute inset-0 h-full w-full p-4 text-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                {isPlayer1 && (
                  <div
                    className="rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      width: KNIGHT_SIZE,
                      height: KNIGHT_SIZE,
                      backgroundColor: PLAYER_COLORS[player1Color],
                    }}
                  >
                    ♞
                  </div>
                )}
                {isPlayer2 && (
                  <div
                    className="rounded-full flex items-center justify-center text-white font-bold"
                    style={{
                      width: KNIGHT_SIZE,
                      height: KNIGHT_SIZE,
                      backgroundColor: PLAYER_COLORS[player2Color],
                    }}
                  >
                    ♞
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Game info */}
      <div className="text-center text-sm text-foreground/60">
        <div className="mb-4 flex items-center justify-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={showPossibleMoves}
              onChange={(e) => setShowPossibleMoves(e.target.checked)}
              className="h-4 w-4 rounded border-foreground/20 text-foreground accent-foreground focus:ring-foreground"
            />
            <span className="font-medium text-foreground">
              Highlight Possible Moves
            </span>
          </label>
        </div>
        <p>Move in an L-shape (like a chess knight)</p>
        <p className="mt-1">Squares are marked as spent once left</p>
      </div>
    </div>
  );
}
