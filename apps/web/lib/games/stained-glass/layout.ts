/**
 * Generates a stained-glass window layout with randomly positioned sections
 * inside an arched window outline.
 *
 * Uses a relaxed random point placement + Voronoi-style polygon construction
 * to produce organic-looking pane sections with proper neighbor relationships.
 */

export interface Point {
  x: number;
  y: number;
}

export interface LayoutSection {
  id: number;
  polygon: Point[]; // Vertices of the polygon (SVG-ready)
  center: Point; // Centroid for labels
  neighbors: number[]; // IDs of sections sharing an edge
}

export interface WindowLayout {
  sections: LayoutSection[];
  width: number;
  height: number;
  outlinePath: string; // SVG path for the arched window frame
}

/**
 * The arched window shape: a rectangle topped with a semicircular arch.
 * Total height = archHeight + bodyHeight.
 */
const WINDOW_WIDTH = 400;
const ARCH_RADIUS = 200; // half of width → semicircle
const BODY_HEIGHT = 350;
const TOTAL_HEIGHT = ARCH_RADIUS + BODY_HEIGHT; // 550
const PADDING = 15; // Inset padding so polygons don't touch frame edge
const CLUSTER_RATIO = 0.3; // Share of seeds reserved for tighter clusters
const CLUSTER_MIN_RATIO = 0.2; // Lower spacing multiplier for tiny accent panes
const CLUSTER_MAX_RATIO = 0.42; // Upper spacing multiplier to keep clusters local
const CLUSTER_DISTANCE_MIN_ABSOLUTE = 10; // Minimum spacing fallback in pixels
const CLUSTER_DISTANCE_MAX_ABSOLUTE = 22; // Maximum spacing cap in pixels

/**
 * Build the SVG path string for the arched window outline.
 */
function buildOutlinePath(): string {
  // Start at bottom-left, go up, arch across, come back down
  return [
    `M 0 ${TOTAL_HEIGHT}`, // bottom-left
    `L 0 ${ARCH_RADIUS}`, // left side up to arch start
    `A ${ARCH_RADIUS} ${ARCH_RADIUS} 0 0 1 ${WINDOW_WIDTH} ${ARCH_RADIUS}`, // semicircular arch
    `L ${WINDOW_WIDTH} ${TOTAL_HEIGHT}`, // right side down
    `Z`, // close
  ].join(' ');
}

/**
 * Check whether a point is inside the arched window shape (with padding).
 */
function isInsideWindow(p: Point): boolean {
  const pad = PADDING;
  // Must be within horizontal bounds
  if (p.x < pad || p.x > WINDOW_WIDTH - pad) return false;
  // Must be within vertical bounds
  if (p.y < pad || p.y > TOTAL_HEIGHT - pad) return false;

  // If point is in the arch zone (y < ARCH_RADIUS), check circle containment
  if (p.y < ARCH_RADIUS) {
    const cx = WINDOW_WIDTH / 2;
    const cy = ARCH_RADIUS;
    const dx = p.x - cx;
    const dy = p.y - cy;
    const r = ARCH_RADIUS - pad;
    if (dx * dx + dy * dy > r * r) return false;
    return true;
  }

  return true;
}

/**
 * Generate random seed points inside the window shape using Poisson-disk-like
 * rejection sampling for even distribution.
 */
