'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { MazeGameEngine } from '@/lib/games/maze-game/engine';
import type { MazeGameState, Position } from '@/lib/games/maze-game/types';

interface GameBoardProps {
  onGameEnd?: (totalMoves: number) => void;
}

const CELL_SIZE = 48;
const WALL_SIZE = 8;

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function GameBoard({ onGameEnd }: GameBoardProps) {
  const engine = useMemo(() => new MazeGameEngine(7, 7), []);
  const [gameState, setGameState] = useState<MazeGameState>(() => engine.getState());

  const refresh = useCallback(() => setGameState(engine.getState()), [engine]);

  const validMoves = useMemo(() => {
    if (gameState.status !== 'playing') return [];
    return engine.getValidMoves();
  }, [engine, gameState]);

  const validMoveKeys = useMemo(
    () => new Set(validMoves.map(posKey)),
    [validMoves]
  );

  const handleCellClick = useCallback(
    (pos: Position) => {
      if (gameState.status !== 'playing') return;
      const moved = engine.makeMove(pos);
      if (moved) {
        const newState = engine.getState();
        setGameState(newState);
        if (newState.status === 'ended') {
          onGameEnd?.(newState.moveHistory.length);
        }
      }
    },
    [engine, gameState.status, onGameEnd]
  );

  const handleReset = useCallback(() => {
    engine.reset();
    refresh();
  }, [engine, refresh]);

  const { rows, cols, passages, bridges, players, currentPlayer, status, startPos, endPos, reachedEnd } = gameState;

  const p1Pos = players[1];
  const p2Pos = players[2];
  const bridgeRoomAKey = bridges[0] ? posKey(bridges[0].roomA) : '';
  const bridgeRoomBKey = bridges[0] ? posKey(bridges[0].roomB) : '';
  const leverAKey = bridges[0] ? posKey(bridges[0].leverA) : '';
  const leverBKey = bridges[0] ? posKey(bridges[0].leverB) : '';

  // Total board size in pixels
  const boardWidth = cols * CELL_SIZE + (cols - 1) * WALL_SIZE;
  const boardHeight = rows * CELL_SIZE + (rows - 1) * WALL_SIZE;

  const getCellStyle = (row: number, col: number): React.CSSProperties => {
    const key = `${row},${col}`;
    const isP1 = posEq(p1Pos, { row, col });
    const isP2 = posEq(p2Pos, { row, col });
    const isStart = posEq(startPos, { row, col });
    const isEnd = posEq(endPos, { row, col });
    const isValidMove = validMoveKeys.has(key);
    const isBridgeEntryA = key === bridgeRoomAKey;
    const isBridgeEntryB = key === bridgeRoomBKey;
    const isLeverA = key === leverAKey;
    const isLeverB = key === leverBKey;

    let bg = '#f8e5e5'; // default: powder-petal
    if (isStart) bg = '#d1fae5'; // green
    if (isEnd) bg = '#fef3c7'; // amber
    if (isBridgeEntryA || isBridgeEntryB) bg = '#e0d4f5'; // light purple
    if (isLeverA || isLeverB) bg = '#fde68a'; // yellow (lever)
    if (isValidMove) bg = '#ffb3c1'; // cherry-blossom highlight
    if (isP1 || isP2) bg = '#c9a0dc'; // dusty-mauve for player

    return {
      position: 'absolute',
      left: col * (CELL_SIZE + WALL_SIZE),
      top: row * (CELL_SIZE + WALL_SIZE),
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 8,
      backgroundColor: bg,
      cursor: isValidMove ? 'pointer' : 'default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      transition: 'background-color 0.15s',
      boxSizing: 'border-box',
      border: isValidMove ? '2px solid #ffb3c1' : '2px solid transparent',
      zIndex: 1,
      userSelect: 'none',
    };
  };

  const getCellContent = (row: number, col: number): string => {
    const isP1 = posEq(p1Pos, { row, col });
    const isP2 = posEq(p2Pos, { row, col });
    const isEnd = posEq(endPos, { row, col });
    const isStart = posEq(startPos, { row, col });
    const key = `${row},${col}`;
    const isLeverA = key === leverAKey;
    const isLeverB = key === leverBKey;
    const isBridgeA = key === bridgeRoomAKey;
    const isBridgeB = key === bridgeRoomBKey;

    if (isP1 && isP2) return '🐝🐝';
    if (isP1) return '🐝';
    if (isP2) return '🐝';
    if (isEnd) return '🌸';
    if (isStart && !isP1 && !isP2) return '🏠';
    if (isLeverA || isLeverB) return '🔧';
    if (isBridgeA || isBridgeB) return '🌉';
    return '';
  };

  const playerLabel = currentPlayer === 1 ? 'Abbee (🐝)' : 'Dot (🐝)';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status bar */}
      <div className="rounded-lg border border-foreground/20 bg-background px-4 py-2 text-center text-sm font-medium">
        {status === 'ended' ? (
          <span className="text-cherry-blossom">
            🎉 Both bees found the flowers! Well done!
          </span>
        ) : (
          <span>
            {playerLabel}&apos;s turn
            {reachedEnd.length === 1 && (
              <span className="ml-2 text-foreground/60">
                ({reachedEnd[0] === 1 ? 'Abbee' : 'Dot'} is waiting at the end!)
              </span>
            )}
          </span>
        )}
      </div>

      {/* Maze board */}
      <div
        style={{
          position: 'relative',
          width: boardWidth,
          height: boardHeight,
          backgroundColor: '#4a4a6a',
          borderRadius: 12,
          padding: 0,
        }}
      >
        {/* Render cells */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const key = `${row},${col}`;
            return (
              <div
                key={key}
                style={getCellStyle(row, col)}
                onClick={() => handleCellClick({ row, col })}
                title={getCellTitle(row, col, key, bridgeRoomAKey, bridgeRoomBKey, leverAKey, leverBKey, posKey(startPos), posKey(endPos))}
              >
                {getCellContent(row, col)}
              </div>
            );
          })
        )}

        {/* Render passage openings (passages are gaps in the walls) */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const pass = passages[row][col];
            const elements: React.ReactNode[] = [];
            const cellKey = posKey({ row, col });

            const isBridgePassage = (neighborKey: string) =>
              bridges[0] &&
              ((cellKey === bridgeRoomAKey && neighborKey === bridgeRoomBKey) ||
               (cellKey === bridgeRoomBKey && neighborKey === bridgeRoomAKey));

            // East passage
            if (pass.east && col < cols - 1) {
              const neighborKey = posKey({ row, col: col + 1 });
              elements.push(
                <div
                  key={`passage-e-${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: col * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                    top: row * (CELL_SIZE + WALL_SIZE) + 4,
                    width: WALL_SIZE,
                    height: CELL_SIZE - 8,
                    backgroundColor: isBridgePassage(neighborKey) ? '#c9a0dc' : '#f8e5e5',
                    borderRadius: 2,
                    zIndex: 0,
                  }}
                />
              );
            }

            // South passage
            if (pass.south && row < rows - 1) {
              const neighborKey = posKey({ row: row + 1, col });
              elements.push(
                <div
                  key={`passage-s-${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: col * (CELL_SIZE + WALL_SIZE) + 4,
                    top: row * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                    width: CELL_SIZE - 8,
                    height: WALL_SIZE,
                    backgroundColor: isBridgePassage(neighborKey) ? '#c9a0dc' : '#f8e5e5',
                    borderRadius: 2,
                    zIndex: 0,
                  }}
                />
              );
            }

            return elements;
          })
        )}

        {/* Highlight bridge crossing passage (when bridge exists) */}
        {bridges[0] && (() => {
          const { roomA, roomB } = bridges[0];
          const dr = roomB.row - roomA.row;
          const dc = roomB.col - roomA.col;
          // Only show if rooms are adjacent
          if (Math.abs(dr) + Math.abs(dc) !== 1) return null;

          const isHorizontal = dc !== 0;
          if (isHorizontal) {
            const leftRoom = dc > 0 ? roomA : roomB;
            return (
              <div
                key="bridge-passage"
                style={{
                  position: 'absolute',
                  left: leftRoom.col * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                  top: leftRoom.row * (CELL_SIZE + WALL_SIZE) + 2,
                  width: WALL_SIZE,
                  height: CELL_SIZE - 4,
                  background: 'repeating-linear-gradient(45deg, #c9a0dc, #c9a0dc 3px, #e0d4f5 3px, #e0d4f5 6px)',
                  borderRadius: 2,
                  zIndex: 2,
                }}
              />
            );
          } else {
            const topRoom = dr > 0 ? roomA : roomB;
            return (
              <div
                key="bridge-passage"
                style={{
                  position: 'absolute',
                  left: topRoom.col * (CELL_SIZE + WALL_SIZE) + 2,
                  top: topRoom.row * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                  width: CELL_SIZE - 4,
                  height: WALL_SIZE,
                  background: 'repeating-linear-gradient(45deg, #c9a0dc, #c9a0dc 3px, #e0d4f5 3px, #e0d4f5 6px)',
                  borderRadius: 2,
                  zIndex: 2,
                }}
              />
            );
          }
        })()}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-foreground/70">
        <span>🐝 Players</span>
        <span>🏠 Start</span>
        <span>🌸 Bees (goal)</span>
        <span>🌉 Bridge entry</span>
        <span>🔧 Lever</span>
        <span style={{ color: '#ffb3c1' }}>■</span>
        <span>Valid moves</span>
      </div>

      {status === 'ended' && (
        <button
          onClick={handleReset}
          className="rounded-lg border border-cherry-blossom bg-cherry-blossom/10 px-6 py-2 text-sm font-medium text-cherry-blossom transition-colors hover:bg-cherry-blossom/20"
        >
          Play Again
        </button>
      )}
    </div>
  );
}

function getCellTitle(
  row: number,
  col: number,
  key: string,
  bridgeRoomAKey: string,
  bridgeRoomBKey: string,
  leverAKey: string,
  leverBKey: string,
  startKey: string,
  endKey: string
): string {
  if (key === startKey) return 'Start';
  if (key === endKey) return 'Goal — bees are here!';
  if (key === bridgeRoomAKey) return 'Bridge entry (side A)';
  if (key === bridgeRoomBKey) return 'Bridge entry (side B)';
  if (key === leverAKey) return 'Lever A — stand here so the other player can cross the bridge';
  if (key === leverBKey) return 'Lever B — stand here so the other player can cross the bridge';
  return `Room (${row}, ${col})`;
}
