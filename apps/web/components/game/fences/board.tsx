'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { GameState } from '@/lib/games/fences/types';

interface BoardProps {
  gameState: GameState;
  onLineClick: (row: number, col: number, orientation: 'h' | 'v') => void;
  player1Name: string;
  player2Name: string;
}

export function Board({ gameState, onLineClick, player1Name, player2Name }: BoardProps) {
  const [hoveredLine, setHoveredLine] = useState<{
    row: number;
    col: number;
    orientation: 'h' | 'v';
  } | null>(null);

  const DOT_RADIUS = 5;
  const HIT_TARGET_WIDTH = 16;
  const GRID_SPACING_LARGE = 70;
  const GRID_SPACING_MEDIUM = 55;
  const GRID_SPACING_SMALL = 45;
  const GRID_SPACING =
    gameState.gridSize <= 5
      ? GRID_SPACING_LARGE
      : gameState.gridSize <= 7
        ? GRID_SPACING_MEDIUM
        : GRID_SPACING_SMALL;
  const PADDING = 30;
  const SVG_WIDTH = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;
  const SVG_HEIGHT = GRID_SPACING * (gameState.gridSize - 1) + PADDING * 2;

  const getDotPosition = useCallback(
    (row: number, col: number) => ({
      x: PADDING + col * GRID_SPACING,
      y: PADDING + row * GRID_SPACING,
    }),
    [PADDING, GRID_SPACING]
  );

  const lineSet = useMemo(() => {
    const set = new Set<string>();
    for (const l of gameState.lines) {
      set.add(`${l.orientation}-${l.row}-${l.col}`);
    }
    return set;
  }, [gameState.lines]);

  const lineOwnerMap = useMemo(() => {
    const map = new Map<string, 1 | 2>();
    for (const l of gameState.lines) {
      map.set(`${l.orientation}-${l.row}-${l.col}`, l.owner);
    }
    return map;
  }, [gameState.lines]);

  const boxOwnerMap = useMemo(() => {
    const map = new Map<string, 1 | 2>();
    for (const b of gameState.boxes) {
      if (b.owner) {
        map.set(`${b.row}-${b.col}`, b.owner);
      }
    }
    return map;
  }, [gameState.boxes]);

  const hasLine = useCallback(
    (row: number, col: number, orientation: 'h' | 'v') => {
      return lineSet.has(`${orientation}-${row}-${col}`);
    },
    [lineSet]
  );

  const getLineOwner = useCallback(
    (row: number, col: number, orientation: 'h' | 'v') => {
      return lineOwnerMap.get(`${orientation}-${row}-${col}`) ?? null;
    },
    [lineOwnerMap]
  );

  const isClickable = useCallback(
    (row: number, col: number, orientation: 'h' | 'v') => {
      if (gameState.status !== 'playing') return false;
      return !hasLine(row, col, orientation);
    },
    [gameState.status, hasLine]
  );

  const showSetupOverlay = gameState.status === 'setup';

  return (
    <div className="flex items-center justify-center relative">
      {showSetupOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-xl">
          <div className="text-center p-6">
            <p className="text-lg font-semibold text-foreground/80">
              Choose grid size and click Start Game
            </p>
          </div>
        </div>
      )}
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="w-full h-auto max-w-[500px]"
      >
        {/* Completed boxes */}
        {Array.from({ length: gameState.gridSize - 1 }).map((_, row) =>
          Array.from({ length: gameState.gridSize - 1 }).map((_, col) => {
            const owner = boxOwnerMap.get(`${row}-${col}`);
            if (!owner) return null;
            const { x, y } = getDotPosition(row, col);
            return (
              <rect
                key={`box-${row}-${col}`}
                x={x}
                y={y}
                width={GRID_SPACING}
                height={GRID_SPACING}
                className={
                  owner === 1
                    ? 'fill-dusk-blue/30'
                    : 'fill-powder-blush/30'
                }
              />
            );
          })
        )}

        {/* Horizontal lines */}
        {Array.from({ length: gameState.gridSize }).map((_, row) =>
          Array.from({ length: gameState.gridSize - 1 }).map((_, col) => {
            const start = getDotPosition(row, col);
            const end = getDotPosition(row, col + 1);
            const placed = hasLine(row, col, 'h');
            const owner = getLineOwner(row, col, 'h');
            const clickable = isClickable(row, col, 'h');
            const hovered =
              hoveredLine?.row === row &&
              hoveredLine?.col === col &&
              hoveredLine?.orientation === 'h';

            return (
              <line
                key={`h-${row}-${col}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                strokeWidth={placed ? 4 : hovered && clickable ? 4 : 2}
                className={
                  placed
                    ? owner === 1
                      ? 'stroke-dusk-blue'
                      : 'stroke-powder-blush'
                    : clickable
                      ? hovered
                        ? gameState.currentPlayer === 1
                          ? 'stroke-dusk-blue/60 cursor-pointer'
                          : 'stroke-powder-blush/60 cursor-pointer'
                        : 'stroke-foreground/10 cursor-pointer'
                      : 'stroke-foreground/10'
                }
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                onClick={() => clickable && onLineClick(row, col, 'h')}
                onMouseEnter={() =>
                  clickable && setHoveredLine({ row, col, orientation: 'h' })
                }
                onMouseLeave={() => setHoveredLine(null)}
              />
            );
          })
        )}

        {/* Vertical lines */}
        {Array.from({ length: gameState.gridSize - 1 }).map((_, row) =>
          Array.from({ length: gameState.gridSize }).map((_, col) => {
            const start = getDotPosition(row, col);
            const end = getDotPosition(row + 1, col);
            const placed = hasLine(row, col, 'v');
            const owner = getLineOwner(row, col, 'v');
            const clickable = isClickable(row, col, 'v');
            const hovered =
              hoveredLine?.row === row &&
              hoveredLine?.col === col &&
              hoveredLine?.orientation === 'v';

            return (
              <line
                key={`v-${row}-${col}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                strokeWidth={placed ? 4 : hovered && clickable ? 4 : 2}
                className={
                  placed
                    ? owner === 1
                      ? 'stroke-dusk-blue'
                      : 'stroke-powder-blush'
                    : clickable
                      ? hovered
                        ? gameState.currentPlayer === 1
                          ? 'stroke-dusk-blue/60 cursor-pointer'
                          : 'stroke-powder-blush/60 cursor-pointer'
                        : 'stroke-foreground/10 cursor-pointer'
                      : 'stroke-foreground/10'
                }
                style={{ cursor: clickable ? 'pointer' : 'default' }}
                onClick={() => clickable && onLineClick(row, col, 'v')}
                onMouseEnter={() =>
                  clickable && setHoveredLine({ row, col, orientation: 'v' })
                }
                onMouseLeave={() => setHoveredLine(null)}
              />
            );
          })
        )}

        {/* Clickable areas for horizontal lines (wider hit targets) */}
        {Array.from({ length: gameState.gridSize }).map((_, row) =>
          Array.from({ length: gameState.gridSize - 1 }).map((_, col) => {
            const start = getDotPosition(row, col);
            const end = getDotPosition(row, col + 1);
            const clickable = isClickable(row, col, 'h');
            if (!clickable) return null;

            return (
              <line
                key={`hh-${row}-${col}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                strokeWidth={HIT_TARGET_WIDTH}
                stroke="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => onLineClick(row, col, 'h')}
                onMouseEnter={() =>
                  setHoveredLine({ row, col, orientation: 'h' })
                }
                onMouseLeave={() => setHoveredLine(null)}
              />
            );
          })
        )}

        {/* Clickable areas for vertical lines (wider hit targets) */}
        {Array.from({ length: gameState.gridSize - 1 }).map((_, row) =>
          Array.from({ length: gameState.gridSize }).map((_, col) => {
            const start = getDotPosition(row, col);
            const end = getDotPosition(row + 1, col);
            const clickable = isClickable(row, col, 'v');
            if (!clickable) return null;

            return (
              <line
                key={`vh-${row}-${col}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                strokeWidth={HIT_TARGET_WIDTH}
                stroke="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => onLineClick(row, col, 'v')}
                onMouseEnter={() =>
                  setHoveredLine({ row, col, orientation: 'v' })
                }
                onMouseLeave={() => setHoveredLine(null)}
              />
            );
          })
        )}

        {/* Box owner initials */}
        {Array.from({ length: gameState.gridSize - 1 }).map((_, row) =>
          Array.from({ length: gameState.gridSize - 1 }).map((_, col) => {
            const owner = boxOwnerMap.get(`${row}-${col}`);
            if (!owner) return null;
            const { x, y } = getDotPosition(row, col);
            const name = owner === 1 ? player1Name : player2Name;
            const initials = name.trim().charAt(0).toUpperCase() || (owner === 1 ? 'P' : 'P');
            return (
              <text
                key={`label-${row}-${col}`}
                x={x + GRID_SPACING / 2}
                y={y + GRID_SPACING / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className={
                  owner === 1
                    ? 'fill-dusk-blue font-bold text-sm'
                    : 'fill-powder-blush font-bold text-sm'
                }
                fontSize={GRID_SPACING * 0.3}
              >
                {initials}
              </text>
            );
          })
        )}

        {/* Dots */}
        {Array.from({ length: gameState.gridSize }).map((_, row) =>
          Array.from({ length: gameState.gridSize }).map((_, col) => {
            const { x, y } = getDotPosition(row, col);
            return (
              <circle
                key={`dot-${row}-${col}`}
                cx={x}
                cy={y}
                r={DOT_RADIUS}
                className="fill-foreground"
              />
            );
          })
        )}
      </svg>
    </div>
  );
}
