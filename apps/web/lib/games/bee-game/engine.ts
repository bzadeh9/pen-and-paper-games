import type {
  Position,
  Player,
  GameState,
  VirtueZone,
} from './types';
import { GRID_SIZE, RUNNER_SPEED, CHASER_SPEED, VIRTUES } from './types';

export class BeeGameEngine {
  private state: GameState;
  private rng: () => number;
  private startingRunner: Player = 1;

  constructor(rng?: () => number) {
    this.rng = rng ?? Math.random;
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    const virtueZones = this.placeVirtueZones();
    const home = this.placeHome(virtueZones);

    return {
      gridSize: GRID_SIZE,
      players: {
        1: {
          position: { row: 0, col: 0 },
          role: this.startingRunner === 1 ? 'runner' : 'chaser',
          collectedVirtues: [],
        },
        2: {
          position: { row: GRID_SIZE - 1, col: GRID_SIZE - 1 },
          role: this.startingRunner === 2 ? 'runner' : 'chaser',
          collectedVirtues: [],
        },
      },
      // Runner always takes the first turn
      currentPlayer: this.startingRunner,
      status: 'setup',
      winner: null,
      virtueZones,
      home,
      moveHistory: [],
      swapCount: 0,
      justSwapped: false,
      runnerSafePosition: null,
      startingRunner: this.startingRunner,
    };
  }

  private placeVirtueZones(): VirtueZone[] {
    const zones: VirtueZone[] = [];
    const occupied = new Set<string>();
    // Reserve corners for players
    occupied.add('0,0');
    occupied.add(`${GRID_SIZE - 1},${GRID_SIZE - 1}`);

    const virtueCount = 6;
    const shuffled = [...VIRTUES].sort(() => this.rng() - 0.5);

    for (let i = 0; i < virtueCount && i < shuffled.length; i++) {
      let pos: Position;
      let key: string;
      let attempts = 0;
      do {
        pos = {
          row: Math.floor(this.rng() * GRID_SIZE),
          col: Math.floor(this.rng() * GRID_SIZE),
        };
        key = `${pos.row},${pos.col}`;
        attempts++;
      } while (occupied.has(key) && attempts < 100);

      occupied.add(key);
      zones.push({ position: pos, virtue: shuffled[i], collected: false });
    }

    return zones;
  }

  /** Place the Home tile adjacent to the chaser's starting corner. Fixed for the entire game. */
  private placeHome(zones: VirtueZone[]): Position {
    const chaserStart = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };
    // Candidate positions adjacent to chaser start
    const candidates: Position[] = [
      { row: chaserStart.row - 1, col: chaserStart.col },
      { row: chaserStart.row, col: chaserStart.col - 1 },
      { row: chaserStart.row - 1, col: chaserStart.col - 1 },
    ];

    const occupied = new Set<string>();
    occupied.add('0,0');
    occupied.add(`${GRID_SIZE - 1},${GRID_SIZE - 1}`);
    for (const z of zones) {
      occupied.add(`${z.position.row},${z.position.col}`);
    }

    for (const pos of candidates) {
      const key = `${pos.row},${pos.col}`;
      if (!occupied.has(key)) return pos;
    }

