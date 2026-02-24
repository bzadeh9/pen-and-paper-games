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

  constructor(rng?: () => number) {
    this.rng = rng ?? Math.random;
    this.state = this.createInitialState();
  }

  private createInitialState(): GameState {
    const virtueZones = this.placeVirtueZones();
    const serviceActivity = this.placeServiceActivity(virtueZones);

    return {
      gridSize: GRID_SIZE,
      players: {
        1: {
          position: { row: 0, col: 0 },
          role: 'runner',
          collectedVirtues: [],
        },
        2: {
          position: { row: GRID_SIZE - 1, col: GRID_SIZE - 1 },
          role: 'chaser',
          collectedVirtues: [],
        },
      },
      currentPlayer: 1,
      status: 'setup',
      winner: null,
      virtueZones,
      serviceActivity,
      moveHistory: [],
      swapCount: 0,
      justSwapped: false,
    };
  }

  private placeVirtueZones(): VirtueZone[] {
    const zones: VirtueZone[] = [];
    const occupied = new Set<string>();
    // Reserve corners for players
    occupied.add('0,0');
    occupied.add(`${GRID_SIZE - 1},${GRID_SIZE - 1}`);

    const virtueCount = 5;
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

  private placeServiceActivity(zones: VirtueZone[]): Position {
    const occupied = new Set<string>();
    occupied.add('0,0');
    occupied.add(`${GRID_SIZE - 1},${GRID_SIZE - 1}`);
    for (const z of zones) {
      occupied.add(`${z.position.row},${z.position.col}`);
    }

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

    return pos;
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
      serviceActivity: { ...this.state.serviceActivity },
      moveHistory: this.state.moveHistory.map((m) => ({
        ...m,
        from: { ...m.from },
        to: { ...m.to },
      })),
    };
  }

  startGame(): void {
    if (this.state.status !== 'setup') return;
    this.state.status = 'playing';
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

    // Chaser cannot land on uncollected virtue zones
    if (
      this.state.players[this.state.currentPlayer].role === 'chaser' &&
      this.isOnVirtueZone(pos)
    ) {
      return false;
    }

    return true;
  }

  getValidMoves(): Position[] {
    if (this.state.status !== 'playing') return [];

    const currentPos = this.state.players[this.state.currentPlayer].position;
    const maxDist = this.getCurrentSpeed();
    const moves: Position[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const pos = { row, col };
        const dist = this.getManhattanDistance(currentPos, pos);
        if (dist >= 1 && dist <= maxDist) {
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

  makeMove(pos: Position): boolean {
    if (!this.isValidMove(pos)) return false;

    // Clear swap flag from previous turn
    this.state.justSwapped = false;

    const currentPlayer = this.state.currentPlayer;
    const currentPos = this.state.players[currentPlayer].position;
    const opponent: Player = currentPlayer === 1 ? 2 : 1;

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
      }

      // Check if runner reached service activity with at least 1 virtue
      if (
        pos.row === this.state.serviceActivity.row &&
        pos.col === this.state.serviceActivity.col &&
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
        // Can't tag in a virtue zone
        if (!this.isOnVirtueZone(pos)) {
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

    // New runner starts on a random virtue zone
    const newRunner = this.getRunnerPlayer();
    this.state.players[newRunner].position =
      this.getRandomVirtueZonePosition();
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}
