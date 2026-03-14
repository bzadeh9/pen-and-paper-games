import type { Player, GameStatus } from '@/lib/games/row-call/types';

interface GameControlsProps {
  onReset: () => void;
  winner: Player | null;
  isGameEnded: boolean;
  gameStatus: GameStatus;
}

export function GameControls({
  onReset,
  winner,
  isGameEnded,
  gameStatus,
}: GameControlsProps) {
  const winnerLabel = winner === 'player1' ? 'Player 1' : 'Player 2';
  const winnerEmoji = winner === 'player1' ? '🌸' : '💜';

  return (
    <div className="space-y-4">
      {/* Win/Draw Message */}
      {isGameEnded && (
        <div className="rounded-lg bg-powder-blush/10 p-4 text-center border border-powder-blush/20">
          {winner ? (
            <>
              <p className="text-xl font-semibold">
                {winnerEmoji} {winnerLabel} Wins!
              </p>
              <p className="mt-2 text-sm text-foreground/60">
                Three in a row achieved!
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold">🤝 Draw!</p>
              <p className="mt-2 text-sm text-foreground/60">
                The board is full with no winner.
              </p>
            </>
          )}
        </div>
      )}

      {/* Reset Button */}
      {gameStatus !== 'playing' || isGameEnded ? (
        <button
          onClick={onReset}
          className="w-full rounded-lg bg-powder-blush px-6 py-3 font-semibold text-ink-black transition-all hover:bg-powder-blush/80 hover:scale-105"
        >
          {isGameEnded ? 'Play Again' : 'Reset Game'}
        </button>
      ) : (
        <button
          onClick={onReset}
          className="w-full rounded-lg bg-foreground/10 px-6 py-3 font-semibold transition-all hover:bg-foreground/20 hover:scale-105"
        >
          Reset Game
        </button>
      )}
    </div>
  );
}
