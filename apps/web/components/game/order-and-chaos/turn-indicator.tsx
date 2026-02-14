import type { Player, PieceColor } from '@/lib/games/order-and-chaos/types';

interface TurnIndicatorProps {
  currentPlayer: Player;
  selectedColor: PieceColor | null;
  onColorSelect: (color: PieceColor) => void;
  isGameEnded: boolean;
  isSetup: boolean;
}

export function TurnIndicator({
  currentPlayer,
  selectedColor,
  onColorSelect,
  isGameEnded,
  isSetup,
}: TurnIndicatorProps) {
  const playerName = currentPlayer === 'order' ? 'Order' : 'Chaos';

  return (
    <div className="rounded-lg border border-foreground/20 bg-background p-6">
      {isSetup ? (
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-center">
            Order and Chaos
          </h2>
          <p className="text-sm text-foreground/60 text-center">
            Select display mode and click Start Game
          </p>
        </div>
      ) : (
        <>
          <h2 className="mb-4 text-2xl font-semibold">
            Current Turn: <span className="text-cherry-blossom">{playerName}</span>
          </h2>

          {!isGameEnded && (
            <div className="space-y-3">
              <p className="text-sm text-foreground/60">Select a color to place:</p>
              <div className="flex gap-4">
                <button
                  onClick={() => onColorSelect('cherry-blossom')}
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all
                    ${
                      selectedColor === 'cherry-blossom'
                        ? 'border-cherry-blossom ring-2 ring-cherry-blossom ring-offset-2 scale-110'
                        : 'border-foreground/20 hover:border-cherry-blossom hover:scale-105'
                    }
                  `}
                  aria-label="Select cherry blossom color"
                >
                  <div className="h-10 w-10 rounded-full bg-cherry-blossom" />
                </button>
                <button
                  onClick={() => onColorSelect('dusty-mauve')}
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all
                    ${
                      selectedColor === 'dusty-mauve'
                        ? 'border-dusty-mauve ring-2 ring-dusty-mauve ring-offset-2 scale-110'
                        : 'border-foreground/20 hover:border-dusty-mauve hover:scale-105'
                    }
                  `}
                  aria-label="Select dusty mauve color"
                >
                  <div className="h-10 w-10 rounded-full bg-dusty-mauve" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
