'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  HoldTheLineEngine,
  Position,
  Player,
} from '@/lib/games/hold-the-line/engine';
import { PLAYER_COLORS, PlayerColor } from '@/lib/games/hold-the-line/types';

interface GameBoardProps {
  player1Color: PlayerColor;
  player2Color: PlayerColor;
  player1Name?: string;
  player2Name?: string;
  gridSize?: number;
  onGameEnd?: (winner: Player) => void;
  onGameStateChange?: (status: 'setup' | 'playing' | 'ended') => void;
}

export function GameBoard({
  player1Color,
  player2Color,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
  gridSize = 4,
  onGameEnd,
  onGameStateChange,
}: GameBoardProps) {
  // Memoize engine creation based on gridSize - only recreates when gridSize changes
  const engine = useMemo(() => new HoldTheLineEngine(gridSize), [gridSize]);
  const [gameState, setGameState] = useState(engine.getState());
  const [hoveredDot, setHoveredDot] = useState<Position | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Generate offsets dynamically based on max possible grid size
  const [pathOffsets] = useState(() => {
    // Precompute random offsets for hand-drawn effect
    // Using small offsets to prevent visual intersections
    const offsets: Record<string, { x: number; y: number }> = {};
    // Max possible lines in a 10x10 grid would be 100 (very conservative estimate)
    for (let i = 0; i < 200; i++) {
      offsets[i] = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      };
    }
    return offsets;
  });

  // Sync game state when engine changes
  useEffect(() => {
    setGameState(engine.getState());
  }, [engine]);

  useEffect(() => {
    if (gameState.status === 'ended' && gameState.winner && onGameEnd) {
      onGameEnd(gameState.winner);
    }
    if (onGameStateChange) {
      onGameStateChange(gameState.status);
    }
  }, [gameState.status, gameState.winner, onGameEnd, onGameStateChange]);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleDotClick = (pos: Position) => {
    if (gameState.status !== 'playing') return;
    
    if (!engine.isValidMove(pos)) {
      // Provide feedback for invalid move
      // Note: Move can be invalid for multiple reasons (not adjacent, already visited, or would intersect)
      setErrorMessage('Invalid move: This move is not allowed.');
      return;
    }

    if (engine.makeMove(pos)) {
      setGameState(engine.getState());
      setErrorMessage(null); // Clear any previous error
      playSound();
    }
  };

  const handlePlayerReady = (player: Player) => {
    engine.setPlayerReady(player);
    setGameState(engine.getState());
  };

  const playSound = () => {
    // Create a simple pencil scratch sound effect using Web Audio API
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
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
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

  // Current player's color for turn indicator
  const currentPlayerColor =
    gameState.currentPlayer === 1
      ? PLAYER_COLORS[player1Color]
      : PLAYER_COLORS[player2Color];

  // Use a consistent neutral color for the grid, not changing with turns
  const NEUTRAL_DOT_COLOR = 'currentColor';

  const DOT_SIZE = 12;
  // Make grid spacing responsive - smaller spacing for larger grids
  const GRID_SPACING = gameState.gridSize <= 5 ? 80 : gameState.gridSize <= 7 ? 60 : 50;
  const PADDING = 40;
  const SVG_WIDTH = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;
  const SVG_HEIGHT = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;

  const getDotPosition = (row: number, col: number) => ({
    x: PADDING + col * GRID_SPACING,
    y: PADDING + row * GRID_SPACING,
  });

  const positionKey = (pos: Position) => `${pos.row},${pos.col}`;
  const isVisited = (pos: Position) =>
    gameState.visitedDots.has(positionKey(pos));
  
  // Helper function to find which path end a move would connect to
  const getConnectedPathEnd = (pos: Position): Position | null => {
    if (!gameState.pathEnds || !isValidMove(pos)) return null;
    
    const [end1, end2] = gameState.pathEnds;
    const rowDiff1 = Math.abs(pos.row - end1.row);
    const colDiff1 = Math.abs(pos.col - end1.col);
    const rowDiff2 = Math.abs(pos.row - end2.row);
    const colDiff2 = Math.abs(pos.col - end2.col);
    
    // Check adjacency to end1
    if (rowDiff1 <= 1 && colDiff1 <= 1 && (rowDiff1 > 0 || colDiff1 > 0)) {
      return end1;
    }
    
    // Check adjacency to end2
    if (rowDiff2 <= 1 && colDiff2 <= 1 && (rowDiff2 > 0 || colDiff2 > 0)) {
      return end2;
    }
    
    return null;
  };

  // Memoize hover preview line data
  const hoverPreviewLine = useMemo(() => {
    if (!hoveredDot || gameState.status !== 'playing' || !isValidMove(hoveredDot) || isVisited(hoveredDot)) {
      return null;
    }
    
    const connectedEnd = getConnectedPathEnd(hoveredDot);
    if (!connectedEnd) return null;
    
    return {
      start: getDotPosition(connectedEnd.row, connectedEnd.col),
      end: getDotPosition(hoveredDot.row, hoveredDot.col),
    };
  }, [hoveredDot, gameState.status, gameState.pathEnds, validMoves]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Error message with accessibility support */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border-2 border-red-500 bg-red-100 px-4 py-2 text-red-800 dark:bg-red-900 dark:text-red-200"
        >
          {errorMessage}
        </div>
      )}

      {/* Setup phase - Ready buttons */}
      {gameState.status === 'setup' && (
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold">Get Ready to Play!</p>
          <div className="flex gap-4">
            <button
              onClick={() => handlePlayerReady(1)}
              disabled={gameState.player1Ready}
              className={`rounded-lg px-6 py-3 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                gameState.player1Ready
                  ? 'cursor-not-allowed bg-green-600 text-white'
                  : 'bg-foreground text-background hover:bg-foreground/90 focus:ring-foreground'
              }`}
              aria-label={gameState.player1Ready ? `${player1Name} is ready` : `${player1Name} ready button`}
            >
              {gameState.player1Ready ? `✓ ${player1Name} Ready` : `${player1Name} Ready`}
            </button>
            <button
              onClick={() => handlePlayerReady(2)}
              disabled={gameState.player2Ready}
              className={`rounded-lg px-6 py-3 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                gameState.player2Ready
                  ? 'cursor-not-allowed bg-green-600 text-white'
                  : 'bg-foreground text-background hover:bg-foreground/90 focus:ring-foreground'
              }`}
              aria-label={gameState.player2Ready ? `${player2Name} is ready` : `${player2Name} ready button`}
            >
              {gameState.player2Ready ? `✓ ${player2Name} Ready` : `${player2Name} Ready`}
            </button>
          </div>
        </div>
      )}

      {/* Game status */}
      {gameState.status === 'playing' && (
        <div className="text-center">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold">
              {gameState.currentPlayer === 1 ? player1Name : player2Name}&apos;s Turn
            </p>
            <div
              className="mx-auto h-4 w-4 rounded-full"
              style={{ backgroundColor: currentPlayerColor }}
              aria-label={`${gameState.currentPlayer === 1 ? player1Name : player2Name}'s turn indicator`}
            />
          </div>
        </div>
      )}

      {/* Game over message - non-intrusive, above the board */}
      {gameState.status === 'ended' && (
        <div
          className="rounded-lg border-2 border-green-600 bg-green-100 px-6 py-4 text-center dark:bg-green-900/30 dark:border-green-500"
          role="status"
          aria-live="polite"
        >
          <p className="mb-2 text-2xl font-bold text-green-800 dark:text-green-200">
            Game Over!
          </p>
          <p className="text-lg text-green-700 dark:text-green-300">
            {gameState.winner === 1 ? player1Name : player2Name} Wins! Well done!
          </p>
          <div
            className="mx-auto mt-2 h-4 w-4 rounded-full"
            style={{
              backgroundColor:
                gameState.winner === 1
                  ? PLAYER_COLORS[player1Color]
                  : PLAYER_COLORS[player2Color],
            }}
            aria-label={`${gameState.winner === 1 ? player1Name : player2Name} won`}
          />
        </div>
      )}

      {/* Game board */}
      <div className="relative rounded-lg border-2 border-foreground/20 bg-background p-4 shadow-lg">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          className="cursor-pointer"
          style={{ touchAction: 'none' }}
        >
          {/* Draw grid lines (faint) */}
          {Array.from({ length: gameState.gridSize }).map((_, row) => (
            <React.Fragment key={`grid-row-${row}`}>
              {Array.from({ length: gameState.gridSize - 1 }).map((_, col) => {
                const start = getDotPosition(row, col);
                const end = getDotPosition(row, col + 1);
                return (
                  <line
                    key={`h-line-${row}-${col}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  />
                );
              })}
            </React.Fragment>
          ))}
          {Array.from({ length: gameState.gridSize }).map((_, col) => (
            <React.Fragment key={`grid-col-${col}`}>
              {Array.from({ length: gameState.gridSize - 1 }).map((_, row) => {
                const start = getDotPosition(row, col);
                const end = getDotPosition(row + 1, col);
                return (
                  <line
                    key={`v-line-${row}-${col}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="1"
                  />
                );
              })}
            </React.Fragment>
          ))}

          {/* Draw path lines with hand-drawn style */}
          {gameState.lines.map((line, index) => {
            const start = getDotPosition(line.start.row, line.start.col);
            const end = getDotPosition(line.end.row, line.end.col);

            // Use precomputed offset for hand-drawn effect
            const offset = pathOffsets[index] || { x: 0, y: 0 };
            const midX = (start.x + end.x) / 2 + offset.x;
            const midY = (start.y + end.y) / 2 + offset.y;

            const playerColor =
              line.player === 1
                ? PLAYER_COLORS[player1Color]
                : PLAYER_COLORS[player2Color];

            return (
              <path
                key={`path-${index}`}
                d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`}
                stroke={playerColor}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />
            );
          })}

          {/* Draw hover preview line (dashed) */}
          {hoverPreviewLine && (
            <line
              key="hover-preview"
              x1={hoverPreviewLine.start.x}
              y1={hoverPreviewLine.start.y}
              x2={hoverPreviewLine.end.x}
              y2={hoverPreviewLine.end.y}
              stroke={currentPlayerColor}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
              strokeLinecap="round"
            />
          )}

          {/* Draw dots */}
          {Array.from({ length: gameState.gridSize }).map((_, row) =>
            Array.from({ length: gameState.gridSize }).map((_, col) => {
              const pos = { row, col };
              const { x, y } = getDotPosition(row, col);
              const visited = isVisited(pos);
              const valid = isValidMove(pos);
              const hovered =
                hoveredDot?.row === row && hoveredDot?.col === col;

              return (
                <g key={`dot-${row}-${col}`}>
                  {/* Highlight valid moves */}
                  {valid && !visited && gameState.status === 'playing' && (
                    <circle
                      cx={x}
                      cy={y}
                      r={DOT_SIZE + 6}
                      fill={currentPlayerColor}
                      opacity={hovered ? 0.4 : 0.2}
                      className="transition-opacity"
                    />
                  )}

                  {/* The dot itself - using neutral color consistently */}
                  <circle
                    cx={x}
                    cy={y}
                    r={DOT_SIZE}
                    fill={NEUTRAL_DOT_COLOR}
                    opacity={visited ? 0.8 : 0.5}
                    className={`transition-all ${
                      valid && !visited && gameState.status === 'playing'
                        ? 'cursor-pointer'
                        : ''
                    }`}
                    onClick={() =>
                      valid && !visited && gameState.status === 'playing'
                        ? handleDotClick(pos)
                        : null
                    }
                    onMouseEnter={() => setHoveredDot(pos)}
                    onMouseLeave={() => setHoveredDot(null)}
                    style={{
                      pointerEvents:
                        valid && !visited && gameState.status === 'playing'
                          ? 'auto'
                          : 'none',
                    }}
                  />

                  {/* Show move order number on visited dots */}
                  {visited && (
                    <text
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="currentColor"
                      opacity="0.5"
                    >
                      {gameState.moveHistory.findIndex(
                        (move) => move.row === row && move.col === col
                      ) + 1}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Reset button */}
      {(gameState.moveHistory.length > 0 || gameState.status === 'ended') && (
        <button
          onClick={handleReset}
          className="rounded-lg bg-foreground px-6 py-2 text-background transition-colors hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
          aria-label="Start a new game"
        >
          New Game
        </button>
      )}
    </div>
  );
}
