export const PLAYER_COLORS = {
  porcelain: '#fffffc',
  cream: '#fdffb6',
  mauve: '#ffc6ff',
  powderBlush: '#ffadad',
  periwinkle: '#bdb2ff',
} as const;

export type PlayerColor = keyof typeof PLAYER_COLORS;

export const PLAYER_COLOR_OPTIONS: { value: PlayerColor; label: string }[] = [
  { value: 'porcelain', label: 'Porcelain' },
  { value: 'cream', label: 'Cream' },
  { value: 'mauve', label: 'Mauve' },
  { value: 'powderBlush', label: 'Powder Blush' },
  { value: 'periwinkle', label: 'Periwinkle' },
];

export type Position = { row: number; col: number };
export type Player = 1 | 2;
export type GameStatus = 'setup' | 'playing' | 'ended';

// Cell states: Player number for occupied, 'exhausted' for used square, null for available
export type CellState = Player | 'exhausted' | null;

export interface GameState {
  gridSize: number; // Fixed at 8 for Knight Chase
  grid: CellState[][];
  playerPositions: Record<Player, Position>;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winReason: 'elimination' | 'entrapment' | null;
  moveHistory: { player: Player; from: Position; to: Position }[];
}
