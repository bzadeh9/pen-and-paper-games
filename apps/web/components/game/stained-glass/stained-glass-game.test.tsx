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
  it('clears player placements when starting a new game mid-match', () => {
    render(<StainedGlassGame />);

    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }));

    const availableCell = screen
      .getAllByRole('gridcell')
      .find((cell) => cell.getAttribute('aria-label')?.includes('available'));

    expect(availableCell).toBeDefined();
    fireEvent.click(availableCell!);

    expect(screen.getByRole('gridcell', { name: /colored by Player 1/i })).toBeDefined();
    expect(screen.getByText('New Game')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'New Game' }));

    expect(screen.getByRole('button', { name: 'Start Game' })).toBeDefined();
    expect(screen.queryByRole('gridcell', { name: /colored by Player/i })).toBeNull();
    expect(screen.getAllByText('0 panes')).toHaveLength(2);
  });
});
