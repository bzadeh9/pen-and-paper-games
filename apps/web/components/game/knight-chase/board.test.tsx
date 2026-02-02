import { render, screen, fireEvent } from '@testing-library/react';
import { GameBoard } from './board';
import { vi, describe, it, expect } from 'vitest';

// Mock the Web Audio API since it's used in board.tsx
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

// @ts-ignore
window.AudioContext = vi.fn().mockImplementation(() => audioContextMock);
// @ts-ignore
window.webkitAudioContext = vi.fn().mockImplementation(() => audioContextMock);

describe('KnightChase GameBoard', () => {
  const defaultProps = {
    player1Color: 'cherryBlossom' as const,
    player2Color: 'dustyMauve' as const,
    player1Name: 'Player 1',
    player2Name: 'Player 2',
  };

  it('renders start game button initially', () => {
    render(<GameBoard {...defaultProps} />);
    expect(screen.getByText('Start Game')).toBeDefined();
  });

  it('does not show timer', () => {
    render(<GameBoard {...defaultProps} />);
    // Start the game
    fireEvent.click(screen.getByText('Start Game'));
    const timerText = screen.queryByText(/30s/);
    expect(timerText).toBeNull();
  });

  it('renders highlight toggle unchecked by default', () => {
    render(<GameBoard {...defaultProps} />);
    const toggle = screen.getByLabelText('Highlight Possible Moves') as HTMLInputElement;
    expect(toggle).toBeDefined();
    expect(toggle.checked).toBe(false);
  });

  it('toggles highlight state when clicked', () => {
    render(<GameBoard {...defaultProps} />);
    const toggle = screen.getByLabelText('Highlight Possible Moves') as HTMLInputElement;
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(true);
    fireEvent.click(toggle);
    expect(toggle.checked).toBe(false);
  });
  
  it('highlights valid moves only when toggle is enabled', () => {
    const { container } = render(<GameBoard {...defaultProps} />);
    fireEvent.click(screen.getByText('Start Game')); // Start game
    
    // Default: Toggle OFF. No cell should have bg-green-100.
    let highlightedCells = container.querySelectorAll('.bg-green-100');
    expect(highlightedCells.length).toBe(0);
    
    // Enable toggle
    const toggle = screen.getByLabelText('Highlight Possible Moves');
    fireEvent.click(toggle);
    
    highlightedCells = container.querySelectorAll('.bg-green-100');
    // Expect 2 valid moves for Knight at corner (2,1) and (1,2)
    expect(highlightedCells.length).toBe(2);
  });

  it('shows tooltip on invalid move instead of error banner', () => {
    const { container } = render(<GameBoard {...defaultProps} />);
    fireEvent.click(screen.getByText('Start Game')); // Start game
    
    // Before invalid move, no tooltip should be present
    let tooltip = screen.queryByRole('tooltip');
    expect(tooltip).toBeNull();
    
    // Click on an invalid cell (0,1) - not a valid knight move from (0,0)
    const cells = container.querySelectorAll('[class*="relative"]');
    if (cells[1]) {
      fireEvent.click(cells[1]);
    }
    
    // Tooltip should now be visible
    tooltip = screen.queryByRole('tooltip');
    expect(tooltip).not.toBeNull();
    expect(tooltip?.textContent).toContain('Invalid move');
  });

  it('board is responsive with fluid dimensions', () => {
    const { container } = render(<GameBoard {...defaultProps} />);
    
    // Find the board grid element
    const boardGrid = container.querySelector('[style*="aspect-ratio"]');
    expect(boardGrid).toBeDefined();
    
    // Check that aspect ratio is set for responsive square board
    const style = boardGrid?.getAttribute('style');
    expect(style).toContain('aspect-ratio: 1 / 1');
    
    // Check that grid uses fractional units for responsiveness
    expect(style).toContain('repeat(8, minmax(0, 1fr))');
  });
});
