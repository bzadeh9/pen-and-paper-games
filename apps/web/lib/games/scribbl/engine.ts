/** How often (ms) the canvas automatically flips while a game is in progress. */
export const FLIP_INTERVAL_MS = 5000;

/** Themes Player 2 can be challenged to draw. */
export const CONCEPTS: string[] = [
  'A girl walking in a garden',
  'A boy playing soccer',
  'A dog chasing its tail',
  'A cat napping in the sun',
  'A family having a picnic',
  'A rocket flying to the moon',
  'A fish jumping out of the sea',
  'A bird perched on a branch',
  'A child flying a kite',
  'A chef cooking in a kitchen',
  'A knight riding a horse',
  'A robot exploring a forest',
  'A boat sailing on a lake',
  'A dancer spinning on stage',
  'Two friends sharing an umbrella',
  'A mountain climber at the summit',
  'A musician playing guitar by a campfire',
  'A butterfly landing on a flower',
  'A snowman melting in the sun',
  'A wizard casting a spell',
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
