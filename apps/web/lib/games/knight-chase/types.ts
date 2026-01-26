export const PLAYER_COLORS = {
  alabasterGrey: '#e8e8e8',
  powderPetal: '#f8e5e5',
  pastelPink: '#ffcccc',
  cherryBlossom: '#ffb3c1',
  dustyMauve: '#c9a0dc',
} as const;

export type PlayerColor = keyof typeof PLAYER_COLORS;

export const PLAYER_COLOR_OPTIONS: { value: PlayerColor; label: string }[] = [
  { value: 'alabasterGrey', label: 'Alabaster Grey' },
  { value: 'powderPetal', label: 'Powder Petal' },
  { value: 'pastelPink', label: 'Pastel Pink' },
  { value: 'cherryBlossom', label: 'Cherry Blossom' },
  { value: 'dustyMauve', label: 'Dusty Mauve' },
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
