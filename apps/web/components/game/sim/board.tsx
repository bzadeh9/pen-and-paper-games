'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { GameState } from '@/lib/games/sim/types';
import { NUM_VERTICES } from '@/lib/games/sim/engine';

interface BoardProps {
  gameState: GameState;
  onEdgeClick: (v1: number, v2: number) => void;
  player1Name: string;
  player2Name: string;
}

/** Compute hexagon vertex positions (centered at origin). */
function getVertexPosition(
  index: number,
  cx: number,
  cy: number,
  radius: number
): { x: number; y: number } {
  // Start from the top (-90°) and go clockwise
  const angle = (Math.PI * 2 * index) / NUM_VERTICES - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

/** All possible edges in K6 (pairs with v1 < v2). */
const ALL_EDGE_PAIRS: { v1: number; v2: number }[] = [];
for (let a = 0; a < NUM_VERTICES; a++) {
  for (let b = a + 1; b < NUM_VERTICES; b++) {
    ALL_EDGE_PAIRS.push({ v1: a, v2: b });
  }
}

export function Board({
  gameState,
  onEdgeClick,
  player1Name,
  player2Name,
}: BoardProps) {
  const [hoveredEdge, setHoveredEdge] = useState<{
    v1: number;
    v2: number;
  } | null>(null);

  const SIZE = 400;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = 150;
  const DOT_RADIUS = 12;
  const HIT_TARGET_WIDTH = 20;

  const positions = useMemo(
    () =>
      Array.from({ length: NUM_VERTICES }, (_, i) =>
        getVertexPosition(i, CX, CY, RADIUS)
      ),
    [CX, CY, RADIUS]
  );

  const edgeOwnerMap = useMemo(() => {
    const map = new Map<string, 1 | 2>();
    for (const e of gameState.edges) {
      map.set(`${e.v1}-${e.v2}`, e.owner);
    }
    return map;
  }, [gameState.edges]);

  const losingEdgeSet = useMemo(() => {
    const set = new Set<string>();
    if (gameState.losingTriangle) {
      const { a, b, c } = gameState.losingTriangle;
      const pairs = [
        [a, b],
        [a, c],
        [b, c],
      ];
      for (const [v1, v2] of pairs) {
        const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
        set.add(key);
      }
    }
    return set;
  }, [gameState.losingTriangle]);

  const getEdgeOwner = useCallback(
    (v1: number, v2: number): 1 | 2 | null => {
      const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      return edgeOwnerMap.get(key) ?? null;
    },
    [edgeOwnerMap]
  );

  const isClickable = useCallback(
    (v1: number, v2: number) => {
      if (gameState.status !== 'playing') return false;
      return getEdgeOwner(v1, v2) === null;
    },
    [gameState.status, getEdgeOwner]
  );

  const isLosingEdge = useCallback(
    (v1: number, v2: number) => {
      const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
      return losingEdgeSet.has(key);
    },
    [losingEdgeSet]
  );

  const vertexLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 0; i < NUM_VERTICES; i++) {
      labels.push(String(i + 1));
    }
    return labels;
  }, []);

  return (
    <div className="flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full h-auto max-w-[500px]"
      >
        {/* Losing triangle fill */}
        {gameState.losingTriangle && (
          <polygon
            points={[
              gameState.losingTriangle.a,
              gameState.losingTriangle.b,
              gameState.losingTriangle.c,
            ]
              .map((v) => `${positions[v].x},${positions[v].y}`)
              .join(' ')}
            className={
              gameState.loser === 1
                ? 'fill-dusk-blue/15'
                : 'fill-powder-blush/15'
            }
          />
        )}

        {/* All edges */}
        {ALL_EDGE_PAIRS.map(({ v1, v2 }) => {
          const owner = getEdgeOwner(v1, v2);
          const clickable = isClickable(v1, v2);
          const losing = isLosingEdge(v1, v2);
          const hovered =
            hoveredEdge !== null &&
            ((hoveredEdge.v1 === v1 && hoveredEdge.v2 === v2) ||
              (hoveredEdge.v1 === v2 && hoveredEdge.v2 === v1));
          const p1 = positions[v1];
          const p2 = positions[v2];

          return (
            <line
              key={`edge-${v1}-${v2}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              strokeWidth={
                losing ? 5 : owner ? 3.5 : hovered && clickable ? 3.5 : 1.5
              }
              className={
                owner
                  ? owner === 1
                    ? 'stroke-dusk-blue'
                    : 'stroke-powder-blush'
                  : clickable
                    ? hovered
                      ? gameState.currentPlayer === 1
                        ? 'stroke-dusk-blue/60'
                        : 'stroke-powder-blush/60'
                      : 'stroke-foreground/15'
                    : 'stroke-foreground/15'
              }
              strokeLinecap="round"
            />
          );
        })}

        {/* Clickable hit targets (transparent wider lines) */}
        {ALL_EDGE_PAIRS.map(({ v1, v2 }) => {
          const clickable = isClickable(v1, v2);
          if (!clickable) return null;
          const p1 = positions[v1];
          const p2 = positions[v2];

          return (
            <line
              key={`hit-${v1}-${v2}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              strokeWidth={HIT_TARGET_WIDTH}
              stroke="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => onEdgeClick(v1, v2)}
              onMouseEnter={() => setHoveredEdge({ v1, v2 })}
              onMouseLeave={() => setHoveredEdge(null)}
            />
          );
        })}

        {/* Vertex dots */}
        {positions.map((pos, i) => (
          <circle
            key={`dot-${i}`}
            cx={pos.x}
            cy={pos.y}
            r={DOT_RADIUS}
            className="fill-foreground"
          />
        ))}

        {/* Vertex labels */}
        {positions.map((pos, i) => (
          <text
            key={`label-${i}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-background font-bold text-xs select-none"
            fontSize={12}
          >
            {vertexLabels[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}
