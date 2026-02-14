import type {
  GameState,
  LocalBoard,
  CellState,
  Position,
  Player,
  LocalBoardState,
  GameMode,
} from './types';

export class UltimateTicTacToeEngine {
  private state: GameState;

  constructor(mode: GameMode = 'standard') {
    this.state = {
      localBoards: this.createEmptyBoards(),
      currentPlayer: 'X',
      mode,
      status: 'setup',
      winner: null,
      activeBoard: null,
      moveHistory: [],
    };
  }

  private createEmptyBoards(): LocalBoard[][] {
    const localBoards: LocalBoard[][] = [];
    for (let i = 0; i < 3; i++) {
      localBoards[i] = [];
      for (let j = 0; j < 3; j++) {
        const cells: CellState[][] = [];
        for (let r = 0; r < 3; r++) {
          cells[r] = [null, null, null];
        }
        localBoards[i][j] = {
          cells,
          winner: null,
        };
      }
    }
    return localBoards;
  }

  getState(): GameState {
    return {
      ...this.state,
      localBoards: this.state.localBoards.map((row) =>
        row.map((board) => ({
          cells: board.cells.map((cellRow) => [...cellRow]),
          winner: board.winner,
        }))
      ),
      activeBoard: this.state.activeBoard
        ? { ...this.state.activeBoard }
        : null,
      moveHistory: [...this.state.moveHistory],
    };
  }

  startGame(): void {
    this.state.status = 'playing';
  }

  setMode(mode: GameMode): void {
    if (this.state.status === 'setup') {
      this.state.mode = mode;
    }
  }

  private checkLocalWinner(board: LocalBoard): LocalBoardState {
    const cells = board.cells;

    // Check rows
    for (let row = 0; row < 3; row++) {
      if (
        cells[row][0] &&
        cells[row][0] === cells[row][1] &&
        cells[row][1] === cells[row][2]
      ) {
        return cells[row][0];
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (
        cells[0][col] &&
        cells[0][col] === cells[1][col] &&
        cells[1][col] === cells[2][col]
      ) {
        return cells[0][col];
      }
    }

    // Check diagonals
    if (
      cells[0][0] &&
      cells[0][0] === cells[1][1] &&
      cells[1][1] === cells[2][2]
    ) {
      return cells[0][0];
    }
    if (
      cells[0][2] &&
      cells[0][2] === cells[1][1] &&
      cells[1][1] === cells[2][0]
    ) {
      return cells[0][2];
    }

    // Check for draw (all cells filled, no winner)
    const isFull = cells.every((row) => row.every((cell) => cell !== null));
    if (isFull) {
      return 'draw';
    }

    return null;
  }

  private checkGlobalWinner(): Player | 'draw' | null {
    const winners = this.state.localBoards.map((row) =>
      row.map((board) => board.winner)
    );

    // Check rows
    for (let row = 0; row < 3; row++) {
      if (
        winners[row][0] &&
        winners[row][0] !== 'draw' &&
        winners[row][0] === winners[row][1] &&
        winners[row][1] === winners[row][2]
      ) {
        return winners[row][0] as Player;
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (
        winners[0][col] &&
        winners[0][col] !== 'draw' &&
        winners[0][col] === winners[1][col] &&
        winners[1][col] === winners[2][col]
      ) {
        return winners[0][col] as Player;
      }
    }

    // Check diagonals
    if (
      winners[0][0] &&
      winners[0][0] !== 'draw' &&
      winners[0][0] === winners[1][1] &&
      winners[1][1] === winners[2][2]
    ) {
      return winners[0][0] as Player;
    }
    if (
      winners[0][2] &&
      winners[0][2] !== 'draw' &&
      winners[0][2] === winners[1][1] &&
      winners[1][1] === winners[2][0]
    ) {
      return winners[0][2] as Player;
    }

    // Check for global draw (all boards have a winner or draw)
    const allBoardsComplete = winners.every((row) =>
      row.every((winner) => winner !== null)
    );
    if (allBoardsComplete) {
      return 'draw';
    }

    return null;
  }

  isValidMove(position: Position): boolean {
    if (this.state.status !== 'playing') return false;

    const { localRow, localCol, cellRow, cellCol } = position;

    // Check if position is within bounds
    if (
      localRow < 0 ||
      localRow >= 3 ||
      localCol < 0 ||
      localCol >= 3 ||
      cellRow < 0 ||
      cellRow >= 3 ||
      cellCol < 0 ||
      cellCol >= 3
    ) {
      return false;
    }

    const localBoard = this.state.localBoards[localRow][localCol];

    // Can't play on a won or drawn board
    if (localBoard.winner !== null) {
      return false;
    }

    // Cell must be empty
    if (localBoard.cells[cellRow][cellCol] !== null) {
      return false;
    }

    // In strict mode, check if this is the active board
    if (this.state.mode === 'strict' && this.state.activeBoard) {
      const { row, col } = this.state.activeBoard;
      // If the active board is won or full, any board is valid
      const activeBoard = this.state.localBoards[row][col];
      if (activeBoard.winner === null) {
        // Must play in the active board
        if (localRow !== row || localCol !== col) {
          return false;
        }
      }
    }

    return true;
  }

  makeMove(position: Position): boolean {
    if (!this.isValidMove(position)) {
      return false;
    }

    const { localRow, localCol, cellRow, cellCol } = position;
    const localBoard = this.state.localBoards[localRow][localCol];

    // Make the move
    localBoard.cells[cellRow][cellCol] = this.state.currentPlayer;
    this.state.moveHistory.push(position);

    // Check if this move won the local board
    const localWinner = this.checkLocalWinner(localBoard);
    if (localWinner) {
      localBoard.winner = localWinner;
    }

    // Check if this move won the global game
    const globalWinner = this.checkGlobalWinner();
    if (globalWinner) {
      this.state.winner = globalWinner;
      this.state.status = 'ended';
      this.state.activeBoard = null;
      return true;
    }

    // Set the next active board for strict mode
    if (this.state.mode === 'strict') {
      // The next player must play in the board at (cellRow, cellCol)
      const nextBoard = this.state.localBoards[cellRow][cellCol];
      if (nextBoard.winner === null) {
        // If the board is still playable, set it as active
        this.state.activeBoard = { row: cellRow, col: cellCol };
      } else {
        // If the board is won or drawn, player can play anywhere
        this.state.activeBoard = null;
      }
    }

    // Switch player
    this.state.currentPlayer = this.state.currentPlayer === 'X' ? 'O' : 'X';

    return true;
  }

  reset(): void {
    const mode = this.state.mode;
    this.state = {
      localBoards: this.createEmptyBoards(),
      currentPlayer: 'X',
      mode,
      status: 'setup',
      winner: null,
      activeBoard: null,
      moveHistory: [],
    };
  }
}
