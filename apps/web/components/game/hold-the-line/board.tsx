'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HoldTheLineEngine, Position, Player } from '@/lib/games/hold-the-line/engine';
import { PLAYER_COLORS, PlayerColor } from '@/lib/games/hold-the-line/types';

interface GameBoardProps {
  player1Color: PlayerColor;
  player2Color: PlayerColor;
  onGameEnd?: (winner: Player) => void;
}

export function GameBoard({ player1Color, player2Color, onGameEnd }: GameBoardProps) {
  const [engine] = useState(() => new HoldTheLineEngine(4));
  const [gameState, setGameState] = useState(engine.getState());
  const [hoveredDot, setHoveredDot] = useState<Position | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (gameState.status === 'ended' && gameState.winner && onGameEnd) {
      onGameEnd(gameState.winner);
    }
  }, [gameState.status, gameState.winner, onGameEnd]);

  const handleDotClick = (pos: Position) => {
    if (engine.makeMove(pos)) {
      setGameState(engine.getState());
      playSound();
    }
  };

  const playSound = () => {
    // Create a simple pencil scratch sound effect using Web Audio API
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

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
    gameState.currentPlayer === 1 ? PLAYER_COLORS[player1Color] : PLAYER_COLORS[player2Color];

  const DOT_SIZE = 12;
  const GRID_SPACING = 80;
  const PADDING = 40;
  const SVG_WIDTH = GRID_SPACING * 3 + PADDING * 2;
  const SVG_HEIGHT = GRID_SPACING * 3 + PADDING * 2;

  const getDotPosition = (row: number, col: number) => ({
    x: PADDING + col * GRID_SPACING,
    y: PADDING + row * GRID_SPACING,
  });

  const positionKey = (pos: Position) => `${pos.row},${pos.col}`;
  const isVisited = (pos: Position) => gameState.visitedDots.has(positionKey(pos));

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Game status */}
      <div className="text-center">
        {gameState.status === 'playing' ? (
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold">
              Player {gameState.currentPlayer}'s Turn
            </p>
            <div
              className="mx-auto h-4 w-4 rounded-full"
              style={{ backgroundColor: currentPlayerColor }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-2xl font-bold">Game Over!</p>
            <p className="text-lg">Player {gameState.winner} Wins!</p>
            <div
              className="mx-auto h-4 w-4 rounded-full"
              style={{
                backgroundColor:
                  gameState.winner === 1
                    ? PLAYER_COLORS[player1Color]
                    : PLAYER_COLORS[player2Color],
              }}
            />
          </div>
        )}
      </div>

      {/* Game board */}
      <div className="relative rounded-lg border-2 border-foreground/20 bg-background p-4 shadow-lg">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          className="cursor-pointer"
          style={{ touchAction: 'none' }}
        >
          {/* Draw grid lines (faint) */}
          {Array.from({ length: 4 }).map((_, row) => (
            <React.Fragment key={`grid-row-${row}`}>
              {Array.from({ length: 3 }).map((_, col) => {
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
          {Array.from({ length: 4 }).map((_, col) => (
            <React.Fragment key={`grid-col-${col}`}>
              {Array.from({ length: 3 }).map((_, row) => {
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
          {gameState.moveHistory.map((pos, index) => {
            if (index === 0) return null;
            const prevPos = gameState.moveHistory[index - 1];
            const start = getDotPosition(prevPos.row, prevPos.col);
            const end = getDotPosition(pos.row, pos.col);

            // Add slight curve for hand-drawn effect
            const midX = (start.x + end.x) / 2 + (Math.random() - 0.5) * 3;
            const midY = (start.y + end.y) / 2 + (Math.random() - 0.5) * 3;

            const playerColor = index % 2 === 1 ? PLAYER_COLORS[player1Color] : PLAYER_COLORS[player2Color];

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

          {/* Draw dots */}
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => {
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

                  {/* The dot itself */}
                  <circle
                    cx={x}
                    cy={y}
                    r={DOT_SIZE}
                    fill={visited ? currentPlayerColor : 'currentColor'}
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
      {gameState.moveHistory.length > 0 && (
        <button
          onClick={handleReset}
          className="rounded-lg bg-foreground px-6 py-2 text-background transition-colors hover:bg-foreground/90"
        >
          New Game
        </button>
      )}
    </div>
  );
}
