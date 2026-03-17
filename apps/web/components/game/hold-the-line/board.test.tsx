import { render, screen, fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';
import { GameBoard } from './board';

const audioContextMock = {
  createOscillator: () => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }),
  createGain: () => ({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  }),
  destination: {},
  currentTime: 0,
};

const originalAudioContext = window.AudioContext;
const originalWebkitAudioContext = window.webkitAudioContext;

describe('HoldTheLine GameBoard', () => {
  const defaultProps = {
    player1Color: 'cherryBlossom' as const,
    player2Color: 'dustyMauve' as const,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
  };

  beforeEach(() => {
    // @ts-expect-error AudioContext mock for tests
    window.AudioContext = vi.fn().mockImplementation(() => audioContextMock);
    // @ts-expect-error webkitAudioContext mock for tests
    window.webkitAudioContext = vi.fn().mockImplementation(() => audioContextMock);
  });

  afterEach(() => {
    window.AudioContext = originalAudioContext;
    window.webkitAudioContext = originalWebkitAudioContext;
  });

  it('draws a line after choosing which end to connect from', () => {
    const { container } = render(<GameBoard {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Choose dot row 2 column 2' })
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Choose dot row 2 column 3' })
    );

    expect(container.querySelectorAll('path')).toHaveLength(1);

    fireEvent.click(
      screen.getByRole('button', { name: 'Choose dot row 1 column 2' })
    );

    expect(
      screen.getByRole('button', { name: 'Connect from row 2 column 2' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Connect from row 2 column 3' })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: 'Connect from row 2 column 2' })
    );

    expect(container.querySelectorAll('path')).toHaveLength(2);
    expect(screen.getByText("Player 1's Turn")).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Connect from row 2 column 2' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Choose dot row 1 column 2' })
    ).not.toBeInTheDocument();
  });
});
