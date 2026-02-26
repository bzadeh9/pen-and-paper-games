import type {
  Position,
  Player,
  MazeGameState,
  Bridge,
  RoomPassages,
  Direction,
} from './types';

const OPPOSITE: Record<Direction, Direction> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

const DIR_DELTA: Record<Direction, { dr: number; dc: number }> = {
  north: { dr: -1, dc: 0 },
  south: { dr: 1, dc: 0 },
  east: { dr: 0, dc: 1 },
  west: { dr: 0, dc: -1 },
};

const ALL_DIRS: Direction[] = ['north', 'south', 'east', 'west'];

function pKey(p: Position): string {
  return `${p.row},${p.col}`;
}

function posEq(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export class MazeGameEngine {
  private state: MazeGameState;
  private rng: () => number;

  constructor(rows = 7, cols = 7, rng?: () => number) {
    this.rng = rng ?? Math.random;
    this.state = this.createInitialState(rows, cols);
  }

  private createInitialState(rows: number, cols: number): MazeGameState {
    const passages = this.generateMaze(rows, cols);
    const bridges = this.placeBridges(rows, cols, passages);

    const startPos: Position = { row: 0, col: 0 };
    const endPos: Position = { row: rows - 1, col: cols - 1 };

    return {
      rows,
      cols,
      passages,
      bridges,
      startPos,
      endPos,
      players: {
        1: { ...startPos },
        2: { ...startPos },
      },
      status: 'playing',
      reachedEnd: [],
      moveHistory: [],
    };
  }

  // ─── Maze generation (recursive backtracking / DFS) ───────────────────────

  private generateMaze(rows: number, cols: number): RoomPassages[][] {
    const passages: RoomPassages[][] = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({
        north: false,
        south: false,
        east: false,
        west: false,
      }))
    );

    const visited: boolean[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(false)
    );

    const dfs = (r: number, c: number) => {
      visited[r][c] = true;
      const dirs = this.shuffleArray([...ALL_DIRS]);

      for (const dir of dirs) {
        const { dr, dc } = DIR_DELTA[dir];
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
          passages[r][c][dir] = true;
          passages[nr][nc][OPPOSITE[dir]] = true;
          dfs(nr, nc);
        }
      }
    };

    dfs(0, 0);
    return passages;
  }

  // ─── Bridge placement ─────────────────────────────────────────────────────

  /**
   * Place up to 3 bridges along the critical path.
   * Each bridge has levers placed at distance ≥ 2 from the bridge room,
   * so players must travel some distance to find the matching lever.
   */
  private placeBridges(
    rows: number,
    cols: number,
    passages: RoomPassages[][]
  ): Bridge[] {
    const bridges: Bridge[] = [];
    const start: Position = { row: 0, col: 0 };
    const end: Position = { row: rows - 1, col: cols - 1 };
    const numBridges = 3;

    for (let i = 0; i < numBridges; i++) {
      // BFS treating already-placed bridges as traversable, so we always
      // find the full critical path regardless of previously removed passages.
      const path = this.bfsPathWithBridges(rows, cols, passages, bridges, start, end);
      if (path.length < 5) break;

      // Target position along the path (evenly spaced: 1/4, 1/2, 3/4)
      const frac = (i + 1) / (numBridges + 1);
      const targetIdx = Math.floor(path.length * frac);

      // Search outward from target: try offset=0 (exact), then ±1, ±2, …
      // to find the nearest normal-passage edge in either direction.
      let placed = false;
      for (let offset = 0; offset < path.length && !placed; offset++) {
        // Probe at: targetIdx, targetIdx-offset, targetIdx+offset
        for (const sign of [0, -1, 1]) {
          const idx = targetIdx + sign * offset;
          if (idx < 1 || idx >= path.length - 1) continue;

          const roomA = path[idx];
          const roomB = path[idx + 1];
          const dir = this.getDirection(roomA, roomB);
          if (!dir) continue;

          // Must be a normal (non-bridge) passage
          if (!passages[roomA.row][roomA.col][dir]) continue;

          // Remove the passage to create the bridge gap
          passages[roomA.row][roomA.col][dir] = false;
          passages[roomB.row][roomB.col][OPPOSITE[dir]] = false;

          // Positions already taken by start, end, and previous bridges
          const taken = new Set<string>([
            pKey(start),
            pKey(end),
            pKey(roomA),
            pKey(roomB),
            ...bridges.flatMap((b) => [
              pKey(b.leverA),
              pKey(b.leverB),
              pKey(b.roomA),
              pKey(b.roomB),
            ]),
          ]);

          const leverA = this.findFarLeverRoom(rows, cols, passages, roomA, taken);
          const leverB = this.findFarLeverRoom(rows, cols, passages, roomB, taken);

          if (!leverA || !leverB) {
            // Restore and try the next edge
            passages[roomA.row][roomA.col][dir] = true;
            passages[roomB.row][roomB.col][OPPOSITE[dir]] = true;
            continue;
          }

          bridges.push({
            id: i,
            roomA: { ...roomA },
            roomB: { ...roomB },
            leverA: { ...leverA },
            leverB: { ...leverB },
          });
          placed = true;
          break;
        }
      }
    }

    return bridges;
  }

  /**
   * Find a lever room reachable from `from` via normal passages, at
   * distance ≥ 2 (preferring 2–5 hops), avoiding `taken` positions.
   * Falls back to distance-1 if no farther room is available.
   */
  private findFarLeverRoom(
    rows: number,
    cols: number,
    passages: RoomPassages[][],
    from: Position,
    taken: Set<string>
  ): Position | null {
    const visited = new Set<string>([pKey(from)]);
    const queue: Array<{ pos: Position; dist: number }> = [
      { pos: from, dist: 0 },
    ];
    const farCandidates: Position[] = [];
    const nearCandidates: Position[] = [];

    while (queue.length > 0) {
      const { pos, dist } = queue.shift()!;
      if (dist >= 5) continue;

      for (const dir of ALL_DIRS) {
        if (!passages[pos.row][pos.col][dir]) continue;
        const { dr, dc } = DIR_DELTA[dir];
        const next: Position = { row: pos.row + dr, col: pos.col + dc };
        if (next.row < 0 || next.row >= rows || next.col < 0 || next.col >= cols)
          continue;
        const nk = pKey(next);
        if (visited.has(nk)) continue;
        visited.add(nk);

        const nextDist = dist + 1;
        if (!taken.has(nk)) {
          if (nextDist >= 2) farCandidates.push({ ...next });
          else nearCandidates.push({ ...next });
        }
        queue.push({ pos: next, dist: nextDist });
      }
    }

    if (farCandidates.length > 0) {
      return farCandidates[Math.floor(this.rng() * farCandidates.length)];
    }
    if (nearCandidates.length > 0) {
      return nearCandidates[0];
    }
    return null;
  }

  private getDirection(from: Position, to: Position): Direction | null {
    const dr = to.row - from.row;
    const dc = to.col - from.col;
    if (dr === -1 && dc === 0) return 'north';
    if (dr === 1 && dc === 0) return 'south';
    if (dr === 0 && dc === 1) return 'east';
    if (dr === 0 && dc === -1) return 'west';
    return null;
  }

  /** BFS through normal passages only; returns path or []. */
  private bfsPath(
    rows: number,
    cols: number,
    passages: RoomPassages[][],
    start: Position,
    end: Position
  ): Position[] {
    const queue: Position[] = [start];
    const prev = new Map<string, Position | null>();
    prev.set(pKey(start), null);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (cur.row === end.row && cur.col === end.col) {
        const path: Position[] = [];
        let node: Position | null = cur;
        while (node !== null) {
          path.unshift(node);
          node = prev.get(pKey(node)) ?? null;
        }
        return path;
      }

      for (const dir of ALL_DIRS) {
        if (!passages[cur.row][cur.col][dir]) continue;
        const { dr, dc } = DIR_DELTA[dir];
        const nr = cur.row + dr;
        const nc = cur.col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const nk = `${nr},${nc}`;
        if (!prev.has(nk)) {
          prev.set(nk, cur);
          queue.push({ row: nr, col: nc });
        }
      }
    }

    return [];
  }

  /**
   * BFS treating existing bridge crossings as free passages (no lever needed).
   * Used during bridge placement to find the critical path through already-
   * placed bridges so we can position subsequent bridges on it.
   */
  private bfsPathWithBridges(
    rows: number,
    cols: number,
    passages: RoomPassages[][],
    bridges: Bridge[],
    start: Position,
    end: Position
  ): Position[] {
    const queue: Position[] = [{ ...start }];
    const prev = new Map<string, Position | null>();
    prev.set(pKey(start), null);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (cur.row === end.row && cur.col === end.col) {
        const path: Position[] = [];
        let node: Position | null = cur;
        while (node !== null) {
          path.unshift(node);
          node = prev.get(pKey(node)) ?? null;
        }
        return path;
      }

      // Normal passages
      for (const dir of ALL_DIRS) {
        if (!passages[cur.row][cur.col][dir]) continue;
        const { dr, dc } = DIR_DELTA[dir];
        const next: Position = { row: cur.row + dr, col: cur.col + dc };
        if (next.row < 0 || next.row >= rows || next.col < 0 || next.col >= cols)
          continue;
        const nk = pKey(next);
        if (!prev.has(nk)) {
          prev.set(nk, cur);
          queue.push(next);
        }
      }

      // Bridge crossings (treated as always passable during placement)
      for (const bridge of bridges) {
        let next: Position | null = null;
        if (posEq(cur, bridge.roomA)) next = bridge.roomB;
        else if (posEq(cur, bridge.roomB)) next = bridge.roomA;
        if (next) {
          const nk = pKey(next);
          if (!prev.has(nk)) {
            prev.set(nk, cur);
            queue.push({ ...next });
          }
        }
      }
    }

    return [];
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  getState(): MazeGameState {
    return {
      ...this.state,
      passages: this.state.passages.map((row) =>
        row.map((cell) => ({ ...cell }))
      ),
      bridges: this.state.bridges.map((b) => ({
        ...b,
        roomA: { ...b.roomA },
        roomB: { ...b.roomB },
        leverA: { ...b.leverA },
        leverB: { ...b.leverB },
      })),
      players: {
        1: { ...this.state.players[1] },
        2: { ...this.state.players[2] },
      },
      reachedEnd: [...this.state.reachedEnd],
      moveHistory: this.state.moveHistory.map((m) => ({
        ...m,
        from: { ...m.from },
        to: { ...m.to },
      })),
    };
  }

  /**
   * Returns the directions a given player can move right now.
   * Includes normal passage directions and bridge crossings (when the other
   * player is on the matching lever).
   */
  getValidDirectionsForPlayer(player: Player): Direction[] {
    if (this.state.status !== 'playing') return [];

    const cur = this.state.players[player];
    const opponent: Player = player === 1 ? 2 : 1;
    const oppPos = this.state.players[opponent];
    const dirs: Direction[] = [];

    for (const dir of ALL_DIRS) {
      if (this.canMoveInDirection(cur, dir, oppPos)) dirs.push(dir);
    }

    return dirs;
  }

  private canMoveInDirection(
    cur: Position,
    dir: Direction,
    oppPos: Position
  ): boolean {
    const { dr, dc } = DIR_DELTA[dir];
    const target: Position = { row: cur.row + dr, col: cur.col + dc };

    if (
      target.row < 0 ||
      target.row >= this.state.rows ||
      target.col < 0 ||
      target.col >= this.state.cols
    )
      return false;

    // Normal passage
    if (this.state.passages[cur.row][cur.col][dir]) return true;

    // Bridge crossing
    for (const bridge of this.state.bridges) {
      const isCrossing =
        (posEq(cur, bridge.roomA) && posEq(target, bridge.roomB)) ||
        (posEq(cur, bridge.roomB) && posEq(target, bridge.roomA));
      if (isCrossing) {
        // Either lever unlocks the gate in both directions:
        // leverA (side A) held → anyone can cross in either direction
        // leverB (side B) held → anyone can cross in either direction
        return posEq(oppPos, bridge.leverA) || posEq(oppPos, bridge.leverB);
      }
    }

    return false;
  }

  /**
   * Move a specific player one step in `direction`.
   * Both players can move simultaneously (no turn order).
   * Returns true if the move was valid and executed.
   */
  movePlayer(player: Player, direction: Direction): boolean {
    if (this.state.status !== 'playing') return false;

    const cur = this.state.players[player];
    const opponent: Player = player === 1 ? 2 : 1;
    const oppPos = this.state.players[opponent];

    if (!this.canMoveInDirection(cur, direction, oppPos)) return false;

    const { dr, dc } = DIR_DELTA[direction];
    const target: Position = { row: cur.row + dr, col: cur.col + dc };

    this.state.moveHistory.push({
      player,
      from: { ...cur },
      to: { ...target },
    });
    this.state.players[player] = { ...target };

    // Check win condition
    const { endPos } = this.state;
    if (posEq(target, endPos) && !this.state.reachedEnd.includes(player)) {
      this.state.reachedEnd.push(player);
    }
    if (this.state.reachedEnd.length === 2) {
      this.state.status = 'ended';
    }

    return true;
  }

  reset(): void {
    this.state = this.createInitialState(this.state.rows, this.state.cols);
  }

  // Keep bfsPath accessible for tests
  _bfsPath(
    rows: number,
    cols: number,
    passages: RoomPassages[][],
    start: Position,
    end: Position
  ): Position[] {
    return this.bfsPath(rows, cols, passages, start, end);
  }

  /** FOR TESTS ONLY — directly set a player's position. */
  _setPlayerPosition(player: Player, pos: Position): void {
    this.state.players[player] = { ...pos };
  }

  private shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

