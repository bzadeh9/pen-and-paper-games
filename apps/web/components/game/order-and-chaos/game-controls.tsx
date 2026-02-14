import type { Player, DisplayMode, GameStatus } from '@/lib/games/order-and-chaos/types';

interface GameControlsProps {
  onReset: () => void;
  onStart: () => void;
  winner: Player | null;
  isGameEnded: boolean;
  gameStatus: GameStatus;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

export function GameControls({
  onReset,
  onStart,
  winner,
  isGameEnded,
  gameStatus,
  displayMode,
  onDisplayModeChange,
}: GameControlsProps) {
  const isModeChangeable = gameStatus === 'setup' || gameStatus === 'ended';
  const isSetup = gameStatus === 'setup';

  return (
    <div className="space-y-4">
      {/* Display Mode Selection */}
      <div className="rounded-lg border border-foreground/20 bg-background p-4">
        <h3 className="mb-3 text-lg font-semibold">Display Mode</h3>
        <div className="space-y-2">
          <label htmlFor="mode-color" className="flex items-center gap-2 cursor-pointer">
            <input
              id="mode-color"
              type="radio"
              name="displayMode"
              value="color"
              checked={displayMode === 'color'}
              onChange={() => onDisplayModeChange('color')}
              disabled={!isModeChangeable}
              className="h-4 w-4"
            />
            <span className={`text-sm ${!isModeChangeable ? 'text-foreground/60' : ''}`}>
              <strong>Color Mode:</strong> Use colored pieces
            </span>
          </label>
          <label htmlFor="mode-symbol" className="flex items-center gap-2 cursor-pointer">
            <input
              id="mode-symbol"
              type="radio"
              name="displayMode"
              value="symbol"
              checked={displayMode === 'symbol'}
              onChange={() => onDisplayModeChange('symbol')}
              disabled={!isModeChangeable}
              className="h-4 w-4"
            />
            <span className={`text-sm ${!isModeChangeable ? 'text-foreground/60' : ''}`}>
              <strong>X and O Mode:</strong> Use X and O symbols
            </span>
          </label>
        </div>
        {gameStatus === 'playing' && (
          <p className="mt-2 text-xs text-foreground/60">
            Mode locked during game
          </p>
        )}
      </div>

      {/* Win/Reset Message */}
      {isGameEnded && winner && (
        <div className="rounded-lg bg-cherry-blossom/10 p-4 text-center border border-cherry-blossom/20">
          <p className="text-xl font-semibold">
            {winner === 'order' ? '🎉 Order Wins!' : '🌪️ Chaos Wins!'}
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            {winner === 'order'
              ? 'Five in a row achieved!'
              : 'No five-in-a-row possible!'}
          </p>
        </div>
      )}

      {/* Start/Reset Button */}
      <button
        onClick={isSetup ? onStart : onReset}
        className="w-full rounded-lg bg-cherry-blossom px-6 py-3 font-semibold text-ink-black transition-all hover:bg-cherry-blossom/80 hover:scale-105"
      >
        {isSetup ? 'Start Game' : isGameEnded ? 'Play Again' : 'Reset Game'}
      </button>
    </div>
  );
}
