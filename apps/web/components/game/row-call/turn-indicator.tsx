import type { Player, TurnPhase, LineSelection } from '@/lib/games/row-call/types';

interface TurnIndicatorProps {
  activePlayer: Player;
  actingPlayer: Player;
  turnPhase: TurnPhase;
  selectedLine: LineSelection | null;
  isGameEnded: boolean;
  selectableLines: LineSelection[];
  onLineSelect: (selection: LineSelection) => void;
}

const COLUMN_LABELS = ['A', 'B', 'C', 'D'];

export function TurnIndicator({
  activePlayer,
  actingPlayer,
  turnPhase,
  selectedLine,
  isGameEnded,
  selectableLines,
  onLineSelect,
}: TurnIndicatorProps) {
  const activeLabel = activePlayer === 'player1' ? 'Player 1' : 'Player 2';
  const actingLabel = actingPlayer === 'player1' ? 'Player 1' : 'Player 2';
  const activeColor =
    activePlayer === 'player1' ? 'text-cherry-blossom' : 'text-dusty-mauve';

  const selectableRows = selectableLines.filter((l) => l.type === 'row');
  const selectableCols = selectableLines.filter((l) => l.type === 'column');

  return (
    <div className="rounded-lg border border-foreground/20 bg-background p-6">
      {isGameEnded ? (
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Game Over</h2>
        </div>
      ) : turnPhase === 'choose-line' ? (
        <div>
          <h2 className="mb-2 text-2xl font-semibold">
            <span className={activeColor}>{actingLabel}</span>&apos;s Turn
          </h2>
          <p className="mb-4 text-sm text-foreground/60">
            Choose a row or column for{' '}
            <span className={activeColor}>{activeLabel}</span>&apos;s dot to be
            placed in:
          </p>

          {/* Row buttons */}
          <div className="mb-3">
            <p className="mb-2 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Rows
            </p>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => {
                const isSelectable = selectableRows.some(
                  (l) => l.index === i
                );
                return (
                  <button
                    key={`row-${i}`}
                    onClick={() => onLineSelect({ type: 'row', index: i })}
                    disabled={!isSelectable}
                    className={`
                      h-10 w-10 rounded-lg border-2 font-semibold text-sm transition-all
                      ${
                        isSelectable
                          ? 'border-foreground/20 hover:border-cherry-blossom hover:scale-110 cursor-pointer hover:bg-cherry-blossom/10'
                          : 'border-foreground/10 text-foreground/30 cursor-not-allowed'
                      }
                    `}
                    aria-label={`Select row ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column buttons */}
          <div>
            <p className="mb-2 text-xs font-semibold text-foreground/40 uppercase tracking-wider">
              Columns
            </p>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => {
                const isSelectable = selectableCols.some(
                  (l) => l.index === i
                );
                return (
                  <button
                    key={`col-${i}`}
                    onClick={() =>
                      onLineSelect({ type: 'column', index: i })
                    }
                    disabled={!isSelectable}
                    className={`
                      h-10 w-10 rounded-lg border-2 font-semibold text-sm transition-all
                      ${
                        isSelectable
                          ? 'border-foreground/20 hover:border-cherry-blossom hover:scale-110 cursor-pointer hover:bg-cherry-blossom/10'
                          : 'border-foreground/10 text-foreground/30 cursor-not-allowed'
                      }
                    `}
                    aria-label={`Select column ${COLUMN_LABELS[i]}`}
                  >
                    {COLUMN_LABELS[i]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="mb-2 text-2xl font-semibold">
            <span className={activeColor}>{actingLabel}</span>&apos;s Turn
          </h2>
          <p className="text-sm text-foreground/60">
            Place{' '}
            <span className={activeColor}>{activeLabel}</span>&apos;s dot in{' '}
            {selectedLine?.type === 'row'
              ? `Row ${(selectedLine?.index ?? 0) + 1}`
              : `Column ${COLUMN_LABELS[selectedLine?.index ?? 0]}`}
            :
          </p>
          <p className="mt-2 text-xs text-foreground/40">
            Click a highlighted cell on the board
          </p>
        </div>
      )}
    </div>
  );
}
