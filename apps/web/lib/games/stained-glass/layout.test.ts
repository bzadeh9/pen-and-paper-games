import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateWindowLayout } from './layout';

// These thresholds confirm the clustered-seed layout has visibly varied panes
// without requiring an overly brittle exact geometry match.
const SMALL_PANE_THRESHOLD = 0.45; // Smallest pane should be <45% of median area
const LARGE_PANE_THRESHOLD = 1.4; // Largest pane should be >140% of median area

function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function polygonArea(points: { x: number; y: number }[]) {
  let area = 0;

  for (let i = 0; i < points.length; i++) {
    const next = points[(i + 1) % points.length];
    area += points[i].x * next.y - next.x * points[i].y;
  }

  return Math.abs(area) / 2;
}

describe('generateWindowLayout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a mix of large and much smaller panes', () => {
    vi.spyOn(Math, 'random').mockImplementation(createSeededRandom(123456));

    const layout = generateWindowLayout(18);
    const areas = layout.sections
      .map((section) => polygonArea(section.polygon))
      .sort((a, b) => a - b);
    const medianArea = areas[Math.floor(areas.length / 2)];
    const largestArea = areas[areas.length - 1];

    expect(layout.sections.length).toBeGreaterThanOrEqual(15);
    expect(areas[0]).toBeLessThan(medianArea * SMALL_PANE_THRESHOLD);
    expect(largestArea).toBeGreaterThan(medianArea * LARGE_PANE_THRESHOLD);
  });
});
