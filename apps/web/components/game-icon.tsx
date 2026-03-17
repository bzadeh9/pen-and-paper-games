import React from 'react';

interface GameIconProps {
  id: string;
  className?: string;
}

/** Maps game id to full Tailwind background and text color classes. */
export const gameColors: Record<string, { bg: string; text: string }> = {
  'hold-the-line': {
    bg: 'bg-powder-blush/20',
    text: 'text-powder-blush',
  },
  splatter: { bg: 'bg-periwinkle/20', text: 'text-periwinkle' },
  'knight-chase': { bg: 'bg-tea-green/20', text: 'text-tea-green' },
  'ultimate-tic-tac-toe': {
    bg: 'bg-baby-blue-ice/20',
    text: 'text-baby-blue-ice',
  },
  fences: { bg: 'bg-mauve/20', text: 'text-mauve' },
  'black-hole': { bg: 'bg-cream/20', text: 'text-cream' },
  'order-and-chaos': { bg: 'bg-apricot-cream/20', text: 'text-apricot-cream' },
  sim: { bg: 'bg-electric-aqua/20', text: 'text-electric-aqua' },
  'row-call': { bg: 'bg-powder-blush/20', text: 'text-powder-blush' },
  scribbl: { bg: 'bg-tea-green/20', text: 'text-tea-green' },
  'bee-game': { bg: 'bg-apricot-cream/20', text: 'text-apricot-cream' },
  'hide-and-seek': { bg: 'bg-electric-aqua/20', text: 'text-electric-aqua' },
  'abbee-and-dot': { bg: 'bg-apricot-cream/20', text: 'text-apricot-cream' },
  'maze-game': { bg: 'bg-baby-blue-ice/20', text: 'text-baby-blue-ice' },
  'virtue-memory': { bg: 'bg-mauve/20', text: 'text-mauve' },
  'flower-hop': { bg: 'bg-tea-green/20', text: 'text-tea-green' },
  'stained-glass': { bg: 'bg-mauve/20', text: 'text-mauve' },
};

