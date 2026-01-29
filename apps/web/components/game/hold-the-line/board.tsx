'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HoldTheLineEngine,
  Position,
  Player,
} from '@/lib/games/hold-the-line/engine';
import {
  PLAYER_COLORS,
  PlayerColor,
  USED_ELEMENT_COLOR,
} from '@/lib/games/hold-the-line/types';

interface GameBoardProps {
  player1Color: PlayerColor;
  player2Color: PlayerColor;
  player1Name?: string;
  player2Name?: string;
  gridSize?: number;
  onGameEnd?: (winner: Player) => void;
  onGameStateChange?: (status: 'setup' | 'playing' | 'ended') => void;
  onGameStart?: () => void;
  onNewGameRequest?: () => void;
  tournamentMode?: boolean;
  currentRound?: number;
  totalRounds?: number;
  roundWins?: { player1: number; player2: number };
  tournamentEnded?: boolean;
}

export function GameBoard({
  player1Color,
  player2Color,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
  gridSize = 4,
  onGameEnd,
  onGameStateChange,
  onGameStart,
  onNewGameRequest,
  tournamentMode = false,
  currentRound = 1,
  totalRounds = 1,
  roundWins = { player1: 0, player2: 0 },
  tournamentEnded = false,
}: GameBoardProps) {
  // Memoize engine creation based on gridSize - only recreates when gridSize changes
  const engine = useMemo(() => new HoldTheLineEngine(gridSize), [gridSize]);
  const [gameState, setGameState] = useState(engine.getState());
  const [hoveredDot, setHoveredDot] = useState<Position | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingMove, setPendingMove] = useState<{
    pos: Position;
    ends: Position[];
  } | null>(null);

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

    if (
      pendingMove &&
      (pendingMove.pos.row !== pos.row || pendingMove.pos.col !== pos.col)
    ) {
      setPendingMove(null);
    }

    const validEnds = engine.getValidConnectionEnds(pos);
    if (gameState.pathEnds && validEnds.length > 1) {
      setPendingMove({ pos, ends: validEnds });
      setErrorMessage(null);
      return;
    }

    if (engine.makeMove(pos, validEnds[0])) {
      setGameState(engine.getState());
      setErrorMessage(null); // Clear any previous error
      setPendingMove(null);
      playSound();
    }
  };

  const handleEndSelection = (end: Position) => {
    if (!pendingMove) return;
    if (engine.makeMove(pendingMove.pos, end)) {
      setGameState(engine.getState());
      setPendingMove(null);
      setErrorMessage(null);
      playSound();
    }
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
    setPendingMove(null);
    setHoveredDot(null);

    // In tournament mode, notify parent to track round progression
    if (tournamentMode && !tournamentEnded && onNewGameRequest) {
      onNewGameRequest();
    }
  };

  const validMoves = engine.getValidMoves();
  const isValidMove = useCallback(
    (pos: Position) =>
      validMoves.some((move) => move.row === pos.row && move.col === pos.col),
    [validMoves]
  );

  // Current player's color for turn indicator
  const currentPlayerColor =
    gameState.currentPlayer === 1
      ? PLAYER_COLORS[player1Color]
      : PLAYER_COLORS[player2Color];

  // Use a distinct neutral color for used elements
  const NEUTRAL_DOT_COLOR = 'currentColor';
  const USED_DOT_COLOR = USED_ELEMENT_COLOR;

  const DOT_SIZE = 12;
  // Make grid spacing responsive - smaller spacing for larger grids
  const GRID_SPACING =
    gameState.gridSize <= 5 ? 80 : gameState.gridSize <= 7 ? 60 : 50;
  const PADDING = 40;
  const SVG_WIDTH = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;
  const SVG_HEIGHT = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;

  const getDotPosition = useCallback(
    (row: number, col: number) => ({
      x: PADDING + col * GRID_SPACING,
      y: PADDING + row * GRID_SPACING,
    }),
    [PADDING, GRID_SPACING]
  );

  const positionKey = useCallback(
    (pos: Position) => `${pos.row},${pos.col}`,
    []
  );
  const isVisited = useCallback(
    (pos: Position) => gameState.visitedDots.has(positionKey(pos)),
    [gameState.visitedDots, positionKey]
  );

  // Memoize hover preview line data
  const hoverPreviewLines = useMemo(() => {
    const previewDot = pendingMove?.pos ?? hoveredDot;
    if (
      !previewDot ||
      gameState.status !== 'playing' ||
      !isValidMove(previewDot) ||
      isVisited(previewDot)
    ) {
      return [];
    }

    const validEnds =
      pendingMove?.ends ?? engine.getValidConnectionEnds(previewDot);
    if (validEnds.length === 0) return [];

    return validEnds.map((end) => ({
      start: getDotPosition(end.row, end.col),
      end: getDotPosition(previewDot.row, previewDot.col),
      key: `${end.row}-${end.col}-${previewDot.row}-${previewDot.col}`,
    }));
  }, [
    hoveredDot,
    pendingMove,
    gameState.status,
    engine,
    getDotPosition,
    isValidMove,
    isVisited,
  ]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Tournament progress display */}
      {tournamentMode && (
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground/80">
            Tournament Mode: Round {currentRound} of {totalRounds}
          </p>
          <div className="mt-2 flex items-center justify-center gap-4 text-sm">
            <span className="text-foreground/60">
              {player1Name}: {roundWins.player1}
            </span>
            <span className="text-foreground/40">|</span>
            <span className="text-foreground/60">
              {player2Name}: {roundWins.player2}
            </span>
          </div>
        </div>
      )}

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

      {/* Setup phase - Start Game button */}
      {gameState.status === 'setup' && (
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold">Ready to Play?</p>
          <button
            onClick={() => {
              engine.startGame();
              setGameState(engine.getState());
              if (onGameStart) {
                onGameStart();
              }
            }}
            className="rounded-lg bg-foreground px-8 py-3 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
            aria-label="Start Game"
          >
            Start Game
          </button>
        </div>
      )}

      {/* Game status */}
      {gameState.status === 'playing' && (
        <div className="text-center">
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold">
              {gameState.currentPlayer === 1 ? player1Name : player2Name}&apos;s
              Turn
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
          {tournamentEnded ? (
            <>
              <p className="mb-2 text-2xl font-bold text-green-800 dark:text-green-200">
                Tournament Over!
              </p>
              <p className="text-lg text-green-700 dark:text-green-300">
                {roundWins.player1 > roundWins.player2
                  ? player1Name
                  : player2Name}{' '}
                Wins the Tournament!
              </p>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                Final Score: {player1Name} {roundWins.player1} -{' '}
                {roundWins.player2} {player2Name}
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 text-2xl font-bold text-green-800 dark:text-green-200">
                {tournamentMode ? 'Round Over!' : 'Game Over!'}
              </p>
              <p className="text-lg text-green-700 dark:text-green-300">
                {gameState.winner === 1 ? player1Name : player2Name} Wins
                {tournamentMode ? ' this round!' : '! Well done!'}
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
            </>
          )}
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

          {/* Draw hover preview lines (dashed) */}
          {hoverPreviewLines.map((line) => (
            <line
              key={`hover-preview-${line.key}`}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke={currentPlayerColor}
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
              strokeLinecap="round"
            />
          ))}

          {/* Highlight selectable path ends for ambiguous moves */}
          {pendingMove?.ends.map((end, index) => {
            const { x, y } = getDotPosition(end.row, end.col);
            return (
              <circle
                key={`pending-end-${index}`}
                cx={x}
                cy={y}
                r={DOT_SIZE + 10}
                fill="none"
                stroke={currentPlayerColor}
                strokeWidth="3"
                strokeDasharray="4,4"
                opacity="0.8"
                onClick={() => handleEndSelection(end)}
                style={{ cursor: 'pointer' }}
                role="button"
                aria-label="Select path end"
              />
            );
          })}

          {/* Draw dots */}
          {Array.from({ length: gameState.gridSize }).map((_, row) =>
            Array.from({ length: gameState.gridSize }).map((_, col) => {
              const pos = { row, col };
              const { x, y } = getDotPosition(row, col);
              const visited = isVisited(pos);
              const valid = isValidMove(pos);
              const hovered =
                hoveredDot?.row === row && hoveredDot?.col === col;
              const isPending =
                pendingMove?.pos.row === row && pendingMove?.pos.col === col;

              return (
                <g key={`dot-${row}-${col}`}>
                  {/* The dot itself - using neutral color for unvisited, distinct color for visited */}
                  <circle
                    cx={x}
                    cy={y}
                    r={DOT_SIZE}
                    fill={visited ? USED_DOT_COLOR : NEUTRAL_DOT_COLOR}
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

                  {/* Highlight valid moves - drawn after dot so it doesn't block clicks */}
                    {valid && !visited && gameState.status === 'playing' && (
                      <circle
                        cx={x}
                        cy={y}
                        r={DOT_SIZE + 6}
                        fill={currentPlayerColor}
                        opacity={hovered || isPending ? 0.4 : 0.2}
                        className="transition-opacity"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

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
          aria-label={
            tournamentMode && !tournamentEnded && gameState.status === 'ended'
              ? 'Start next round'
              : 'Start a new game'
          }
        >
          {tournamentMode && !tournamentEnded && gameState.status === 'ended'
            ? 'Next Round'
            : 'New Game'}
        </button>
      )}
    </div>
  );
}
