'use client';

import React from 'react';
import type { GameState } from '@/lib/games/stained-glass/types';
import type { WindowLayout } from '@/lib/games/stained-glass/layout';

const EMPTY_FILL = 'rgba(229, 231, 235, 0.3)';
const EMPTY_FILL_FALLBACK = 'rgba(229, 231, 235, 0.5)';
const HOVER_BRIGHTNESS_CLASS = 'hover:brightness-95';

interface BoardProps {
  gameState: GameState;
  layout: WindowLayout;
  showPossibleMoves: boolean;
  onSectionClick: (sectionId: number) => void;
}

export function Board({
  gameState,
  layout,
  showPossibleMoves,
  onSectionClick,
}: BoardProps) {
  const getSectionFill = (sectionId: number) => {
    const section = gameState.sections[sectionId];
    if (!section) return EMPTY_FILL_FALLBACK;
    if (section.owner === 1) return 'var(--periwinkle)';
    if (section.owner === 2) return 'var(--powder-blush)';
    return EMPTY_FILL;
  };

  const getSectionStroke = (sectionId: number) => {
    const section = gameState.sections[sectionId];
    if (!section) return 'rgba(0,0,0,0.15)';
    if (section.owner === 1) return 'rgba(120, 100, 180, 0.6)';
    if (section.owner === 2) return 'rgba(200, 120, 120, 0.6)';
    return 'rgba(0, 0, 0, 0.15)';
  };

  const isClickable = (sectionId: number) => {
    if (gameState.status !== 'playing') return false;
    const section = gameState.sections[sectionId];
    if (!section || section.owner !== null) return false;

    const currentPlayer = gameState.currentPlayer;

    if (gameState.mode === 'standard') {
      const opponent = currentPlayer === 1 ? 2 : 1;
      return !section.neighbors.some(
        (nId) => gameState.sections[nId]?.owner === opponent
      );
    } else {
      return !section.neighbors.some(
        (nId) => gameState.sections[nId]?.owner === currentPlayer
      );
    }
  };

  const polygonToPath = (polygon: { x: number; y: number }[]) =>
    polygon.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const getSectionLabel = (sectionId: number) => {
    const section = gameState.sections[sectionId];

    if (section?.owner) {
      return `Section ${sectionId + 1}, colored by Player ${section.owner}`;
    }

    if (gameState.status !== 'playing') {
      return `Section ${sectionId + 1}, uncolored`;
    }

    if (!showPossibleMoves) {
      return `Section ${sectionId + 1}, uncolored`;
    }

    return isClickable(sectionId)
      ? `Section ${sectionId + 1}, available`
      : `Section ${sectionId + 1}, unavailable`;
  };

  const getSectionClassName = (isOwned: boolean, clickable: boolean) => {
    if (isOwned) return '';
    if (gameState.status !== 'playing') return '';

    if (showPossibleMoves) {
      return clickable
        ? `cursor-pointer transition-all duration-150 ${HOVER_BRIGHTNESS_CLASS}`
        : 'opacity-40';
    }

    return `cursor-pointer transition-all duration-150 ${HOVER_BRIGHTNESS_CLASS}`;
  };

  const showSetupOverlay = gameState.status === 'setup';

  return (
    <div className="relative" role="grid" aria-label="Stained glass game board">
      <svg
        viewBox={`-4 -4 ${layout.width + 8} ${layout.height + 8}`}
        className="w-full h-auto"
        style={{ maxHeight: '70vh' }}
      >
        {/* Background fill for window */}
        <defs>
          <clipPath id="window-clip">
            <path d={layout.outlinePath} />
          </clipPath>
        </defs>

        {/* Window background */}
        <path
          d={layout.outlinePath}
          fill="rgba(245, 245, 245, 0.6)"
          stroke="none"
        />

        {/* Section polygons (clipped to window) */}
        <g clipPath="url(#window-clip)">
          {layout.sections.map((layoutSection) => {
            const clickable = isClickable(layoutSection.id);
            const section = gameState.sections[layoutSection.id];
            const isOwned = section?.owner !== null;

            return (
              <g key={layoutSection.id}>
                <path
                  d={polygonToPath(layoutSection.polygon)}
                  fill={getSectionFill(layoutSection.id)}
                  stroke={getSectionStroke(layoutSection.id)}
                  strokeWidth={1.5}
                  role="gridcell"
                  aria-label={getSectionLabel(layoutSection.id)}
                  className={getSectionClassName(isOwned, clickable)}
                  style={
                    clickable && showPossibleMoves
                      ? { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }
                      : undefined
                  }
                  tabIndex={clickable ? 0 : undefined}
                  onClick={() => clickable && onSectionClick(layoutSection.id)}
                  onKeyDown={(e) => {
                    if (clickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      onSectionClick(layoutSection.id);
                    }
                  }}
                />
                {/* Player label */}
                {isOwned && (
                  <text
                    x={layoutSection.center.x}
                    y={layoutSection.center.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="bold"
                    fill="rgba(0,0,0,0.45)"
                    pointerEvents="none"
                  >
                    P{section?.owner}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Window frame (drawn on top) */}
        <path
          d={layout.outlinePath}
          fill="none"
          stroke="rgba(60, 50, 40, 0.7)"
          strokeWidth={5}
          strokeLinejoin="round"
        />

        {/* Leading lines (decorative dividers drawn over polygons) */}
        <g clipPath="url(#window-clip)" opacity={0.25} pointerEvents="none">
          {/* Vertical center line */}
          <line
            x1={layout.width / 2}
            y1={0}
            x2={layout.width / 2}
            y2={layout.height}
            stroke="rgba(60, 50, 40, 0.5)"
            strokeWidth={2}
          />
          {/* Horizontal lines */}
          <line
            x1={0}
            y1={layout.height * 0.4}
            x2={layout.width}
            y2={layout.height * 0.4}
            stroke="rgba(60, 50, 40, 0.5)"
            strokeWidth={2}
          />
          <line
            x1={0}
            y1={layout.height * 0.7}
            x2={layout.width}
            y2={layout.height * 0.7}
            stroke="rgba(60, 50, 40, 0.5)"
            strokeWidth={2}
          />
        </g>
      </svg>

      {/* Setup overlay */}
      {showSetupOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-10 rounded-xl">
          <div className="text-center p-6">
            <p className="text-lg font-semibold text-foreground/80">
              Choose a mode and click Start Game
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
