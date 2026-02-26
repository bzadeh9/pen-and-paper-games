'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MazeGameEngine } from '@/lib/games/maze-game/engine';
import type { MazeGameState, Position, Gate, Direction, Player } from '@/lib/games/maze-game/types';

interface GameBoardProps {
  onGameEnd?: (totalMoves: number) => void;
}

const WALL_SIZE = 8;

// Per-gate colour scheme
const GATE_COLORS = [
  { room: '#d9b3ff', passage: '#b366ff,#d9b3ff' },
  { room: '#80e5d0', passage: '#33ccaa,#80e5d0' },
  { room: '#ffb3c6', passage: '#ff6699,#ffb3c6' },
];

type MazeSize = 'small' | 'medium' | 'large';
const MAZE_SIZES: Record<MazeSize, { rows: number; cols: number; cell: number }> = {
  small: { rows: 5, cols: 5, cell: 56 },
  medium: { rows: 7, cols: 7, cell: 48 },
  large: { rows: 9, cols: 9, cell: 40 },
};

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

const DIR_DELTA: Record<Direction, { dr: number; dc: number }> = {
  north: { dr: -1, dc: 0 },
  south: { dr: 1, dc: 0 },
  east: { dr: 0, dc: 1 },
  west: { dr: 0, dc: -1 },
};

function computeValidPositions(
  player: Player,
  state: MazeGameState,
  validDirs: Direction[]
): Set<string> {
  const cur = state.players[player];
  return new Set(
    validDirs.map((dir) => {
      const { dr, dc } = DIR_DELTA[dir];
      return posKey({ row: cur.row + dr, col: cur.col + dc });
    })
  );
}

interface DPadProps {
  label: string;
  playerColor: string;
  validDirs: Direction[];
  onMove: (dir: Direction) => void;
  disabled: boolean;
}

function DPad({ label, playerColor, validDirs, onMove, disabled }: DPadProps) {
  const btn = (dir: Direction, symbol: string, ariaLabel: string) => {
    const active = !disabled && validDirs.includes(dir);
    return (
      <button
        onClick={() => !disabled && onMove(dir)}
        aria-label={ariaLabel}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          border: `2px solid ${active ? playerColor : 'rgba(0,0,0,0.12)'}`,
          background: active ? `${playerColor}33` : 'rgba(0,0,0,0.04)',
          cursor: active ? 'pointer' : 'default',
          opacity: active ? 1 : 0.35,
          fontSize: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.1s',
        }}
      >
        {symbol}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs font-semibold text-center" style={{ color: playerColor }}>
        {label}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: 4 }}>
        <span />
        {btn('north', '▲', 'Move up')}
        <span />
        {btn('west', '◄', 'Move left')}
        {btn('south', '▼', 'Move down')}
        {btn('east', '►', 'Move right')}
      </div>
    </div>
  );
}

