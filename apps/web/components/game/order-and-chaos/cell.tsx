import type { Cell, PieceColor, DisplayMode } from '@/lib/games/order-and-chaos/types';

interface CellProps {
  cell: Cell;
  onClick: () => void;
  isDisabled: boolean;
  selectedColor: PieceColor | null;
  displayMode: DisplayMode;
}

export function CellComponent({
  cell,
  onClick,
  isDisabled,
  selectedColor,
  displayMode,
}: CellProps) {
  const getColorClass = (color: PieceColor | null) => {
    if (!color) return 'bg-background';
    return color === 'cherry-blossom'
      ? 'bg-cherry-blossom'
      : 'bg-dusty-mauve';
  };

  const getSymbol = (color: PieceColor | null) => {
    if (!color) return null;
    return color === 'cherry-blossom' ? 'X' : 'O';
  };

  const showPreview = !cell.color && selectedColor && !isDisabled;
  
  const getPreviewClass = () => {
    if (!showPreview) return '';
    return selectedColor === 'cherry-blossom'
      ? 'ring-2 ring-cherry-blossom/40'
      : 'ring-2 ring-dusty-mauve/40';
  };

  const getTextColor = (color: PieceColor | null) => {
    if (!color) return '';
    return color === 'cherry-blossom'
      ? 'text-cherry-blossom'
      : 'text-dusty-mauve';
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all duration-200
        ${!cell.color ? 'border-2 border-foreground/20' : ''}
        ${displayMode === 'color' ? getColorClass(cell.color) : 'bg-background'}
        ${
          !isDisabled && !cell.color
            ? 'hover:scale-110 hover:shadow-lg cursor-pointer'
            : ''
        }
        ${isDisabled ? 'cursor-not-allowed' : ''}
        ${cell.color ? 'scale-100 hover:scale-105' : ''}
        ${getPreviewClass()}
      `}
      aria-label={`Cell at row ${cell.row + 1}, column ${cell.col + 1}${
        cell.color ? `, occupied by ${cell.color}` : ''
      }`}
    >
      {cell.color && displayMode === 'color' && (
        <div className={`h-10 w-10 md:h-12 md:w-12 rounded-full ${getColorClass(cell.color)}`} />
      )}
      {cell.color && displayMode === 'symbol' && (
        <span className={`text-3xl md:text-4xl font-bold ${getTextColor(cell.color)}`}>
          {getSymbol(cell.color)}
        </span>
      )}
    </button>
  );
}
