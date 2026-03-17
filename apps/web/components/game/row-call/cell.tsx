import type { Cell, Player } from '@/lib/games/row-call/types';

interface CellProps {
  cell: Cell;
  onClick: () => void;
  isDisabled: boolean;
  isHighlighted: boolean;
}

export function CellComponent({
  cell,
  onClick,
  isDisabled,
  isHighlighted,
}: CellProps) {
  const getOwnerColor = (owner: Player | null) => {
    if (!owner) return '';
    return owner === 'player1' ? 'bg-powder-blush' : 'bg-periwinkle';
  };

  const getOwnerLabel = (owner: Player | null) => {
    if (!owner) return 'empty';
    return owner === 'player1' ? 'Player 1' : 'Player 2';
  };

  const columnLabel = String.fromCharCode(65 + cell.col); // A, B, C, D
  const rowLabel = cell.row + 1; // 1, 2, 3, 4

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        h-14 w-14 md:h-16 md:w-16 rounded-full flex items-center justify-center transition-all duration-200
        ${!cell.owner ? 'border-2 border-foreground/20' : ''}
        ${cell.owner ? '' : 'bg-background'}
        ${!isDisabled && !cell.owner ? 'hover:scale-110 hover:shadow-lg cursor-pointer' : ''}
        ${isDisabled ? 'cursor-not-allowed' : ''}
        ${cell.owner ? 'scale-100 hover:scale-105' : ''}
        ${isHighlighted && !cell.owner ? 'ring-2 ring-powder-blush/50 bg-powder-blush/5' : ''}
      `}
      aria-label={`Cell ${columnLabel}${rowLabel}, ${getOwnerLabel(cell.owner)}`}
    >
      {cell.owner && (
        <div
          className={`h-10 w-10 md:h-12 md:w-12 rounded-full ${getOwnerColor(cell.owner)}`}
        />
      )}
    </button>
  );
}
