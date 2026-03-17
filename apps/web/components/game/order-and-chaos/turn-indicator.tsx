import type {
  Player,
  PieceColor,
  DisplayMode,
} from '@/lib/games/order-and-chaos/types';

interface TurnIndicatorProps {
  currentPlayer: Player;
  selectedColor: PieceColor | null;
  onColorSelect: (color: PieceColor) => void;
  isGameEnded: boolean;
  isSetup: boolean;
  displayMode: DisplayMode;
}

export function TurnIndicator({
  currentPlayer,
  selectedColor,
  onColorSelect,
  isGameEnded,
  isSetup,
  displayMode,
}: TurnIndicatorProps) {
  const playerName = currentPlayer === 'order' ? 'Order' : 'Chaos';

  const renderPiecePreview = (color: PieceColor) => {
    if (displayMode === 'symbol') {
      const symbol = color === 'powder-blush' ? 'X' : 'O';
      const colorClass =
        color === 'powder-blush' ? 'text-powder-blush' : 'text-periwinkle';
      return (
        <span className={`text-3xl font-bold ${colorClass}`}>{symbol}</span>
      );
    }
    const bgClass =
      color === 'powder-blush' ? 'bg-powder-blush' : 'bg-periwinkle';
    return <div className={`h-10 w-10 rounded-full ${bgClass}`} />;
  };

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
            Current Turn:{' '}
            <span className="text-powder-blush">{playerName}</span>
          </h2>

          {!isGameEnded && (
            <div className="space-y-3">
              <p className="text-sm text-foreground/60">
                {displayMode === 'symbol'
                  ? 'Select X or O to place:'
                  : 'Select a color to place:'}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => onColorSelect('powder-blush')}
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all
                    ${
                      selectedColor === 'powder-blush'
                        ? 'border-powder-blush ring-2 ring-powder-blush ring-offset-2 scale-110'
                        : 'border-foreground/20 hover:border-powder-blush hover:scale-105'
                    }
                  `}
                  aria-label={
                    displayMode === 'symbol'
                      ? 'Select X'
                      : 'Select powder blush color'
                  }
                >
                  {renderPiecePreview('powder-blush')}
                </button>
                <button
                  onClick={() => onColorSelect('periwinkle')}
                  className={`
                    flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all
                    ${
                      selectedColor === 'periwinkle'
                        ? 'border-periwinkle ring-2 ring-periwinkle ring-offset-2 scale-110'
                        : 'border-foreground/20 hover:border-periwinkle hover:scale-105'
                    }
                  `}
                  aria-label={
                    displayMode === 'symbol'
                      ? 'Select O'
                      : 'Select periwinkle color'
                  }
                >
                  {renderPiecePreview('periwinkle')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
