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
