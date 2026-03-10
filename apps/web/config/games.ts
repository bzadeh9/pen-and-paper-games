export type GameCategory = 'Strategy' | 'Puzzle' | 'Party' | 'Abstract' | 'Ayyam-i-Ha';
export type GameTag = '2-Player' | 'Quick' | 'Complex' | 'Chess-like' | 'Area Control' | 'Abstract' | 'Family' | 'Cooperative';

export interface GameMetadata {
  id: string;
  name: string;
  description: string;
  href: string;
  category: GameCategory;
  tags: GameTag[];
  /** When false, the game is not shown directly on the home page (e.g. it lives inside a category). Defaults to true. */
  showOnHome?: boolean;
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
    id: 'fences',
    name: 'Fences',
    description: 'Connect dots to claim boxes — get the most territory!',
    href: '/games/fences',
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
    name: 'Scribble',
    description: 'Complete a scribble into a drawing!',
    href: '/games/scribbl',
    category: 'Party',
    tags: ['2-Player', 'Quick'],
  },
  {
    id: 'abbee-and-dot',
    name: 'Abbee & Dot',
    description: 'Baha\'i Ayyam-i-Ha games with Abbee and Dot the bees!',
    href: '/games/abbee-and-dot',
    category: 'Ayyam-i-Ha',
    tags: ['Family'],
  },
  {
    id: 'bee-game',
    name: 'Ayyam-i-Ha Virtue Chase',
    description: 'A Baha\'i Ayyam-i-ha bee chase game for families!',
    href: '/games/bee-game',
    category: 'Ayyam-i-Ha',
    tags: ['2-Player', 'Family'],
    showOnHome: false,
  },
  {
    id: 'hide-and-seek',
    name: 'Ayyam-i-Ha Hide & Seek',
    description: 'Hide gems in the garden — can Dot find them all?',
    href: '/games/hide-and-seek',
    category: 'Ayyam-i-Ha',
    tags: ['2-Player', 'Family'],
    showOnHome: false,
  },
  {
    id: 'maze-game',
    name: 'Ayyam-i-Ha Maze',
    description: 'Navigate a maze together — help each other cross the bridges!',
    href: '/games/maze-game',
    category: 'Ayyam-i-Ha',
    tags: ['2-Player', 'Family', 'Cooperative'],
    showOnHome: false,
  },
  {
    id: 'virtue-memory',
    name: 'Ayyam-i-Ha Virtue Memory',
    description: 'Match pairs of Ayyam-i-Ha virtues with Abbee & Dot!',
    href: '/games/virtue-memory',
    category: 'Ayyam-i-Ha',
    tags: ['2-Player', 'Family'],
    showOnHome: false,
  },
  {
    id: 'flower-hop',
    name: 'Ayyam-i-Ha Flower Hop',
    description: 'Hop across flowers and collect gems with Abbee & Dot!',
    href: '/games/flower-hop',
    category: 'Ayyam-i-Ha',
    tags: ['2-Player', 'Family'],
    showOnHome: false,
  },
];
