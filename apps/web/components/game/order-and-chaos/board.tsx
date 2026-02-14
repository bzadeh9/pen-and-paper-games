import type { Cell, PieceColor, DisplayMode } from '@/lib/games/order-and-chaos/types';
import { CellComponent } from './cell';

interface BoardProps {
  board: Cell[][];
  onCellClick: (row: number, col: number, color: PieceColor) => void;
  isGameEnded: boolean;
  selectedColor: PieceColor | null;
  displayMode: DisplayMode;
}

export function Board({
  board,
  onCellClick,
  isGameEnded,
  selectedColor,
  displayMode,
}: BoardProps) {
  return (
    <div className="inline-block rounded-lg border-2 border-foreground/20 bg-background p-4 shadow-lg">
      <div className="grid grid-cols-6 gap-2">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <CellComponent
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              onClick={() => {
                if (selectedColor && !isGameEnded) {
                  onCellClick(rowIndex, colIndex, selectedColor);
                }
              }}
              isDisabled={isGameEnded || cell.color !== null}
              selectedColor={selectedColor}
              displayMode={displayMode}
            />
          ))
        )}
      </div>
    </div>
  );
}
