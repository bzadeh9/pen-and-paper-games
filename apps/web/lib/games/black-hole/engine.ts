import type { GameState, Circle, GameMode } from './types';

export class BlackHoleEngine {
  private state: GameState;

  constructor(mode: GameMode = 'lowest') {
    this.state = this.createInitialState(mode);
  }

  private createInitialState(mode: GameMode): GameState {
    const circles: Circle[] = [];
    let id = 0;

    // Create the pyramid: row 0 has 1 circle, row 1 has 2 circles, ..., row 5 has 6 circles
    for (let row = 0; row <= 5; row++) {
      for (let col = 0; col <= row; col++) {
        circles.push({
          id: id++,
          row,
          col,
          value: null,
          owner: null,
        });
      }
    }

    return {
      circles,
      currentPlayer: 1,
      currentTurnNumber: 1,
      player1Counter: 1,
      player2Counter: 1,
      status: 'setup',
      mode,
      blackHoleId: null,
      winner: null,
      player1Score: 0,
      player2Score: 0,
    };
  }

  getState(): GameState {
    return {
      ...this.state,
      circles: this.state.circles.map((c) => ({ ...c })),
    };
  }

  startGame(): void {
    this.state.status = 'playing';
  }

  private getAdjacentCircleIds(circleId: number): number[] {
    const circle = this.state.circles[circleId];
    const { row, col } = circle;
    const adjacent: number[] = [];

    // Same row: (r, c-1) and (r, c+1)
    if (col > 0) {
      const leftId = this.getCircleIdAt(row, col - 1);
      if (leftId !== null) adjacent.push(leftId);
    }
    if (col < row) {
      const rightId = this.getCircleIdAt(row, col + 1);
      if (rightId !== null) adjacent.push(rightId);
    }

    // Row above: (r-1, c-1) and (r-1, c)
    if (row > 0) {
      if (col > 0) {
        const topLeftId = this.getCircleIdAt(row - 1, col - 1);
        if (topLeftId !== null) adjacent.push(topLeftId);
      }
      if (col <= row - 1) {
        const topRightId = this.getCircleIdAt(row - 1, col);
        if (topRightId !== null) adjacent.push(topRightId);
      }
    }

    // Row below: (r+1, c) and (r+1, c+1)
    if (row < 5) {
      const bottomLeftId = this.getCircleIdAt(row + 1, col);
      if (bottomLeftId !== null) adjacent.push(bottomLeftId);
      
      const bottomRightId = this.getCircleIdAt(row + 1, col + 1);
      if (bottomRightId !== null) adjacent.push(bottomRightId);
    }

    return adjacent;
  }

  private getCircleIdAt(row: number, col: number): number | null {
    const circle = this.state.circles.find(
      (c) => c.row === row && c.col === col
    );
    return circle ? circle.id : null;
  }

  isValidMove(circleId: number): boolean {
    if (this.state.status !== 'playing') return false;
    if (circleId < 0 || circleId >= 21) return false;

    const circle = this.state.circles[circleId];
    return circle.value === null;
  }

  makeMove(circleId: number): boolean {
    // Auto-start the game if in setup
    if (this.state.status === 'setup') {
      this.startGame();
    }

    if (!this.isValidMove(circleId)) {
      return false;
    }

    const circle = this.state.circles[circleId];
    const player = this.state.currentPlayer;

    // Place the number
    if (player === 1) {
      circle.value = this.state.player1Counter;
      circle.owner = 1;
      this.state.player1Counter++;
    } else {
      circle.value = this.state.player2Counter;
      circle.owner = 2;
      this.state.player2Counter++;
    }

    // Increment turn number
    this.state.currentTurnNumber++;

    // Check if game is over (20 circles filled)
    const filledCount = this.state.circles.filter((c) => c.value !== null).length;
    if (filledCount === 20) {
      // Find the black hole (empty circle)
      const blackHole = this.state.circles.find((c) => c.value === null);
      if (blackHole) {
        this.state.blackHoleId = blackHole.id;
        this.calculateScores(blackHole.id);
        this.state.status = 'ended';
      }
      return true;
    }

    // Switch player
    this.state.currentPlayer = player === 1 ? 2 : 1;

    return true;
  }

  private calculateScores(blackHoleId: number): void {
    const adjacentIds = this.getAdjacentCircleIds(blackHoleId);
    
    let player1Score = 0;
    let player2Score = 0;

    for (const id of adjacentIds) {
      const circle = this.state.circles[id];
      if (circle.owner === 1 && circle.value !== null) {
        player1Score += circle.value;
      } else if (circle.owner === 2 && circle.value !== null) {
        player2Score += circle.value;
      }
    }

    this.state.player1Score = player1Score;
    this.state.player2Score = player2Score;

    // Determine winner based on game mode
    if (this.state.mode === 'lowest') {
      // Lowest score wins
      if (player1Score < player2Score) {
        this.state.winner = 1;
      } else if (player2Score < player1Score) {
        this.state.winner = 2;
      } else {
        this.state.winner = 'draw';
      }
    } else {
      // Highest score wins
      if (player1Score > player2Score) {
        this.state.winner = 1;
      } else if (player2Score > player1Score) {
        this.state.winner = 2;
      } else {
        this.state.winner = 'draw';
      }
    }
  }

  setMode(mode: GameMode): void {
    this.state.mode = mode;
  }

  reset(): void {
    const mode = this.state.mode;
    this.state = this.createInitialState(mode);
  }
}