const iconPaths: Record<string, React.ReactNode> = {
  /**
   * Hold The Line – 2×2 grid of dots with a dashed diagonal line connecting
   * two of them, representing the connect-the-dots game mechanic.
   */
  'hold-the-line': (
    <>
      <circle cx="5" cy="5" r="2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="5" r="2" fill="currentColor" stroke="none" />
      <circle cx="5" cy="19" r="2" fill="currentColor" stroke="none" />
      <circle cx="19" cy="19" r="2" fill="currentColor" stroke="none" />
      <path
        d="M7 7l10 10"
        strokeWidth={2}
        strokeDasharray="3 2"
        strokeLinecap="round"
      />
    </>
  ),

  /**
   * Splatter – paintbrush icon representing the paint-splattering area-control
   * theme (unchanged from original).
   */
  splatter: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
    />
  ),

  /**
   * Knight Chase – simplified chess knight silhouette (line art, facing right)
   * with a flat base bar typical of chess pieces.
   */
  'knight-chase': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M7 20h10M9 20v-2.5l-1.5-2V12c0-2.2 1.8-4 4-4h1.5V6.5l1.5-2.5h2l1.5 2.5-2 2v1.5c1.8.9 2.5 2.3 2.5 4v1.5l-1 2V20"
    />
  ),

  /**
   * Ultimate Tic-Tac-Toe – a standard tic-tac-toe grid (#) with a plus sign
   * in the corner indicating the game is an extended/ultimate variant.
   */
  'ultimate-tic-tac-toe': (
    <>
      {/* Tic-tac-toe grid */}
      <line
        x1="8"
        y1="3"
        x2="8"
        y2="15"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <line
        x1="14"
        y1="3"
        x2="14"
        y2="15"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <line
        x1="3"
        y1="8"
        x2="15"
        y2="8"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <line
        x1="3"
        y1="14"
        x2="15"
        y2="14"
        strokeLinecap="round"
        strokeWidth={2}
      />
      {/* Plus sign – "extended/ultimate" indicator */}
      <line
        x1="20"
        y1="17"
        x2="20"
        y2="22"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <line
        x1="17.5"
        y1="19.5"
        x2="22.5"
        y2="19.5"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </>
  ),

  /**
   * Fences – a 2×2 grid of dots with partial box outlines, representing the
   * dots-and-boxes game where players draw lines to complete squares.
   */
  fences: (
    <>
      {/* Dots (3×3 grid) */}
      <circle cx="4" cy="4" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="4" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="4" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="4" cy="20" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="20" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="20" cy="20" r="1.8" fill="currentColor" stroke="none" />
      {/* Completed box outline (top-left) */}
      <line x1="4" y1="4" x2="12" y2="4" strokeWidth={2} strokeLinecap="round" />
      <line x1="4" y1="4" x2="4" y2="12" strokeWidth={2} strokeLinecap="round" />
      <line x1="4" y1="12" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
      <line x1="12" y1="4" x2="12" y2="12" strokeWidth={2} strokeLinecap="round" />
      {/* Partial lines on other boxes */}
      <line x1="12" y1="4" x2="20" y2="4" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
      <line x1="4" y1="12" x2="4" y2="20" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
    </>
  ),

  /**
   * Black Hole – a large circle with a small square at its centre, evoking a
   * singularity / black hole (unchanged from original).
   */
  'black-hole': (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    </>
  ),

  /**
   * Sim – a hexagon with six dots and a triangle inside, representing
   * the triangle-avoidance game on a hexagonal graph.
   */
  sim: (
    <>
      {/* Hexagon dots */}
      <circle cx="12" cy="2.5" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="20.2" cy="7.2" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="20.2" cy="16.8" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21.5" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="3.8" cy="16.8" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="3.8" cy="7.2" r="1.8" fill="currentColor" stroke="none" />
      {/* Hexagon outline */}
      <polygon
        points="12,2.5 20.2,7.2 20.2,16.8 12,21.5 3.8,16.8 3.8,7.2"
        fill="none"
        strokeWidth={1.2}
        strokeLinejoin="round"
        opacity={0.3}
      />
      {/* Triangle inside (the losing condition) */}
      <polygon
        points="12,2.5 20.2,16.8 3.8,16.8"
        fill="currentColor"
        opacity={0.15}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </>
  ),

  /**
   * Row Call – a 2×2 mini-grid with an arrow pointing at a row, representing
   * the mechanic of choosing a row/column for your opponent to place into.
   */
  'row-call': (
    <>
      {/* 2×2 grid of dots */}
      <circle cx="7" cy="7" r="2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="7" r="2" fill="currentColor" stroke="none" opacity={0.3} />
      <circle cx="7" cy="17" r="2" fill="currentColor" stroke="none" opacity={0.3} />
      <circle cx="17" cy="17" r="2" fill="currentColor" stroke="none" />
      {/* Grid lines */}
      <line x1="3" y1="12" x2="21" y2="12" strokeWidth={1} strokeLinecap="round" opacity={0.2} />
      <line x1="12" y1="3" x2="12" y2="21" strokeWidth={1} strokeLinecap="round" opacity={0.2} />
      {/* Arrow pointing at top row */}
      <path d="M22 7l-2.5-2v4z" fill="currentColor" opacity={0.6} stroke="none" />
    </>
  ),

  /**
   * Order and Chaos – an X and an O (the two piece types, either player can
   * place either) paired with a question mark representing the turbulent,
   * unpredictable nature of the game.
   */
  'order-and-chaos': (
    <>
      {/* X piece */}
      <line
        x1="3"
        y1="3"
        x2="8"
        y2="8"
        strokeLinecap="round"
        strokeWidth={2}
      />
      <line
        x1="8"
        y1="3"
        x2="3"
        y2="8"
        strokeLinecap="round"
        strokeWidth={2}
      />
      {/* O piece */}
      <circle cx="17.5" cy="6" r="3" strokeWidth={2} fill="none" />
      {/* Question mark – hook */}
      <path
        d="M10 14.5c0-2 1-3 2.5-3s2.5 1 2.5 2.5c0 2-2.5 2-2.5 4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      {/* Question mark – dot */}
      <circle cx="12.5" cy="20.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),

  /**
   * Scribbl – a pencil (pointing upper-right → lower-left) with a wavy curved
   * line below it, representing the scribble-and-complete drawing activity.
   */
  scribbl: (
    <>
      {/* Pencil body */}
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
      />
      {/* Curved line just drawn by the pencil */}
      <path
        d="M3 21c1.5-2.5 4-1.5 5.5-4"
        fill="none"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </>
  ),

  /**
   * Abbee & Dot – a stylized bee with body, wings, and stinger, themed for
   * the Ayyam-i-ha bee chase game.
   */
  'bee-game': (
    <>
      {/* Body */}
      <ellipse cx="12" cy="13" rx="5" ry="4" fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={1.5} />
      {/* Stripes */}
      <line x1="10" y1="11.5" x2="14" y2="11.5" strokeWidth={1} strokeLinecap="round" />
      <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" strokeWidth={1} strokeLinecap="round" />
      {/* Wings */}
      <ellipse cx="9" cy="9" rx="2.5" ry="1.8" fill="none" strokeWidth={1.2} transform="rotate(-20 9 9)" />
      <ellipse cx="15" cy="9" rx="2.5" ry="1.8" fill="none" strokeWidth={1.2} transform="rotate(20 15 9)" />
      {/* Head */}
      <circle cx="12" cy="7.5" r="2" fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={1.2} />
      {/* Antennae */}
      <line x1="11" y1="6" x2="9.5" y2="3.5" strokeWidth={1} strokeLinecap="round" />
      <line x1="13" y1="6" x2="14.5" y2="3.5" strokeWidth={1} strokeLinecap="round" />
      <circle cx="9.5" cy="3.2" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="3.2" r="0.6" fill="currentColor" stroke="none" />
      {/* Stinger */}
      <line x1="12" y1="17" x2="12" y2="19.5" strokeWidth={1.2} strokeLinecap="round" />
    </>
  ),

  /**
   * Abbee & Dot category – same bee icon as bee-game, representing the
   * Ayyam-i-Ha series category tile on the home page.
   */
  'abbee-and-dot': (
    <>
      {/* Body */}
      <ellipse cx="12" cy="13" rx="5" ry="4" fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={1.5} />
      {/* Stripes */}
      <line x1="10" y1="11.5" x2="14" y2="11.5" strokeWidth={1} strokeLinecap="round" />
      <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" strokeWidth={1} strokeLinecap="round" />
      {/* Wings */}
      <ellipse cx="9" cy="9" rx="2.5" ry="1.8" fill="none" strokeWidth={1.2} transform="rotate(-20 9 9)" />
      <ellipse cx="15" cy="9" rx="2.5" ry="1.8" fill="none" strokeWidth={1.2} transform="rotate(20 15 9)" />
      {/* Head */}
      <circle cx="12" cy="7.5" r="2" fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={1.2} />
      {/* Antennae */}
      <line x1="11" y1="6" x2="9.5" y2="3.5" strokeWidth={1} strokeLinecap="round" />
      <line x1="13" y1="6" x2="14.5" y2="3.5" strokeWidth={1} strokeLinecap="round" />
      <circle cx="9.5" cy="3.2" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="3.2" r="0.6" fill="currentColor" stroke="none" />
      {/* Stinger */}
      <line x1="12" y1="17" x2="12" y2="19.5" strokeWidth={1.2} strokeLinecap="round" />
    </>
  ),

  /**
   * Ayyam-i-Ha Maze – a simple maze grid with a path arrow, representing
   * the maze navigation game.
   */
  'maze-game': (
    <>
      {/* Outer border */}
      <rect x="3" y="3" width="18" height="18" rx="1" fill="none" strokeWidth={1.5} />
      {/* Maze walls */}
      <line x1="3" y1="9" x2="9" y2="9" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="12" y1="9" x2="21" y2="9" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="9" y1="9" x2="9" y2="15" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="15" y1="3" x2="15" y2="9" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="9" y1="15" x2="15" y2="15" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="15" y1="15" x2="15" y2="21" strokeWidth={1.5} strokeLinecap="round" />
      {/* Path arrow (small bee indicator moving through maze) */}
      <circle cx="6" cy="6" r="1.2" fill="currentColor" opacity={0.7} stroke="none" />
      <circle cx="18" cy="18" r="1.2" fill="currentColor" opacity={0.7} stroke="none" />
    </>
  ),

  /**
   * Ayyam-i-Ha Hide & Seek – a gem shape with a small magnifying glass,
   * representing the gem-hiding and seeking mechanic.
   */
  'hide-and-seek': (
    <>
      {/* Gem body */}
      <polygon
        points="12,3 20,8 17,18 7,18 4,8"
        fill="currentColor"
        opacity={0.25}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      {/* Gem top facets */}
      <polyline
        points="4,8 12,3 20,8"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinejoin="round"
      />
      <line x1="12" y1="3" x2="12" y2="18" strokeWidth={0.8} strokeLinecap="round" opacity={0.5} />
      {/* Magnifying glass */}
      <circle cx="18" cy="18" r="3" fill="none" stroke="currentColor" strokeWidth={1.5} />
      <line x1="20.1" y1="20.1" x2="22.5" y2="22.5" strokeWidth={1.5} strokeLinecap="round" />
    </>
  ),
  /**
   * Ayyam-i-Ha Virtue Memory – two overlapping cards with a star/sparkle,
   * representing the memory card-matching game.
   */
  'virtue-memory': (
    <>
      {/* Back card */}
      <rect x="3" y="6" width="12" height="15" rx="1.5" fill="none" strokeWidth={1.5} />
      {/* Front card */}
      <rect x="9" y="3" width="12" height="15" rx="1.5" fill="currentColor" opacity={0.15} strokeWidth={1.5} />
      {/* Star on front card */}
      <path
        d="M15 6.5l.8 2.4h2.5l-2 1.5.8 2.4L15 11.4l-2.1 1.4.8-2.4-2-1.5h2.5z"
        fill="currentColor"
        stroke="none"
        opacity={0.9}
      />
    </>
  ),

  /**
   * Ayyam-i-Ha Flower Hop – a flower with a small gem above it and a tiny
   * bee, representing the side-scrolling flower-hopping game.
   */
  'flower-hop': (
    <>
      {/* Flower stem */}
      <line x1="12" y1="14" x2="12" y2="22" strokeWidth={2} strokeLinecap="round" stroke="currentColor" />
      {/* Flower petals */}
      <circle cx="9" cy="12" r="2.5" fill="currentColor" opacity={0.25} stroke="currentColor" strokeWidth={1} />
      <circle cx="15" cy="12" r="2.5" fill="currentColor" opacity={0.25} stroke="currentColor" strokeWidth={1} />
      <circle cx="12" cy="9.5" r="2.5" fill="currentColor" opacity={0.25} stroke="currentColor" strokeWidth={1} />
      <circle cx="12" cy="14.5" r="2.5" fill="currentColor" opacity={0.25} stroke="currentColor" strokeWidth={1} />
      {/* Flower centre */}
      <circle cx="12" cy="12" r="1.8" fill="currentColor" opacity={0.6} stroke="none" />
      {/* Gem above flower */}
      <polygon
        points="19,3 21,6 19,9 17,6"
        fill="currentColor"
        opacity={0.5}
        stroke="currentColor"
        strokeWidth={0.8}
        strokeLinejoin="round"
      />
      {/* Tiny bee */}
      <ellipse cx="5" cy="6" rx="2" ry="1.5" fill="currentColor" opacity={0.3} stroke="currentColor" strokeWidth={0.8} />
      <line x1="4.5" y1="4.5" x2="4" y2="3" strokeWidth={0.7} strokeLinecap="round" />
      <line x1="5.5" y1="4.5" x2="6" y2="3" strokeWidth={0.7} strokeLinecap="round" />
    </>
  ),

  /**
   * Stained Glass – an arched window frame divided into pane sections,
   * with a few colored panes representing the area-control mechanic.
   */
  'stained-glass': (
    <>
      {/* Window frame (arched top) */}
      <path
        d="M4 21V8a8 8 0 0116 0v13"
        fill="none"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom frame */}
      <line x1="4" y1="21" x2="20" y2="21" strokeWidth={1.8} strokeLinecap="round" />
      {/* Vertical divider */}
      <line x1="12" y1="4" x2="12" y2="21" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
      {/* Horizontal dividers */}
      <line x1="4" y1="12" x2="20" y2="12" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
      <line x1="4" y1="17" x2="20" y2="17" strokeWidth={1.2} strokeLinecap="round" opacity={0.6} />
      {/* Colored panes */}
      <rect x="5" y="13" width="6" height="3.5" rx="0.5" fill="currentColor" opacity={0.35} stroke="none" />
      <rect x="13" y="17.5" width="6" height="3" rx="0.5" fill="currentColor" opacity={0.2} stroke="none" />
    </>
  ),
};

export function GameIcon({ id, className }: GameIconProps) {
  const content = iconPaths[id];
  if (!content) return null;

  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {content}
    </svg>
  );
}