function generateSeedPoints(count: number): Point[] {
  const points: Point[] = [];
  const minDist = Math.max(40, 300 / Math.sqrt(count)); // Minimum distance between major panes
  const clusterMinDist = Math.max(
    CLUSTER_DISTANCE_MIN_ABSOLUTE,
    minDist * CLUSTER_MIN_RATIO
  );
  const clusterMaxDist = Math.min(
    CLUSTER_DISTANCE_MAX_ABSOLUTE,
    minDist * CLUSTER_MAX_RATIO
  );
  const clusteredCount = Math.max(2, Math.floor(count * CLUSTER_RATIO));
  const evenlyDistributedTarget = Math.max(1, count - clusteredCount);
  const maxAttempts = count * 250;

  const isFarEnough = (candidate: Point, minimumDistance: number) =>
    points.every((existing) => {
      const dx = candidate.x - existing.x;
      const dy = candidate.y - existing.y;
      return dx * dx + dy * dy >= minimumDistance * minimumDistance;
    });

  let attempts = 0;
  while (points.length < evenlyDistributedTarget && attempts < maxAttempts) {
    attempts++;
    const candidate: Point = {
      x: PADDING + Math.random() * (WINDOW_WIDTH - 2 * PADDING),
      y: PADDING + Math.random() * (TOTAL_HEIGHT - 2 * PADDING),
    };

    if (!isInsideWindow(candidate)) continue;
    if (isFarEnough(candidate, minDist)) {
      points.push(candidate);
    }
  }

  attempts = 0;
  while (points.length > 0 && points.length < count && attempts < maxAttempts) {
    attempts++;
    const anchor = points[Math.floor(Math.random() * points.length)];
    const angle = Math.random() * Math.PI * 2;
    const distance = clusterMinDist + Math.random() * (clusterMaxDist - clusterMinDist);
    const candidate: Point = {
      x: anchor.x + Math.cos(angle) * distance,
      y: anchor.y + Math.sin(angle) * distance,
    };

    if (!isInsideWindow(candidate)) continue;
    if (isFarEnough(candidate, clusterMinDist)) {
      points.push(candidate);
    }
  }

  attempts = 0;
  while (points.length < count && attempts < maxAttempts) {
    attempts++;
    const candidate: Point = {
      x: PADDING + Math.random() * (WINDOW_WIDTH - 2 * PADDING),
      y: PADDING + Math.random() * (TOTAL_HEIGHT - 2 * PADDING),
    };

    if (!isInsideWindow(candidate)) continue;
    if (isFarEnough(candidate, clusterMinDist)) {
      points.push(candidate);
    }
  }

  return points;
}

/**
 * Compute Voronoi-like polygons using a simple geometric approach:
 * For each seed point, compute the polygon of all window-interior points
 * closer to that seed than any other. We approximate this by computing
 * the dual of a Delaunay-like triangulation.
 *
 * Since we don't have a Delaunay library, we use a grid-based approach:
 * rasterize which seed owns each pixel, then trace polygon boundaries.
 *
 * For performance, we use a coarser grid and build polygons from
 * border pixel positions.
 */

/**
 * Simple Voronoi via ownership grid.
 * Returns: for each grid cell, the index of the nearest seed point.
 */
function buildOwnershipGrid(
  seeds: Point[],
  resolution: number
): { grid: Int16Array; cols: number; rows: number } {
  const cols = Math.ceil(WINDOW_WIDTH / resolution);
  const rows = Math.ceil(TOTAL_HEIGHT / resolution);
  const grid = new Int16Array(cols * rows).fill(-1);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const px = (gx + 0.5) * resolution;
      const py = (gy + 0.5) * resolution;
      const p: Point = { x: px, y: py };

      if (!isInsideWindow(p)) continue;

      let bestDist = Infinity;
      let bestIdx = -1;
      for (let i = 0; i < seeds.length; i++) {
        const dx = px - seeds[i].x;
        const dy = py - seeds[i].y;
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      grid[gy * cols + gx] = bestIdx;
    }
  }

  return { grid, cols, rows };
}

/**
 * From the ownership grid, find which seeds are neighbors
 * (their regions share a grid-edge).
 */
function findNeighbors(
  grid: Int16Array,
  cols: number,
  rows: number,
  seedCount: number
): Set<number>[] {
  const neighborSets: Set<number>[] = Array.from(
    { length: seedCount },
    () => new Set<number>()
  );

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const owner = grid[gy * cols + gx];
      if (owner < 0) continue;

      // Check right and down neighbors
      if (gx + 1 < cols) {
        const right = grid[gy * cols + gx + 1];
        if (right >= 0 && right !== owner) {
          neighborSets[owner].add(right);
          neighborSets[right].add(owner);
        }
      }
      if (gy + 1 < rows) {
        const below = grid[(gy + 1) * cols + gx];
        if (below >= 0 && below !== owner) {
          neighborSets[owner].add(below);
          neighborSets[below].add(owner);
        }
      }
    }
  }

  return neighborSets;
}

