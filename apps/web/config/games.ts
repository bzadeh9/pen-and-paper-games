export type GameCategory = 'Strategy' | 'Puzzle' | 'Party' | 'Abstract';
export type GameTag = '2-Player' | 'Quick' | 'Complex' | 'Chess-like' | 'Area Control' | 'Abstract';

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  href: string;
  category: GameCategory;
  tags: GameTag[];
}

export const games: GameMetadata[] = [
  {
    id: 'hold-the-line',
    name: 'Hold the Line',
    description: 'Connect the dots, and be the last one to move!',
    href: '/games/hold-the-line',
    category: 'Strategy',
    tags: ['2-Player', 'Quick'],
  },
  {
    id: 'ultimate-tic-tac-toe',
    name: 'Ultimate Tic-Tac-Toe',
    description: 'A strategic twist on the classic game!',
    href: '/games/ultimate-tic-tac-toe',
    category: 'Strategy',
    tags: ['2-Player', 'Complex'],
  },
  {
    id: 'order-and-chaos',
    name: 'Order and Chaos',
    description: 'Asymmetric strategy on a 6x6 grid',
    href: '/games/order-and-chaos',
    category: 'Strategy',
    tags: ['2-Player', 'Abstract'],
  },
  {
    id: 'knight-chase',
    name: 'Knight Chase',
    description: 'Strategic knight movement with a twist!',
    href: '/games/knight-chase',
    category: 'Strategy',
    tags: ['2-Player', 'Chess-like'],
  },
  {
    id: 'splatter',
    name: 'Splatter',
    description: 'Strategic elimination - be the last one standing!',
    href: '/games/splatter',
    category: 'Strategy',
    tags: ['2-Player', 'Area Control'],
  },
  {
    id: 'black-hole',
    name: 'Black Hole',
    description: 'A game of reverse-area control',
    href: '/games/black-hole',
    category: 'Puzzle',
    tags: ['2-Player', 'Abstract'],
  },
  {
    id: 'scribbl',
    name: 'Scribbl',
    description: 'Complete a scribble into a drawing!',
    href: '/games/scribbl',
    category: 'Party',
    tags: ['2-Player', 'Quick'],
  },
];
