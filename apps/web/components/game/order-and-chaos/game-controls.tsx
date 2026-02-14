import type { Player } from '@/lib/games/order-and-chaos/types';

interface GameControlsProps {
  onReset: () => void;
  winner: Player | null;
  isGameEnded: boolean;
}

export function GameControls({
  onReset,
  winner,
  isGameEnded,
}: GameControlsProps) {
  return (
    <div className="rounded-lg border border-foreground/20 bg-background p-6">
      {isGameEnded && winner && (
        <div className="mb-4 rounded-lg bg-cherry-blossom/10 p-4 text-center">
          <p className="text-xl font-semibold">
            {winner === 'order' ? '🎉 Order Wins!' : '🌪️ Chaos Wins!'}
          </p>
          <p className="mt-2 text-sm text-foreground/60">
            {winner === 'order'
              ? 'Five in a row achieved!'
              : 'Board filled without five in a row!'}
          </p>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full rounded-lg bg-cherry-blossom px-6 py-3 font-semibold text-ink-black transition-all hover:bg-cherry-blossom/80 hover:scale-105"
      >
        {isGameEnded ? 'Play Again' : 'Reset Game'}
      </button>
    </div>
  );
}
