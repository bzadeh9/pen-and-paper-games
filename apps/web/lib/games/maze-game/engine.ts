import type {
  Position,
  Player,
  MazeGameState,
  Gate,
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
    this.addExtraPassages(rows, cols, passages);
    const gates = this.placeGates(rows, cols, passages);

    const startPos: Position = { row: 0, col: 0 };
    const endPos: Position = { row: rows - 1, col: cols - 1 };

    // Collect all taken positions for decoy key placement
    const taken = new Set<string>([
      pKey(startPos),
      pKey(endPos),
      ...gates.flatMap((g) => [
        pKey(g.roomA),
        pKey(g.roomB),
        pKey(g.keyA),
        pKey(g.keyB),
      ]),
    ]);
    const decoyKeys = this.placeDecoyKeys(rows, cols, taken);

    return {
      rows,
      cols,
      passages,
      gates,
      decoyKeys,
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

  // ─── Extra passages (multiple paths) ──────────────────────────────────────

  /**
   * Open additional walls to create multiple paths through the maze.
   * Removes roughly 15% of remaining walls.
   */
  private addExtraPassages(
    rows: number,
    cols: number,
    passages: RoomPassages[][]
  ): void {
    const walls: { r: number; c: number; dir: Direction }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c < cols - 1 && !passages[r][c].east) {
          walls.push({ r, c, dir: 'east' });
        }
        if (r < rows - 1 && !passages[r][c].south) {
          walls.push({ r, c, dir: 'south' });
        }
      }
    }

    // Shuffle and open ~15% of remaining walls
    const shuffled = this.shuffleArray(walls);
    const toOpen = Math.floor(shuffled.length * 0.15);

    for (let i = 0; i < toOpen; i++) {
      const { r, c, dir } = shuffled[i];
      const { dr, dc } = DIR_DELTA[dir];
      passages[r][c][dir] = true;
      passages[r + dr][c + dc][OPPOSITE[dir]] = true;
    }
  }

  // ─── Gate placement ───────────────────────────────────────────────────────

  /**
   * Place up to 3 gates along the critical path.
   * Each gate has keys placed at distance ≥ 2 from the gate room,
   * so players must travel some distance to find the matching key.
   */
  private placeGates(
    rows: number,
    cols: number,
    passages: RoomPassages[][]
  ): Gate[] {
    const gates: Gate[] = [];
    const start: Position = { row: 0, col: 0 };
    const end: Position = { row: rows - 1, col: cols - 1 };
    const numGates = 3;

    for (let i = 0; i < numGates; i++) {
      // BFS treating already-placed gates as traversable, so we always
      // find the full critical path regardless of previously removed passages.
      const path = this.bfsPathWithGates(rows, cols, passages, gates, start, end);
      if (path.length < 5) break;

      // Target position along the path (evenly spaced: 1/4, 1/2, 3/4)
      const frac = (i + 1) / (numGates + 1);
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

          // Must be a normal (non-gate) passage
          if (!passages[roomA.row][roomA.col][dir]) continue;

          // Remove the passage to create the gate gap
          passages[roomA.row][roomA.col][dir] = false;
          passages[roomB.row][roomB.col][OPPOSITE[dir]] = false;

          // Positions already taken by start, end, and previous gates
          const taken = new Set<string>([
            pKey(start),
            pKey(end),
            pKey(roomA),
            pKey(roomB),
            ...gates.flatMap((g) => [
              pKey(g.keyA),
              pKey(g.keyB),
              pKey(g.roomA),
              pKey(g.roomB),
            ]),
          ]);

          const keyA = this.findFarKeyRoom(rows, cols, passages, roomA, taken);
          const keyB = this.findFarKeyRoom(rows, cols, passages, roomB, taken);

          if (!keyA || !keyB) {
            // Restore and try the next edge
            passages[roomA.row][roomA.col][dir] = true;
            passages[roomB.row][roomB.col][OPPOSITE[dir]] = true;
            continue;
          }

          gates.push({
            id: i,
            roomA: { ...roomA },
            roomB: { ...roomB },
            keyA: { ...keyA },
            keyB: { ...keyB },
          });
          placed = true;
          break;
        }
      }
    }

    return gates;
  }

  /**
   * Find a key room reachable from `from` via normal passages, at
   * distance ≥ 2 (preferring 2–5 hops), avoiding `taken` positions.
   * Falls back to distance-1 if no farther room is available.
   */
  private findFarKeyRoom(
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

  // ─── Decoy key placement ─────────────────────────────────────────────────

  /**
   * Place 2–4 decoy keys in random cells that are not already taken.
   */
  private placeDecoyKeys(
    rows: number,
    cols: number,
    taken: Set<string>
  ): Position[] {
    const candidates: Position[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = pKey({ row: r, col: c });
        if (!taken.has(k)) {
          candidates.push({ row: r, col: c });
        }
      }
    }

    const shuffled = this.shuffleArray(candidates);
    const count = Math.min(
      shuffled.length,
      2 + Math.floor(this.rng() * 3) // 2–4 decoy keys
    );
    return shuffled.slice(0, count);
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
   * BFS treating existing gate crossings as free passages (no key needed).
   * Used during gate placement to find the critical path through already-
   * placed gates so we can position subsequent gates on it.
   */
  private bfsPathWithGates(
    rows: number,
    cols: number,
    passages: RoomPassages[][],
    gates: Gate[],
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

      // Gate crossings (treated as always passable during placement)
      for (const gate of gates) {
        let next: Position | null = null;
        if (posEq(cur, gate.roomA)) next = gate.roomB;
        else if (posEq(cur, gate.roomB)) next = gate.roomA;
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
      gates: this.state.gates.map((g) => ({
        ...g,
        roomA: { ...g.roomA },
        roomB: { ...g.roomB },
        keyA: { ...g.keyA },
        keyB: { ...g.keyB },
      })),
      decoyKeys: this.state.decoyKeys.map((k) => ({ ...k })),
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
   * Includes normal passage directions and gate crossings (when the other
   * player is on the matching key).
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

    // Gate crossing
    for (const gate of this.state.gates) {
      const isCrossing =
        (posEq(cur, gate.roomA) && posEq(target, gate.roomB)) ||
        (posEq(cur, gate.roomB) && posEq(target, gate.roomA));
      if (isCrossing) {
        // Either key unlocks the gate in both directions
        return posEq(oppPos, gate.keyA) || posEq(oppPos, gate.keyB);
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
