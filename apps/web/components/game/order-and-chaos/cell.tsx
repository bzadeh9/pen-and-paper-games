import type { Cell, PieceColor } from '@/lib/games/order-and-chaos/types';

interface CellProps {
  cell: Cell;
  onClick: () => void;
  isDisabled: boolean;
  selectedColor: PieceColor | null;
}

export function CellComponent({
  cell,
  onClick,
  isDisabled,
  selectedColor,
}: CellProps) {
  const getColorClass = (color: PieceColor | null) => {
    if (!color) return 'bg-background';
    return color === 'cherry-blossom'
      ? 'bg-cherry-blossom'
      : 'bg-dusty-mauve';
  };

  const showPreview = !cell.color && selectedColor && !isDisabled;
  
  const getPreviewClass = () => {
    if (!showPreview) return '';
    return selectedColor === 'cherry-blossom'
      ? 'ring-2 ring-offset-2 ring-cherry-blossom'
      : 'ring-2 ring-offset-2 ring-dusty-mauve';
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        h-12 w-12 rounded-lg border-2 border-foreground/20 transition-all
        ${getColorClass(cell.color)}
        ${
          !isDisabled && !cell.color
            ? 'hover:border-foreground/60 hover:scale-105 cursor-pointer'
            : ''
        }
        ${isDisabled ? 'cursor-not-allowed opacity-75' : ''}
        ${getPreviewClass()}
      `}
      aria-label={`Cell at row ${cell.row + 1}, column ${cell.col + 1}${
        cell.color ? `, occupied by ${cell.color}` : ''
      }`}
    >
      {cell.color && (
        <div className="h-full w-full rounded-md flex items-center justify-center">
          <div
            className={`h-8 w-8 rounded-full ${getColorClass(cell.color)}`}
          />
        </div>
      )}
    </button>
  );
}
