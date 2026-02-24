'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BeeGameEngine } from '@/lib/games/bee-game/engine';
import type { Position, Player, VirtueZone } from '@/lib/games/bee-game/types';
import { GRID_SIZE } from '@/lib/games/bee-game/types';

interface GameBoardProps {
  onGameEnd?: (winner: Player) => void;
}

function BeeToken({ player, role }: { player: Player; role: string }) {
  const isAbbee = player === 1;
  return (
    <div
      className="flex items-center justify-center"
      aria-label={`${isAbbee ? 'Abbee' : 'Dot'} (${role})`}
    >
      <div
        className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border-2 ${
          isAbbee
            ? 'border-bee-amber bg-bee-amber/30'
            : 'border-bee-sky bg-bee-sky/30'
        }`}
      >
        <span className="text-base md:text-lg" role="img" aria-label={isAbbee ? 'Abbee bee' : 'Dot bee'}>
          🐝
        </span>
      </div>
      <span
        className={`absolute -bottom-1 text-[8px] font-bold leading-none ${
          isAbbee ? 'text-bee-amber' : 'text-bee-sky'
        }`}
      >
        {isAbbee ? 'A' : 'D'}
      </span>
    </div>
  );
}

export function GameBoard({ onGameEnd }: GameBoardProps) {
  const engine = useMemo(() => new BeeGameEngine(), []);
  const [gameState, setGameState] = useState(() => engine.getState());
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [showPossibleMoves, setShowPossibleMoves] = useState(true);

  useEffect(() => {
    if (gameState.status === 'ended' && gameState.winner && onGameEnd) {
      onGameEnd(gameState.winner);
    }
  }, [gameState.status, gameState.winner, onGameEnd]);

  const handleCellClick = (pos: Position) => {
    if (gameState.status !== 'playing') return;
    if (engine.makeMove(pos)) {
      setGameState(engine.getState());
    }
  };

  const handleReset = () => {
    engine.reset();
    setGameState(engine.getState());
  };

  const validMoves = engine.getValidMoves();
  const isValidMove = (pos: Position) =>
    validMoves.some((m) => m.row === pos.row && m.col === pos.col);

  const getVirtueZoneAt = (
    pos: Position
  ): VirtueZone | undefined =>
    gameState.virtueZones.find(
      (z) =>
        !z.collected &&
        z.position.row === pos.row &&
        z.position.col === pos.col
    );

  const isHome = (pos: Position) =>
    gameState.home.row === pos.row &&
    gameState.home.col === pos.col;

  const getPlayerAt = (pos: Position): Player | null => {
    if (
      gameState.players[1].position.row === pos.row &&
      gameState.players[1].position.col === pos.col
    )
      return 1;
    if (
      gameState.players[2].position.row === pos.row &&
      gameState.players[2].position.col === pos.col
    )
      return 2;
    return null;
  };

  const currentPlayerState = gameState.players[gameState.currentPlayer];
  const currentPlayerName = gameState.currentPlayer === 1 ? 'Abbee' : 'Dot';

  return (
    <div className="flex flex-col items-center gap-6">
      {gameState.status === 'setup' && (
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold">
            Ready to play Abbee &amp; Dot?
          </p>
          {/* Role selection */}
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-foreground/70">Who starts as runner?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  engine.setStartingRunner(1);
                  setGameState(engine.getState());
                }}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                  gameState.startingRunner === 1
                    ? 'border-bee-amber bg-bee-amber/20 text-bee-amber'
                    : 'border-foreground/20 text-foreground/60 hover:border-foreground/40'
                }`}
                aria-pressed={gameState.startingRunner === 1}
              >
                🐝 Abbee (runner)
              </button>
              <button
                onClick={() => {
                  engine.setStartingRunner(2);
                  setGameState(engine.getState());
                }}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                  gameState.startingRunner === 2
                    ? 'border-bee-sky bg-bee-sky/20 text-bee-sky'
                    : 'border-foreground/20 text-foreground/60 hover:border-foreground/40'
                }`}
                aria-pressed={gameState.startingRunner === 2}
              >
                🐝 Dot (runner)
              </button>
            </div>
          </div>
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
          {gameState.justSwapped && (
            <div className="mb-3 rounded-lg border-2 border-bee-amber bg-bee-amber/10 px-4 py-3 animate-pulse" role="alert">
              <p className="text-base font-bold text-bee-amber">
                🔄 Roles Swapped!
              </p>
              <p className="text-sm text-foreground/70">
                {gameState.currentPlayer === 1 ? 'Abbee' : 'Dot'} is now the runner ·{' '}
                {gameState.currentPlayer === 1 ? 'Dot' : 'Abbee'} is now the chaser
              </p>
            </div>
          )}
          <p className="text-lg font-semibold">
            <span className={gameState.currentPlayer === 1 ? 'text-bee-amber' : 'text-bee-sky'}>
              {currentPlayerName}
            </span>
            &apos;s Turn ({currentPlayerState.role})
          </p>
          <p className="text-sm text-foreground/60">
            Move up to{' '}
            {currentPlayerState.role === 'runner' ? '2' : '3'} spaces
          </p>
        </div>
      )}

      {gameState.status === 'ended' && (
        <div className="text-center">
          <div className="mb-4 rounded-lg border-2 border-foreground/20 bg-background p-6">
            <p className="mb-2 text-2xl font-bold">Game Over!</p>
            <p className="text-lg">
              {gameState.winner === 1 ? 'Abbee' : 'Dot'} wins!
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

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground/70">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded-full border-2 border-bee-amber bg-bee-amber/30" />
          <span>Abbee</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded-full border-2 border-bee-sky bg-bee-sky/30" />
          <span>Dot</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded-full bg-cherry-blossom/40 border border-cherry-blossom" />
          <span>Virtue Zone</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded-full bg-dusty-mauve/40 border border-dusty-mauve" />
          <span>Home</span>
        </div>
      </div>

      {/* Collected virtues */}
      <div className="flex flex-wrap gap-4 text-sm">
        {([1, 2] as Player[]).map((p) => (
          <div key={p} className="text-center">
            <span className={`font-semibold ${p === 1 ? 'text-bee-amber' : 'text-bee-sky'}`}>
              {p === 1 ? 'Abbee' : 'Dot'}:
            </span>
            {gameState.players[p].collectedVirtues.length > 0 ? (
              <span className="ml-1 text-foreground/70">
                {gameState.players[p].collectedVirtues.join(', ')}
              </span>
            ) : (
              <span className="ml-1 text-foreground/50">No virtues yet</span>
            )}
          </div>
        ))}
      </div>

      {/* Game board */}
      <div className="w-full max-w-full overflow-x-auto flex justify-center">
        <div
          className="grid gap-0 border-2 border-foreground/40"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(480px, 100vw - 2rem)',
            aspectRatio: '1 / 1',
          }}
          role="grid"
          aria-label="Bee game board"
        >
          {Array.from({ length: GRID_SIZE }).map((_, row) =>
            Array.from({ length: GRID_SIZE }).map((_, col) => {
              const pos: Position = { row, col };
              const valid = isValidMove(pos);
              const isHovered =
                hoveredCell?.row === row && hoveredCell?.col === col;
              const virtueZone = getVirtueZoneAt(pos);
              const isHomeTile = isHome(pos);
              const playerAt = getPlayerAt(pos);
              const isRunnerSafe =
                gameState.runnerSafePosition !== null &&
                gameState.runnerSafePosition.row === row &&
                gameState.runnerSafePosition.col === col;

              return (
                <div
                  key={`${row}-${col}`}
                  className={`relative flex items-center justify-center border border-foreground/20 transition-all ${
                    virtueZone || isRunnerSafe
                      ? 'bg-cherry-blossom/20'
                      : isHomeTile
                        ? 'bg-dusty-mauve/20'
                        : valid && showPossibleMoves && gameState.status === 'playing'
                          ? 'bg-powder-petal/50 hover:bg-cherry-blossom/30'
                          : 'bg-background'
                  } ${valid && gameState.status === 'playing' ? 'cursor-pointer' : 'cursor-default'} ${
                    isHovered && valid ? 'ring-2 ring-cherry-blossom' : ''
                  }`}
                  style={{ minWidth: '40px', minHeight: '40px' }}
                  onClick={() => handleCellClick(pos)}
                  onMouseEnter={() => setHoveredCell(pos)}
                  onMouseLeave={() => setHoveredCell(null)}
                  role="gridcell"
                  aria-label={`Cell ${row + 1},${col + 1}${virtueZone ? ` - ${virtueZone.virtue} virtue zone` : ''}${isRunnerSafe ? ' - safe zone' : ''}${isHomeTile ? ' - Home' : ''}${playerAt ? ` - ${playerAt === 1 ? 'Abbee' : 'Dot'}` : ''}`}
                >
                  {(virtueZone || isRunnerSafe) && !playerAt && (
                    <span className="text-[9px] md:text-[10px] font-medium text-cherry-blossom leading-tight text-center select-none">
                      {virtueZone ? virtueZone.virtue : '🛡️'}
                    </span>
                  )}
                  {isHomeTile && !playerAt && (
                    <div className="flex flex-col items-center gap-0 leading-none">
                      <span className="text-sm select-none" aria-hidden="true">🏠</span>
                      <span className="text-[8px] font-medium text-dusty-mauve leading-tight text-center select-none">
                        Home
                      </span>
                    </div>
                  )}
                  {playerAt && (
                    <BeeToken
                      player={playerAt}
                      role={gameState.players[playerAt].role}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="text-center text-sm text-foreground/60">
        <div className="mb-4 flex items-center justify-center gap-4">
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
          {gameState.status === 'playing' && (
            <button
              onClick={handleReset}
              className="rounded-md border border-foreground/30 px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2"
              aria-label="Restart Game"
            >
              Restart
            </button>
          )}
        </div>
        <p>Runner moves up to 2 spaces · Chaser moves up to 3 spaces</p>
        <p className="mt-1">Collect virtues and reach Home to win!</p>
      </div>
    </div>
  );
}
