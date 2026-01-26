export const PLAYER_COLORS = {
  alabasterGrey: '#e8e8e8',
  powderPetal: '#f8e5e5',
  pastelPink: '#ffcccc',
  cherryBlossom: '#ffb3c1',
  dustyMauve: '#c9a0dc',
} as const;

// Color for used/visited dots and lines - distinct from player colors
// Using a slate gray that contrasts with all player colors
export const USED_ELEMENT_COLOR = '#64748b'; // Slate-500 - accessible and distinct

export type PlayerColor = keyof typeof PLAYER_COLORS;

export const PLAYER_COLOR_OPTIONS: { value: PlayerColor; label: string }[] = [
  { value: 'alabasterGrey', label: 'Alabaster Grey' },
  { value: 'powderPetal', label: 'Powder Petal' },
  { value: 'pastelPink', label: 'Pastel Pink' },
  { value: 'cherryBlossom', label: 'Cherry Blossom' },
  { value: 'dustyMauve', label: 'Dusty Mauve' },
];
