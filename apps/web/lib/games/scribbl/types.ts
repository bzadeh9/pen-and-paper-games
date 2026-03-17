export type GamePhase = 'scribble' | 'complete' | 'done';
export type GameMode = 'regular' | 'upside-down' | 'flip' | 'themed';

export interface DrawColor {
  name: string;
  value: string;
}

export const DRAW_COLORS: DrawColor[] = [
  { name: 'Black', value: '#1a1a1a' },
  { name: 'White', value: '#ffffff' },
  { name: 'Powder Blush', value: '#ffadad' },
  { name: 'Apricot Cream', value: '#ffd6a5' },
  { name: 'Cream', value: '#fdffb6' },
  { name: 'Tea Green', value: '#caffbf' },
  { name: 'Electric Aqua', value: '#9bf6ff' },
  { name: 'Baby Blue Ice', value: '#a0c4ff' },
  { name: 'Periwinkle', value: '#bdb2ff' },
  { name: 'Mauve', value: '#ffc6ff' },
  { name: 'Porcelain', value: '#fffffc' },
];

export const PAPER_COLOR = '#fdf8f0';
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 560;
