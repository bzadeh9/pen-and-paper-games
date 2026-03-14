export type GamePhase = 'scribble' | 'complete' | 'done';
export type GameMode = 'regular' | 'upside-down' | 'flip' | 'themed';

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
  { name: 'Powder Blush', value: '#ffadad' },
  { name: 'Periwinkle', value: '#bdb2ff' },
  { name: 'Mauve', value: '#ffc6ff' },
  { name: 'Cream', value: '#fdffb6' },
];

export const PAPER_COLOR = '#fdf8f0';
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 560;