export function GameBoard({ onGameEnd }: GameBoardProps) {
  const [mazeSize, setMazeSize] = useState<MazeSize>('medium');
  const sizeConfig = MAZE_SIZES[mazeSize];
  const CELL_SIZE = sizeConfig.cell;

  const [engineKey, setEngineKey] = useState(0);
  const engine = useMemo(
    () => new MazeGameEngine(sizeConfig.rows, sizeConfig.cols),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [engineKey, mazeSize]
  );
  const [gameState, setGameState] = useState<MazeGameState>(() => engine.getState());

  // Sync state when engine changes
  useEffect(() => {
    setGameState(engine.getState());
  }, [engine]);

  const p1ValidDirs = useMemo(
    () => (gameState.status === 'playing' ? engine.getValidDirectionsForPlayer(1) : []),
    [engine, gameState]
  );
  const p2ValidDirs = useMemo(
    () => (gameState.status === 'playing' ? engine.getValidDirectionsForPlayer(2) : []),
    [engine, gameState]
  );
  const p1ValidKeys = useMemo(
    () => computeValidPositions(1, gameState, p1ValidDirs),
    [gameState, p1ValidDirs]
  );
  const p2ValidKeys = useMemo(
    () => computeValidPositions(2, gameState, p2ValidDirs),
    [gameState, p2ValidDirs]
  );

  const handleMove = useCallback(
    (player: Player, dir: Direction) => {
      if (engine.movePlayer(player, dir)) {
        const newState = engine.getState();
        setGameState(newState);
        if (newState.status === 'ended') {
          onGameEnd?.(newState.moveHistory.length);
        }
      }
    },
    [engine, onGameEnd]
  );

  // Keyboard handler — registered once, reads engine state directly to avoid staleness
  useEffect(() => {
    const p1Map: Record<string, Direction> = {
      w: 'north', s: 'south', a: 'west', d: 'east',
    };
    const p2Map: Record<string, Direction> = {
      ArrowUp: 'north', ArrowDown: 'south', ArrowLeft: 'west', ArrowRight: 'east',
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const currentState = engine.getState();
      if (currentState.status !== 'playing') return;

      // Prevent arrow keys from scrolling the page. WASD doesn't scroll.
      if (p2Map[e.key]) e.preventDefault();

      const p1Dir = p1Map[e.key.toLowerCase()];
      const p2Dir = p2Map[e.key];

      if (p1Dir && engine.movePlayer(1, p1Dir)) {
        const ns = engine.getState();
        setGameState(ns);
        if (ns.status === 'ended') onGameEnd?.(ns.moveHistory.length);
      } else if (p2Dir && engine.movePlayer(2, p2Dir)) {
        const ns = engine.getState();
        setGameState(ns);
        if (ns.status === 'ended') onGameEnd?.(ns.moveHistory.length);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [engine, onGameEnd]);

  const handleReset = useCallback(() => {
    setEngineKey((k) => k + 1);
  }, []);

  const handleSizeChange = useCallback((size: MazeSize) => {
    setMazeSize(size);
    setEngineKey((k) => k + 1);
  }, []);

  const { rows, cols, passages, gates, decoyKeys, players, status, startPos, endPos, reachedEnd } =
    gameState;

  const p1Pos = players[1];
  const p2Pos = players[2];

  // Build lookup maps for gate elements
  const gateRoomAKeys = useMemo(() => new Set(gates.map((g) => posKey(g.roomA))), [gates]);
  const gateRoomBKeys = useMemo(() => new Set(gates.map((g) => posKey(g.roomB))), [gates]);
  const keyAKeys = useMemo(() => new Set(gates.map((g) => posKey(g.keyA))), [gates]);
  const keyBKeys = useMemo(() => new Set(gates.map((g) => posKey(g.keyB))), [gates]);
  const decoyKeySet = useMemo(() => new Set(decoyKeys.map((k) => posKey(k))), [decoyKeys]);
  const gateByKey = useMemo(() => {
    const m = new Map<string, Gate>();
    for (const g of gates) {
      m.set(posKey(g.roomA), g);
      m.set(posKey(g.roomB), g);
      m.set(posKey(g.keyA), g);
      m.set(posKey(g.keyB), g);
    }
    return m;
  }, [gates]);

  const boardWidth = cols * CELL_SIZE + (cols - 1) * WALL_SIZE;
  const boardHeight = rows * CELL_SIZE + (rows - 1) * WALL_SIZE;

  const getCellStyle = (row: number, col: number): React.CSSProperties => {
    const key = posKey({ row, col });
    const isP1 = posEq(p1Pos, { row, col });
    const isP2 = posEq(p2Pos, { row, col });
    const isStart = posEq(startPos, { row, col });
    const isEnd = posEq(endPos, { row, col });
    const isRoomA = gateRoomAKeys.has(key);
    const isRoomB = gateRoomBKeys.has(key);
    const isP1Valid = p1ValidKeys.has(key);
    const isP2Valid = p2ValidKeys.has(key);
    const gate = gateByKey.get(key);
    const gc = gate ? GATE_COLORS[gate.id % GATE_COLORS.length] : null;

    let bg = '#f8e5e5';
    if (isStart) bg = '#d1fae5';
    if (isEnd) bg = '#fef3c7';
    // Gate rooms are very obvious - prominent color
    if ((isRoomA || isRoomB) && gc) bg = gc.room;
    // Valid-move highlights (overlaid on top of cell type)
    if (isP1Valid && !isP2Valid) bg = '#ffd6e0';
    if (!isP1Valid && isP2Valid) bg = '#e8d8f8';
    if (isP1Valid && isP2Valid) bg = '#f0d0ec';
    // Players always on top
    if (isP1 && !isP2) bg = '#ffb3c1';
    if (!isP1 && isP2) bg = '#c9a0dc';
    if (isP1 && isP2) bg = '#e0a0cc';

    // Gate rooms get a thick prominent border
    const isGateRoom = isRoomA || isRoomB;
    const borderWidth = isGateRoom ? 3 : 2;
    const borderColor = isGateRoom && gc
      ? gc.room
      : isP1Valid && isP2Valid
      ? '#d090d0'
      : isP1Valid
      ? '#ffb3c1'
      : isP2Valid
      ? '#c9a0dc'
      : 'transparent';

    return {
      position: 'absolute',
      left: col * (CELL_SIZE + WALL_SIZE),
      top: row * (CELL_SIZE + WALL_SIZE),
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 8,
      backgroundColor: bg,
      border: `${borderWidth}px solid ${borderColor}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: CELL_SIZE >= 48 ? 18 : 14,
      transition: 'background-color 0.12s',
      boxSizing: 'border-box',
      zIndex: 1,
      userSelect: 'none',
    };
  };

  const getCellContent = (row: number, col: number): React.ReactNode => {
    const key = posKey({ row, col });
    const isP1 = posEq(p1Pos, { row, col });
    const isP2 = posEq(p2Pos, { row, col });
    const isEnd = posEq(endPos, { row, col });
    const isStart = posEq(startPos, { row, col });
    const isKeyA = keyAKeys.has(key);
    const isKeyB = keyBKeys.has(key);
    const isRoomA = gateRoomAKeys.has(key);
    const isRoomB = gateRoomBKeys.has(key);
    const isDecoy = decoyKeySet.has(key);

    if (isP1 && isP2) return '👦👧';
    if (isP1) return '👦';
    if (isP2) return '👧';
    if (isEnd) return '🐝🐝';
    if (isStart) return '🏠';
    // Gate rooms are obvious — show a lock
    if (isRoomA || isRoomB) return '🔒';
    // Real keys — show key emoji, no number (players must figure out which gate)
    if (isKeyA || isKeyB) return '🔑';
    // Decoy keys — same appearance as real keys
    if (isDecoy) return '🔑';
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Size selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground/60">Size:</span>
        {(['small', 'medium', 'large'] as MazeSize[]).map((size) => (
          <button
            key={size}
            onClick={() => handleSizeChange(size)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              mazeSize === size
                ? 'border border-dusty-mauve bg-dusty-mauve/20 text-dusty-mauve'
                : 'border border-foreground/20 bg-foreground/5 text-foreground/60 hover:bg-foreground/10'
            }`}
          >
            {size === 'small' ? '5×5' : size === 'medium' ? '7×7' : '9×9'}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="rounded-lg border border-foreground/20 bg-background px-4 py-2 text-center text-sm font-medium">
        {status === 'ended' ? (
          <span className="text-cherry-blossom">
            🎉 Both found the bees! Amazing teamwork!
          </span>
        ) : (
          <span className="text-foreground/70">
            {reachedEnd.length === 1 && (
              <>{reachedEnd[0] === 1 ? '👦' : '👧'} is waiting at the bees! </>
            )}
            Move simultaneously — 👦&nbsp;WASD &nbsp;|&nbsp; 👧&nbsp;↑↓←→
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
        }}
      >
        {/* Cells */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => (
            <div
              key={`${row},${col}`}
              style={getCellStyle(row, col)}
              title={getCellTitle(posKey({ row, col }), gateByKey, decoyKeySet, posKey(startPos), posKey(endPos))}
            >
              {getCellContent(row, col)}
            </div>
          ))
        )}

        {/* Normal passage gaps */}
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: cols }, (_, col) => {
            const pass = passages[row][col];
            const elements: React.ReactNode[] = [];

            if (pass.east && col < cols - 1) {
              elements.push(
                <div
                  key={`pe-${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: col * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                    top: row * (CELL_SIZE + WALL_SIZE) + 4,
                    width: WALL_SIZE,
                    height: CELL_SIZE - 8,
                    backgroundColor: '#f8e5e5',
                    borderRadius: 2,
                    zIndex: 0,
                  }}
                />
              );
            }
            if (pass.south && row < rows - 1) {
              elements.push(
                <div
                  key={`ps-${row}-${col}`}
                  style={{
                    position: 'absolute',
                    left: col * (CELL_SIZE + WALL_SIZE) + 4,
                    top: row * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                    width: CELL_SIZE - 8,
                    height: WALL_SIZE,
                    backgroundColor: '#f8e5e5',
                    borderRadius: 2,
                    zIndex: 0,
                  }}
                />
              );
            }
            return elements;
          })
        )}

        {/* Gate passage overlays (one striped gap per gate) */}
        {gates.map((gate) => {
          const { roomA, roomB } = gate;
          const dr = roomB.row - roomA.row;
          const dc = roomB.col - roomA.col;
          if (Math.abs(dr) + Math.abs(dc) !== 1) return null;
          const colors = GATE_COLORS[gate.id % GATE_COLORS.length];
          const [colorA, colorB] = colors.passage.split(',');
          const gradient = `repeating-linear-gradient(45deg, ${colorA}, ${colorA} 3px, ${colorB} 3px, ${colorB} 6px)`;

          if (dc !== 0) {
            const leftRoom = dc > 0 ? roomA : roomB;
            return (
              <div
                key={`gate-gap-${gate.id}`}
                style={{
                  position: 'absolute',
                  left: leftRoom.col * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                  top: leftRoom.row * (CELL_SIZE + WALL_SIZE) + 2,
                  width: WALL_SIZE,
                  height: CELL_SIZE - 4,
                  background: gradient,
                  borderRadius: 2,
                  zIndex: 2,
                }}
              />
            );
          } else {
            const topRoom = dr > 0 ? roomA : roomB;
            return (
              <div
                key={`gate-gap-${gate.id}`}
                style={{
                  position: 'absolute',
                  left: topRoom.col * (CELL_SIZE + WALL_SIZE) + 2,
                  top: topRoom.row * (CELL_SIZE + WALL_SIZE) + CELL_SIZE,
                  width: CELL_SIZE - 4,
                  height: WALL_SIZE,
                  background: gradient,
                  borderRadius: 2,
                  zIndex: 2,
                }}
              />
            );
          }
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-foreground/70">
        <span>👦 Boy (WASD)</span>
        <span>👧 Girl (↑↓←→)</span>
        <span>🐝🐝 Find the bees!</span>
        <span>🔒 Locked gate</span>
        <span>🔑 Key (some are decoys!)</span>
      </div>

      {/* D-pads for touch / mouse */}
      <div className="flex w-full max-w-sm justify-between px-2">
        <DPad
          label="👦 Boy (WASD)"
          playerColor="#ffb3c1"
          validDirs={p1ValidDirs}
          onMove={(dir) => handleMove(1, dir)}
          disabled={status !== 'playing'}
        />
        <DPad
          label="👧 Girl (↑↓←→)"
          playerColor="#c9a0dc"
          validDirs={p2ValidDirs}
          onMove={(dir) => handleMove(2, dir)}
          disabled={status !== 'playing'}
        />
      </div>

      {status === 'ended' && (
        <button
          onClick={handleReset}
          className="rounded-lg border border-cherry-blossom bg-cherry-blossom/10 px-6 py-2 text-sm font-medium text-cherry-blossom transition-colors hover:bg-cherry-blossom/20"
        >
          Play Again
        </button>
      )}
      {status === 'playing' && (
        <button
          onClick={handleReset}
          className="rounded-lg border border-foreground/20 bg-foreground/5 px-4 py-1.5 text-xs font-medium text-foreground/60 transition-colors hover:bg-foreground/10"
        >
          ↺ Restart
        </button>
      )}
    </div>
  );
}

function getCellTitle(
  key: string,
  gateByKey: Map<string, Gate>,
  decoyKeySet: Set<string>,
  startKey: string,
  endKey: string
): string {
  if (key === startKey) return 'Start';
  if (key === endKey) return 'Find the bees here!';
  if (decoyKeySet.has(key)) return 'A key — but does it open anything?';
  const gate = gateByKey.get(key);
  if (!gate) return '';
  if (key === posKey(gate.roomA) || key === posKey(gate.roomB))
    return 'Locked gate — find the right key!';
  if (key === posKey(gate.keyA) || key === posKey(gate.keyB))
    return 'A key — stand here so your partner can cross a gate';
  return '';
}
