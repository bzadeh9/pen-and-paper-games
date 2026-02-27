/** How often (ms) the canvas automatically flips while a game is in progress. */
export const FLIP_INTERVAL_MS = 5000;

/** Concepts Player 2 can be challenged to draw. */
export const CONCEPTS: string[] = [
  'house',
  'flower',
  'rocket ship',
  'cat',
  'dog',
  'tree',
  'car',
  'boat',
  'bicycle',
  'fish',
  'bird',
  'sun',
  'cloud',
  'mountain',
  'butterfly',
  'umbrella',
  'hat',
  'cake',
  'guitar',
  'robot',
];

/**
 * Returns a random concept from the CONCEPTS list.
 * Accepts an optional RNG function so callers can supply a seeded generator
 * during testing.
 */
export function getRandomConcept(rng: () => number = Math.random): string {
  const index = Math.floor(rng() * CONCEPTS.length);
  return CONCEPTS[index];
}

/**
 * Given the time elapsed (in milliseconds) since the flip timer started,
 * returns whether the canvas should currently be in the flipped (180°) state.
 *
 * The canvas alternates every FLIP_INTERVAL_MS:
 *  0 – 4 999 ms  → not flipped
 *  5 000 – 9 999 ms → flipped
 * 10 000 – 14 999 ms → not flipped
 * …
 */
export function shouldCanvasBeFlipped(elapsedMs: number): boolean {
  return Math.floor(elapsedMs / FLIP_INTERVAL_MS) % 2 === 1;
}