    // Fallback (should not happen on an 8x8 grid)
    return candidates[0];
  }

  getState(): GameState {
    return {
      ...this.state,
      players: {
        1: {
          ...this.state.players[1],
          position: { ...this.state.players[1].position },
          collectedVirtues: [...this.state.players[1].collectedVirtues],
        },
        2: {
          ...this.state.players[2],
          position: { ...this.state.players[2].position },
          collectedVirtues: [...this.state.players[2].collectedVirtues],
        },
      },
      virtueZones: this.state.virtueZones.map((z) => ({
        ...z,
        position: { ...z.position },
      })),
      home: { ...this.state.home },
      moveHistory: this.state.moveHistory.map((m) => ({
        ...m,
        from: { ...m.from },
        to: { ...m.to },
      })),
      runnerSafePosition: this.state.runnerSafePosition
        ? { ...this.state.runnerSafePosition }
        : null,
    };
  }

  startGame(): void {
    if (this.state.status !== 'setup') return;
    this.state.status = 'playing';
  }

  /**
   * Choose which player starts as runner. Only usable in setup state.
   * Updates roles without re-randomising the board.
   */
  setStartingRunner(player: Player): void {
    if (this.state.status !== 'setup') return;
    this.startingRunner = player;
    this.state.startingRunner = player;
    this.state.players[1].role = player === 1 ? 'runner' : 'chaser';
    this.state.players[2].role = player === 2 ? 'runner' : 'chaser';
    // Runner always goes first
    this.state.currentPlayer = player;
  }

  private isInBounds(pos: Position): boolean {
    return (
      pos.row >= 0 &&
      pos.row < GRID_SIZE &&
      pos.col >= 0 &&
      pos.col < GRID_SIZE
    );
  }

  private getManhattanDistance(a: Position, b: Position): number {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
  }

  private getCurrentSpeed(): number {
    const role = this.state.players[this.state.currentPlayer].role;
    return role === 'runner' ? RUNNER_SPEED : CHASER_SPEED;
  }

  isValidMove(pos: Position): boolean {
    if (this.state.status !== 'playing') return false;
    if (!this.isInBounds(pos)) return false;

    const currentPos = this.state.players[this.state.currentPlayer].position;
    const maxDist = this.getCurrentSpeed();
    const dist = this.getManhattanDistance(currentPos, pos);

    if (dist < 1 || dist > maxDist) return false;

    // Chaser cannot land on uncollected virtue zones or runner's safe position
    if (this.state.players[this.state.currentPlayer].role === 'chaser') {
      if (this.isOnVirtueZone(pos)) return false;
      if (this.isRunnerSafeAt(pos)) return false;
    }

    return true;
  }

  getValidMoves(): Position[] {
    if (this.state.status !== 'playing') return [];

    const currentPos = this.state.players[this.state.currentPlayer].position;
    const maxDist = this.getCurrentSpeed();
    const isChaser =
      this.state.players[this.state.currentPlayer].role === 'chaser';
    const moves: Position[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const pos = { row, col };
        const dist = this.getManhattanDistance(currentPos, pos);
        if (dist >= 1 && dist <= maxDist) {
          // Chaser cannot land on uncollected virtue zones or runner's safe position
          if (isChaser && (this.isOnVirtueZone(pos) || this.isRunnerSafeAt(pos))) continue;
          moves.push(pos);
        }
      }
    }

    return moves;
  }

  private isOnVirtueZone(pos: Position): boolean {
    return this.state.virtueZones.some(
      (z) =>
        !z.collected && z.position.row === pos.row && z.position.col === pos.col
    );
  }

  private isRunnerSafeAt(pos: Position): boolean {
    const safe = this.state.runnerSafePosition;
    return safe !== null && safe.row === pos.row && safe.col === pos.col;
  }

  private getRunnerPlayer(): Player {
    return this.state.players[1].role === 'runner' ? 1 : 2;
  }

  private getChaserPlayer(): Player {
    return this.state.players[1].role === 'chaser' ? 1 : 2;
  }

  private getRandomVirtueZonePosition(): Position {
    const uncollected = this.state.virtueZones.filter((z) => !z.collected);
    if (uncollected.length > 0) {
      const zone = uncollected[Math.floor(this.rng() * uncollected.length)];
      return { ...zone.position };
    }
    // Fallback: center of board
    return {
      row: Math.floor(GRID_SIZE / 2),
      col: Math.floor(GRID_SIZE / 2),
    };
  }

  /** If all virtue zones are collected, spawn a fresh set in new random positions. */
  private respawnVirtuesIfNeeded(): void {
    const allCollected = this.state.virtueZones.every((z) => z.collected);
    if (!allCollected) return;

    const occupied = new Set<string>();
    // Reserve player positions, home tile
    occupied.add(
      `${this.state.players[1].position.row},${this.state.players[1].position.col}`
    );
    occupied.add(
      `${this.state.players[2].position.row},${this.state.players[2].position.col}`
    );
    occupied.add(`${this.state.home.row},${this.state.home.col}`);

    const virtueCount = 6;
    const shuffled = [...VIRTUES].sort(() => this.rng() - 0.5);
    const newZones: VirtueZone[] = [];

    for (let i = 0; i < virtueCount && i < shuffled.length; i++) {
      let pos: Position;
      let key: string;
      let attempts = 0;
      do {
        pos = {
          row: Math.floor(this.rng() * GRID_SIZE),
          col: Math.floor(this.rng() * GRID_SIZE),
        };
        key = `${pos.row},${pos.col}`;
        attempts++;
      } while (occupied.has(key) && attempts < 100);

      occupied.add(key);
      newZones.push({ position: pos, virtue: shuffled[i], collected: false });
    }

    // Replace old collected zones with fresh ones
    this.state.virtueZones = newZones;
  }

  makeMove(pos: Position): boolean {
    if (!this.isValidMove(pos)) return false;

    // Clear swap flag from previous turn
    this.state.justSwapped = false;

    const currentPlayer = this.state.currentPlayer;
    const currentRole = this.state.players[currentPlayer].role;
    const currentPos = this.state.players[currentPlayer].position;
    const opponent: Player = currentPlayer === 1 ? 2 : 1;

    // Runner is leaving their current tile — clear the safe position
    if (currentRole === 'runner') {
      this.state.runnerSafePosition = null;
    }

    // Record the move
    this.state.moveHistory.push({
      player: currentPlayer,
      from: { ...currentPos },
      to: { ...pos },
    });

    // Move to the new position
    this.state.players[currentPlayer].position = { ...pos };

    // Check for virtue zone collection (runner only)
    if (this.state.players[currentPlayer].role === 'runner') {
      const zoneIndex = this.state.virtueZones.findIndex(
        (z) =>
          !z.collected &&
          z.position.row === pos.row &&
          z.position.col === pos.col
      );
      if (zoneIndex !== -1) {
        this.state.virtueZones[zoneIndex].collected = true;
        this.state.players[currentPlayer].collectedVirtues.push(
          this.state.virtueZones[zoneIndex].virtue
        );

        // Runner stays safe on this tile until they move away
        this.state.runnerSafePosition = { ...pos };

        // Respawn new virtues if all are collected
        this.respawnVirtuesIfNeeded();
      }

      // Check if runner reached Home with at least 1 virtue
      if (
        pos.row === this.state.home.row &&
        pos.col === this.state.home.col &&
        this.state.players[currentPlayer].collectedVirtues.length > 0
      ) {
        this.state.status = 'ended';
        this.state.winner = currentPlayer;
        return true;
      }
    }

    // Check for tag (chaser lands on runner)
    const opponentPos = this.state.players[opponent].position;
    if (this.state.players[currentPlayer].role === 'chaser') {
      if (pos.row === opponentPos.row && pos.col === opponentPos.col) {
        // Can't tag on an uncollected virtue zone or runner's safe position
        if (!this.isOnVirtueZone(pos) && !this.isRunnerSafeAt(opponentPos)) {
          this.swapRoles();
          this.state.justSwapped = true;
          this.state.currentPlayer = opponent;
          return true;
        }
      }
    }

    // Switch turns
    this.state.currentPlayer = opponent;
    return true;
  }

  private swapRoles(): void {
    const p1Role = this.state.players[1].role;
    this.state.players[1].role = p1Role === 'runner' ? 'chaser' : 'runner';
    this.state.players[2].role = p1Role === 'runner' ? 'runner' : 'chaser';
    this.state.swapCount++;

    // Clear safe position — the new runner will be placed on a new tile
    this.state.runnerSafePosition = null;

    // New runner starts on a random virtue zone
    const newRunner = this.getRunnerPlayer();
    this.state.players[newRunner].position =
      this.getRandomVirtueZonePosition();
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