/**
 * Build convex hull polygons for each Voronoi region from the ownership grid.
 * For each seed, collect all grid cell centers belonging to it,
 * then compute the convex hull of those points.
 */
function buildPolygons(
  grid: Int16Array,
  cols: number,
  rows: number,
  resolution: number,
  seedCount: number
): Point[][] {
  // Collect border pixels for each region
  const borderPoints: Point[][] = Array.from({ length: seedCount }, () => []);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const owner = grid[gy * cols + gx];
      if (owner < 0) continue;

      // Check if this cell is on the border of its region
      let isBorder = false;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
          isBorder = true;
          break;
        }
        const neighbor = grid[ny * cols + nx];
        if (neighbor !== owner) {
          isBorder = true;
          break;
        }
      }

      if (isBorder) {
        borderPoints[owner].push({
          x: (gx + 0.5) * resolution,
          y: (gy + 0.5) * resolution,
        });
      }
    }
  }

  // Compute convex hull for each region
  return borderPoints.map((pts) => convexHull(pts));
}

/**
 * Convex hull using Andrew's monotone chain algorithm.
 */
function convexHull(points: Point[]): Point[] {
  if (points.length < 3) return points;

  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  // Lower hull
  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  // Upper hull
  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  // Remove last point of each half because it's repeated
  lower.pop();
  upper.pop();

  return [...lower, ...upper];
}

/**
 * Compute polygon centroid.
 */
function centroid(polygon: Point[]): Point {
  if (polygon.length === 0) return { x: 0, y: 0 };
  let cx = 0;
  let cy = 0;
  for (const p of polygon) {
    cx += p.x;
    cy += p.y;
  }
  return { x: cx / polygon.length, y: cy / polygon.length };
}

/**
 * Generate a complete stained-glass window layout.
 *
 * @param sectionCount - Desired number of pane sections (will be approximate)
 * @returns Layout data for rendering and game logic
 */
export function generateWindowLayout(sectionCount: number): WindowLayout {
  const seeds = generateSeedPoints(sectionCount);
  const actualCount = seeds.length;

  // Use a resolution that balances quality and performance
  const resolution = 4;

  const { grid, cols, rows } = buildOwnershipGrid(seeds, resolution);
  const neighborSets = findNeighbors(grid, cols, rows, actualCount);
  const polygons = buildPolygons(grid, cols, rows, resolution, actualCount);

  // Filter out degenerate sections (too small / no polygon)
  const validIndices: number[] = [];
  const indexMap = new Map<number, number>(); // old index → new index

  for (let i = 0; i < actualCount; i++) {
    if (polygons[i].length >= 3) {
      indexMap.set(i, validIndices.length);
      validIndices.push(i);
    }
  }

  const sections: LayoutSection[] = validIndices.map((oldIdx, newIdx) => ({
    id: newIdx,
    polygon: polygons[oldIdx],
    center: centroid(polygons[oldIdx]),
    neighbors: [...neighborSets[oldIdx]]
      .filter((n) => indexMap.has(n))
      .map((n) => indexMap.get(n)!),
  }));

  return {
    sections,
    width: WINDOW_WIDTH,
    height: TOTAL_HEIGHT,
    outlinePath: buildOutlinePath(),
  };
}

/**
 * Section count presets for each window size (3 = Small … 6 = Extra Large).
 * Values are chosen to produce a good visual density within the arched window:
 * roughly size² × 1.0–1.1, then rounded to feel balanced during gameplay.
 */
export const SECTION_COUNTS: Record<number, number> = {
  3: 12,
  4: 18,
  5: 25,
  6: 34,
};
