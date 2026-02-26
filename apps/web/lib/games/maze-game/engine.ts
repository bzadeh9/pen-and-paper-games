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

export class MazeGameEngine {
  private state: MazeGameState;
  private rng: () => number;

  constructor(rows = 7, cols = 7, rng?: () => number) {
    this.rng = rng ?? Math.random;
    this.state = this.createInitialState(rows, cols);
  }

  private createInitialState(rows: number, cols: number): MazeGameState {
    const passages = this.generateMaze(rows, cols);
    const bridges = this.placeBridge(rows, cols, passages);

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
      currentPlayer: 1,
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
      const dirs: Direction[] = this.shuffleArray(['north', 'south', 'east', 'west']);

      for (const dir of dirs) {
        const { dr, dc } = DIR_DELTA[dir];
        const nr = r + dr;
        const nc = c + dc;

        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
          // Remove wall between (r,c) and (nr,nc)
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
   * Find the path from start to end using BFS, then place a bridge on an
   * edge roughly in the middle of that path.  The bridge edge is removed
   * from the normal passages so that cooperation is required to cross it.
   */
  private placeBridge(
    rows: number,
    cols: number,
    passages: RoomPassages[][]
  ): Bridge[] {
    const start: Position = { row: 0, col: 0 };
    const end: Position = { row: rows - 1, col: cols - 1 };

    // BFS to find path from start to end
    const path = this.bfsPath(rows, cols, passages, start, end);
    if (path.length < 4) return []; // maze too small for a bridge

    // Pick an edge roughly in the middle of the path, but avoid being
    // at the very start or end (need at least 1 room on each side for levers).
    const midIdx = Math.floor(path.length / 2);
    const clampedIdx = Math.max(1, Math.min(midIdx, path.length - 3));

    const roomA = path[clampedIdx];
    const roomB = path[clampedIdx + 1];

    // Determine which direction the bridge edge goes (A → B)
    const bridgeDir = this.getDirection(roomA, roomB);
    if (!bridgeDir) return [];

    // Remove the normal passage for this edge
    passages[roomA.row][roomA.col][bridgeDir] = false;
    passages[roomB.row][roomB.col][OPPOSITE[bridgeDir]] = false;

    // Find lever positions: a room adjacent to roomA (reachable from roomA,
    // not through the bridge) and similarly for roomB.
    const leverA = this.findLeverRoom(rows, cols, passages, roomA, roomB);
    const leverB = this.findLeverRoom(rows, cols, passages, roomB, roomA);

    if (!leverA || !leverB) {
      // Could not place levers — restore the passage and skip the bridge
      passages[roomA.row][roomA.col][bridgeDir] = true;
      passages[roomB.row][roomB.col][OPPOSITE[bridgeDir]] = true;
      return [];
    }

    const bridge: Bridge = {
      id: 0,
      roomA: { ...roomA },
      roomB: { ...roomB },
      leverA: { ...leverA },
      leverB: { ...leverB },
    };

    return [bridge];
  }

  /** Find a room adjacent to `from` in the current passage graph, excluding `exclude`. */
  private findLeverRoom(
    rows: number,
    cols: number,
    passages: RoomPassages[][],
    from: Position,
    exclude: Position
  ): Position | null {
    const dirs: Direction[] = ['north', 'south', 'east', 'west'];
    for (const dir of dirs) {
      if (!passages[from.row][from.col][dir]) continue;
      const { dr, dc } = DIR_DELTA[dir];
      const nr = from.row + dr;
      const nc = from.col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (nr === exclude.row && nc === exclude.col) continue;
      return { row: nr, col: nc };
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

  /** BFS; returns the path as an array of positions, or [] if unreachable. */
  private bfsPath(
    rows: number,
    cols: number,
    passages: RoomPassages[][],
    start: Position,
    end: Position
  ): Position[] {
    const queue: Position[] = [start];
    const prev: Map<string, Position | null> = new Map();
    const key = (p: Position) => `${p.row},${p.col}`;
    prev.set(key(start), null);

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (cur.row === end.row && cur.col === end.col) {
        // Reconstruct path
        const path: Position[] = [];
        let node: Position | null = cur;
        while (node !== null) {
          path.unshift(node);
          node = prev.get(key(node)) ?? null;
        }
        return path;
      }

      const dirs: Direction[] = ['north', 'south', 'east', 'west'];
      for (const dir of dirs) {
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
   * Returns all valid destination rooms the current player can move to.
   * Includes normal adjacent rooms and bridge destinations (if lever conditions met).
   */
  getValidMoves(): Position[] {
    if (this.state.status !== 'playing') return [];

    const cur = this.state.players[this.state.currentPlayer];
    const opponent: Player = this.state.currentPlayer === 1 ? 2 : 1;
    const oppPos = this.state.players[opponent];

    const moves: Position[] = [];

    // Normal moves through passages
    const dirs: Direction[] = ['north', 'south', 'east', 'west'];
    for (const dir of dirs) {
      if (!this.state.passages[cur.row][cur.col][dir]) continue;
      const { dr, dc } = DIR_DELTA[dir];
      moves.push({ row: cur.row + dr, col: cur.col + dc });
    }

    // Bridge moves
    for (const bridge of this.state.bridges) {
      const { roomA, roomB, leverA, leverB } = bridge;

      const onRoomA = cur.row === roomA.row && cur.col === roomA.col;
      const onRoomB = cur.row === roomB.row && cur.col === roomB.col;
      const oppOnLeverA = oppPos.row === leverA.row && oppPos.col === leverA.col;
      const oppOnLeverB = oppPos.row === leverB.row && oppPos.col === leverB.col;

      if (onRoomA && oppOnLeverA) {
        moves.push({ ...roomB });
      }
      if (onRoomB && oppOnLeverB) {
        moves.push({ ...roomA });
      }
    }

    return moves;
  }

  isValidMove(pos: Position): boolean {
    return this.getValidMoves().some((m) => m.row === pos.row && m.col === pos.col);
  }

  makeMove(pos: Position): boolean {
    if (!this.isValidMove(pos)) return false;

    const currentPlayer = this.state.currentPlayer;
    const from = { ...this.state.players[currentPlayer] };

    this.state.moveHistory.push({ player: currentPlayer, from, to: { ...pos } });
    this.state.players[currentPlayer] = { ...pos };

    // Check if player reached the end
    const { endPos } = this.state;
    if (pos.row === endPos.row && pos.col === endPos.col) {
      if (!this.state.reachedEnd.includes(currentPlayer)) {
        this.state.reachedEnd.push(currentPlayer);
      }
      // Win when both players have reached the end
      if (this.state.reachedEnd.length === 2) {
        this.state.status = 'ended';
      }
    }

    // Switch turns
    const opponent: Player = currentPlayer === 1 ? 2 : 1;
    this.state.currentPlayer = opponent;

    return true;
  }

  reset(): void {
    this.state = this.createInitialState(this.state.rows, this.state.cols);
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
