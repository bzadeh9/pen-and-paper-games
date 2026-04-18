import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Board } from './board';
import type { GameState } from '@/lib/games/nim/types';

function createState(rowStates: boolean[][]): GameState {
  const rows = rowStates.map((row) => row.filter(Boolean).length);
  return {
    rows,
    rowStates,
    currentPlayer: 1,
    status: 'playing',
    loser: null,
    winner: null,
    totalRemaining: rows.reduce((sum, row) => sum + row, 0),
  };
}

describe('Nim Board', () => {
  it('crosses out a line immediately and ends turn with I\'m done', () => {
    const onMove = vi.fn();
    render(
      <Board
        gameState={createState([[true], [true, true, true]])}
        onMove={onMove}
        player1Name="Player 1"
        player2Name="Player 2"
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Cross out line 2 in row 2' })
    );

    expect(
      screen.getByText('Crossed out 1 line in row 2')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cross out line 2 in row 2' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cross out line 1 in row 1' })
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: "I'm done with my turn" }));
    expect(onMove).toHaveBeenCalledWith(1, 1, 1);
  });

  it('locks selection to the same group and only allows subsequent lines', () => {
    const onMove = vi.fn();
    render(
      <Board
        gameState={createState([[true, true], [true, false, true, true, true]])}
        onMove={onMove}
        player1Name="Player 1"
        player2Name="Player 2"
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Cross out line 3 in row 2' })
    );

    expect(
      screen.getByRole('group', { name: /row 2 with 4 lines, active group selected/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cross out line 4 in row 2' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cross out line 5 in row 2' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cross out line 1 in row 1' })
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Cross out line 4 in row 2' })
    );
    expect(
      screen.getByRole('button', { name: 'Cross out line 5 in row 2' })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: "I'm done with my turn" }));
    expect(onMove).toHaveBeenCalledWith(1, 2, 2);
  });
});
