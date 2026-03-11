import type { Cell, LineSelection } from '@/lib/games/row-call/types';
import { CellComponent } from './cell';

interface BoardProps {
  board: Cell[][];
  onCellClick: (row: number, col: number) => void;
  isGameEnded: boolean;
  selectedLine: LineSelection | null;
  validPlacements: Array<{ row: number; col: number }>;
}

const COLUMN_LABELS = ['A', 'B', 'C', 'D'];

export function Board({
  board,
  onCellClick,
  isGameEnded,
  selectedLine,
  validPlacements,
}: BoardProps) {
  const isValidPlacement = (row: number, col: number) => {
    return validPlacements.some((p) => p.row === row && p.col === col);
  };

  const isInSelectedLine = (row: number, col: number) => {
    if (!selectedLine) return false;
    if (selectedLine.type === 'row') return row === selectedLine.index;
    return col === selectedLine.index;
  };

  return (
    <div className="inline-block rounded-lg border-2 border-foreground/20 bg-background p-4 shadow-lg">
      {/* Column labels */}
      <div className="grid grid-cols-4 gap-2 mb-2 ml-8">
        {COLUMN_LABELS.map((label) => (
          <div
            key={label}
            className="h-6 w-14 md:w-16 flex items-center justify-center text-sm font-semibold text-foreground/60"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Board with row labels */}
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-2">
          {/* Row label */}
          <div className="w-6 flex items-center justify-center text-sm font-semibold text-foreground/60">
            {rowIndex + 1}
          </div>
          {/* Cells */}
          <div className="grid grid-cols-4 gap-2">
            {row.map((cell, colIndex) => (
              <CellComponent
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                onClick={() => onCellClick(rowIndex, colIndex)}
                isDisabled={
                  isGameEnded ||
                  cell.owner !== null ||
                  !isValidPlacement(rowIndex, colIndex)
                }
                isHighlighted={isInSelectedLine(rowIndex, colIndex) && !cell.owner}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
