import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeAll } from 'vitest';
import StainedGlassGame from './stained-glass-game';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('StainedGlassGame', () => {
  it('defaults to reverse stained glass mode', () => {
    render(<StainedGlassGame />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Reverse Stained Glass' })
    ).toBeDefined();
    expect(
      screen.getByRole('radio', {
        name: /Reverse Stained Glass: Cannot color next to yourself/i,
      })
    ).toBeChecked();
    expect(
      screen.getByRole('radio', {
        name: /Stained Glass: Cannot color next to opponent/i,
      })
    ).not.toBeChecked();
  });

  it('shows possible moves only in easy mode', () => {
    render(<StainedGlassGame />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));

    expect(
      screen
        .getAllByRole('gridcell')
        .every((cell) => cell.getAttribute('aria-label')?.includes('uncolored'))
    ).toBe(true);

    fireEvent.click(screen.getByLabelText(/Easy Mode:/i));

    expect(
      screen
        .getAllByRole('gridcell')
        .some((cell) => cell.getAttribute('aria-label')?.includes('available'))
    ).toBe(true);
  });

  it('clears player placements when starting a new game mid-match', () => {
    render(<StainedGlassGame />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));

    fireEvent.click(screen.getAllByRole('gridcell')[0]);

    expect(screen.getByRole('gridcell', { name: /colored by Player 1/i })).toBeDefined();
    expect(screen.getByText('New Game')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'New Game' }));

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDefined();
    expect(screen.queryByRole('gridcell', { name: /colored by Player/i })).toBeNull();
    expect(screen.getAllByText('0 panes')).toHaveLength(2);
  });
});
