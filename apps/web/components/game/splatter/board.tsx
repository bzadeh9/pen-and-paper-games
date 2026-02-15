'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SplatterEngine,
  Position,
  Player,
  SetupMode,
} from '@/lib/games/splatter/engine';
import { PLAYER_COLORS, PlayerColor } from '@/lib/games/splatter/types';
import { Button } from '@/components/ui/button';

interface GameBoardProps {
  player1Color: PlayerColor;
  player2Color: PlayerColor;
  player1Name?: string;
  player2Name?: string;
  gridSize?: number;
  setupMode?: SetupMode;
  onGameEnd?: (winner: Player | 'draw') => void;
  onGameStateChange?: (status: 'setup' | 'playing' | 'ended') => void;
}

export function GameBoard({
  player1Color,
  player2Color,
  player1Name = 'Player 1',
  player2Name = 'Player 2',
  gridSize = 5,
  setupMode = 'auto',
  onGameEnd,
  onGameStateChange,
}: GameBoardProps) {
  const engine = useMemo(
    () => new SplatterEngine(gridSize, setupMode),
    [gridSize, setupMode]
  );
  const [gameState, setGameState] = useState(engine.getState());
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [showAreaPreview, setShowAreaPreview] = useState(false);
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const longPressActiveRef = useRef(false);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    setGameState(engine.getState());
  }, [engine]);

  useEffect(() => {
    if (gameState.status === 'ended' && onGameEnd) {
      if (gameState.winner) {
        onGameEnd(gameState.winner);
      }
    }
    if (onGameStateChange) {
      onGameStateChange(gameState.status);
    }
  }, [gameState.status, gameState.winner, onGameEnd, onGameStateChange]);

  const handleCellClick = (pos: Position, isSingleSplatter: boolean) => {
    if (gameState.status === 'setup' && setupMode === 'manual') {
      if (engine.placeManualDot(pos)) {
        setGameState(engine.getState());
      }
      return;
    }

    if (gameState.status !== 'playing') return;

    if (isSingleSplatter) {
      if (engine.singleSplatter(pos)) {
        setGameState(engine.getState());
      }
    } else {
      if (engine.areaSplatter(pos)) {
        setGameState(engine.getState());
      }
    }
  };

  const handleStartGame = () => {
    if (engine.startGame()) {
      setGameState(engine.getState());
    }
  };

  const handleReset = () => {
    engine.reset();
    setGameState(engine.getState());
    setHoveredCell(null);
    setShowAreaPreview(false);
  };

  const currentPlayerColor =
    gameState.currentPlayer === 1
      ? PLAYER_COLORS[player1Color]
      : PLAYER_COLORS[player2Color];

  const currentPlayerName =
    gameState.currentPlayer === 1 ? player1Name : player2Name;

  const DOT_SIZE = 16;
  const GRID_SPACING =
    gameState.gridSize <= 5 ? 70 : gameState.gridSize <= 7 ? 55 : 45;
  const PADDING = 40;
  const SVG_WIDTH = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;
  const SVG_HEIGHT = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;

  const getDotPosition = (row: number, col: number) => ({
    x: PADDING + col * GRID_SPACING,
    y: PADDING + row * GRID_SPACING,
  });

  const getCellColor = (cell: Player | null): string => {
    if (cell === null) return 'transparent';
    if (cell === 1) return PLAYER_COLORS[player1Color];
    return PLAYER_COLORS[player2Color];
  };

  const getAreaPreviewCells = (): Position[] => {
    if (!hoveredCell || !showAreaPreview) return [];
    if (gameState.status !== 'playing') return [];
    if (!engine.canSelectCell(hoveredCell)) return [];
    return engine.getAreaSplatterCells(hoveredCell);
  };

  const areaPreviewCells = getAreaPreviewCells();

  const dotCounts = engine.getPlayerDotCounts();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Turn indicator */}
      {gameState.status === 'playing' && (
        <div className="rounded-lg border border-foreground/20 bg-background p-4 text-center">
          <p className="text-sm text-foreground/60">Current Turn</p>
          <div className="flex items-center gap-2 mt-1">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: currentPlayerColor }}
            />
            <p className="text-lg font-semibold">{currentPlayerName}</p>
          </div>
          <div className="mt-2 text-xs text-foreground/60">
            {player1Name}: {dotCounts.player1} dots | {player2Name}:{' '}
            {dotCounts.player2} dots
          </div>
        </div>
      )}

      {/* Setup instruction */}
      {gameState.status === 'setup' &&
        !gameState.setupComplete &&
        setupMode === 'manual' && (
          <div className="rounded-lg border border-foreground/20 bg-background p-4 text-center">
            <p className="text-sm text-foreground/60">Setup Phase</p>
            <div className="flex items-center gap-2 mt-1 justify-center">
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: currentPlayerColor }}
              />
              <p className="text-lg font-semibold">{currentPlayerName}</p>
            </div>
            <p className="text-sm text-foreground/60 mt-1">
              Click to place your dot
            </p>
          </div>
        )}

      {/* Ready button for setup */}
      {gameState.status === 'setup' && gameState.setupComplete && (
        <Button onClick={handleStartGame} className="px-8">
          Start Game
        </Button>
      )}

      {/* Game board */}
      <div className="relative">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          className="border border-foreground/20 rounded-lg bg-background"
        >
          {/* Draw grid cells */}
          {Array.from({ length: gameState.gridSize }).map((_, row) =>
            Array.from({ length: gameState.gridSize }).map((_, col) => {
              const pos = getDotPosition(row, col);
              const cell = gameState.grid[row][col];
              const isHovered =
                hoveredCell?.row === row && hoveredCell?.col === col;
              const isInAreaPreview = areaPreviewCells.some(
                (p) => p.row === row && p.col === col
              );
              const canSelect =
                gameState.status === 'playing' &&
                engine.canSelectCell({ row, col });

              return (
                <g key={`${row}-${col}`}>
                  {/* Cell background for splattered cells */}
                  {cell === null && (
                    <rect
                      x={pos.x - DOT_SIZE}
                      y={pos.y - DOT_SIZE}
                      width={DOT_SIZE * 2}
                      height={DOT_SIZE * 2}
                      fill="currentColor"
                      opacity="0.1"
                      rx="4"
                    />
                  )}

                  {/* Area preview overlay */}
                  {isInAreaPreview && (
                    <rect
                      x={pos.x - DOT_SIZE - 2}
                      y={pos.y - DOT_SIZE - 2}
                      width={DOT_SIZE * 2 + 4}
                      height={DOT_SIZE * 2 + 4}
                      fill={currentPlayerColor}
                      opacity="0.2"
                      rx="6"
                      stroke={currentPlayerColor}
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* Dot */}
                  {cell !== null && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={DOT_SIZE}
                      fill={getCellColor(cell)}
                      stroke={
                        isHovered && canSelect
                          ? currentPlayerColor
                          : 'currentColor'
                      }
                      strokeWidth={isHovered && canSelect ? 3 : 1}
                      opacity={cell !== null ? 1 : 0}
                      className={
                        canSelect ? 'cursor-pointer transition-all' : ''
                      }
                      style={{
                        filter:
                          isHovered && canSelect ? 'brightness(1.2)' : 'none',
                      }}
                    />
                  )}

                  {/* Interactive overlay */}
                  <rect
                    x={pos.x - GRID_SPACING / 2}
                    y={pos.y - GRID_SPACING / 2}
                    width={GRID_SPACING}
                    height={GRID_SPACING}
                    fill="transparent"
                    className={
                      (gameState.status === 'setup' &&
                        setupMode === 'manual' &&
                        cell === null) ||
                      canSelect
                        ? 'cursor-pointer'
                        : ''
                    }
                    onMouseEnter={() => setHoveredCell({ row, col })}
                    onClick={(e) => {
                      if (suppressClickRef.current) {
                        suppressClickRef.current = false;
                        return;
                      }
                      if (gameState.status === 'setup') {
                        handleCellClick({ row, col }, true);
                      } else if (canSelect) {
                        // Right-click or Ctrl+click for area splatter
                        const isAreaSplatter =
                          e.ctrlKey || e.metaKey || e.shiftKey;
                        handleCellClick({ row, col }, !isAreaSplatter);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (canSelect) {
                        handleCellClick({ row, col }, false); // Area splatter
                      }
                    }}
                    onMouseDown={(e) => {
                      if (longPressTimeoutRef.current) {
                        clearTimeout(longPressTimeoutRef.current);
                      }
                      if (
                        e.button === 0 &&
                        canSelect &&
                        gameState.status === 'playing' &&
                        !e.ctrlKey &&
                        !e.metaKey &&
                        !e.shiftKey
                      ) {
                        longPressActiveRef.current = false;
                        longPressTimeoutRef.current = setTimeout(() => {
                          longPressActiveRef.current = true;
                          suppressClickRef.current = true;
                          setShowAreaPreview(true);
                        }, 400);
                      }
                      // Show area preview on right-click or modifier key press
                      if (
                        e.button === 2 ||
                        e.ctrlKey ||
                        e.metaKey ||
                        e.shiftKey
                      ) {
                        setShowAreaPreview(true);
                      }
                    }}
                    onMouseUp={() => {
                      if (longPressTimeoutRef.current) {
                        clearTimeout(longPressTimeoutRef.current);
                      }
                      if (longPressActiveRef.current) {
                        if (canSelect && gameState.status === 'playing') {
                          handleCellClick({ row, col }, false);
                        }
                        longPressActiveRef.current = false;
                      }
                      setShowAreaPreview(false);
                    }}
                    onMouseLeave={() => {
                      setHoveredCell(null);
                      if (longPressTimeoutRef.current) {
                        clearTimeout(longPressTimeoutRef.current);
                      }
                      longPressActiveRef.current = false;
                      setShowAreaPreview(false);
                    }}
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Instructions overlay */}
        {gameState.status === 'playing' && (
          <div className="mt-2 text-center text-xs text-foreground/60">
            Click: Single Splatter | Long-press/Right-click/Ctrl+Click: Area
            Splatter
          </div>
        )}
      </div>

      {/* Game over message */}
      {gameState.status === 'ended' && (
        <div className="rounded-lg border border-foreground/20 bg-background p-6 text-center">
          <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
          {gameState.winner && (
            <>
              <div className="flex items-center gap-2 justify-center mb-2">
                <div
                  className="h-6 w-6 rounded-full"
                  style={{
                    backgroundColor:
                      gameState.winner === 1
                        ? PLAYER_COLORS[player1Color]
                        : PLAYER_COLORS[player2Color],
                  }}
                />
                <p className="text-xl font-semibold">
                  {gameState.winner === 1 ? player1Name : player2Name} Wins!
                </p>
              </div>
            </>
          )}
          <Button onClick={handleReset} className="mt-4">
            Play Again
          </Button>
        </div>
      )}

      {/* Reset button during game */}
      {gameState.status !== 'ended' && (
        <Button onClick={handleReset} variant="outline">
          Reset Game
        </Button>
      )}
    </div>
  );
}
