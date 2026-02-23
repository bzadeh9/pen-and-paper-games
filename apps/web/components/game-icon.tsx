import React from 'react';

interface GameIconProps {
  id: string;
  className?: string;
}

/** Maps game id to full Tailwind background and text color classes. */
export const gameColors: Record<string, { bg: string; text: string }> = {
  'hold-the-line': {
    bg: 'bg-cherry-blossom/20',
    text: 'text-cherry-blossom',
  },
  splatter: { bg: 'bg-dusty-mauve/20', text: 'text-dusty-mauve' },
  'knight-chase': { bg: 'bg-prussian-blue/20', text: 'text-prussian-blue' },
  'ultimate-tic-tac-toe': {
    bg: 'bg-powder-petal/20',
    text: 'text-powder-petal',
  },
  'black-hole': { bg: 'bg-dusty-mauve/20', text: 'text-dusty-mauve' },
  'order-and-chaos': { bg: 'bg-pastel-pink/20', text: 'text-pastel-pink' },
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
      strokeWidth={1.5}
      d="M6 20h12M9 20v-2l-1-2V13c0-3 2-5 5-5V6l1.5-3h1C17 3 18 4 18 5l-1.5 2H15v1.5c2 1 3 2.5 3 4.5v3l-1 2v2"
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
      <circle cx="17.5" cy="6" r="3" strokeWidth={2} />
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
