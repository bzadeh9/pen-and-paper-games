export type GamePhase = 'scribble' | 'complete' | 'done';

export interface DrawColor {
  name: string;
  value: string;
}

export const DRAW_COLORS: DrawColor[] = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#e53e3e' },
  { name: 'Green', value: '#38a169' },
  { name: 'Blue', value: '#3182ce' },
  { name: 'Cherry Blossom', value: '#ffb3c1' },
  { name: 'Dusty Mauve', value: '#c9a0dc' },
  { name: 'Pastel Pink', value: '#ffcccc' },
  { name: 'Powder Petal', value: '#f8e5e5' },
];

export const PAPER_COLOR = '#fdf8f0';
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 560;
