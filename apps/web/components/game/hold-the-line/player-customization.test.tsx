import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { PlayerCustomization } from './player-customization';
import { PlayerColor } from '@/lib/games/hold-the-line/types';

describe('PlayerCustomization', () => {
  const defaultProps = {
    playerNumber: 1 as const,
    selectedColor: 'cherryBlossom' as PlayerColor,
    onColorChange: vi.fn(),
  };

  it('should render player name', () => {
    render(<PlayerCustomization {...defaultProps} playerName="Test Player" />);

    expect(screen.getByText('Test Player')).toBeInTheDocument();
  });

  it('should render default player name when not provided', () => {
    render(<PlayerCustomization {...defaultProps} />);

    expect(screen.getByText('Player 1')).toBeInTheDocument();
  });

  it('should allow editing player name when onNameChange is provided', () => {
    const handleNameChange = vi.fn();

    render(
      <PlayerCustomization
        {...defaultProps}
        playerName="Player 1"
        onNameChange={handleNameChange}
      />
    );

    const nameButton = screen.getByRole('button', {
      name: /Edit player 1 name/,
    });
    fireEvent.click(nameButton);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Player 1');

    // Change the name
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(input).toHaveValue('Alice');

    // Submit by pressing Enter
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(handleNameChange).toHaveBeenCalledWith('Alice');
  });

  it('should validate name length (1-20 characters)', () => {
    const handleNameChange = vi.fn();

    render(
      <PlayerCustomization
        {...defaultProps}
        playerName="Player 1"
        onNameChange={handleNameChange}
      />
    );

    const nameButton = screen.getByRole('button', {
      name: /Edit player 1 name/,
    });
    fireEvent.click(nameButton);

    const input = screen.getByDisplayValue('Player 1');

    // Try empty name (just spaces)
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.blur(input);
    expect(handleNameChange).not.toHaveBeenCalled();

    // Open editor again and try valid name
    const nameButtonAgain = screen.getByRole('button', {
      name: /Edit player 1 name/,
    });
    fireEvent.click(nameButtonAgain);
    const inputAgain = screen.getByDisplayValue('Player 1');
    fireEvent.change(inputAgain, { target: { value: 'Bob' } });
    fireEvent.blur(inputAgain);
    expect(handleNameChange).toHaveBeenCalledWith('Bob');
  });

  it('should cancel name edit on Escape key', () => {
    const handleNameChange = vi.fn();

    render(
      <PlayerCustomization
        {...defaultProps}
        playerName="Player 1"
        onNameChange={handleNameChange}
      />
    );

    const nameButton = screen.getByRole('button', {
      name: /Edit player 1 name/,
    });
    fireEvent.click(nameButton);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Name' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // Name should not change
    expect(handleNameChange).not.toHaveBeenCalled();
    expect(screen.getByText('Player 1')).toBeInTheDocument();
  });

  it('should render color selection buttons', () => {
    render(<PlayerCustomization {...defaultProps} />);

    // Should have 5 color buttons (based on PLAYER_COLOR_OPTIONS)
    const colorButtons = screen.getAllByRole('button').filter((button) => {
      return (
        button.title?.includes('Alabaster') ||
        button.title?.includes('Powder') ||
        button.title?.includes('Pastel') ||
        button.title?.includes('Cherry') ||
        button.title?.includes('Dusty')
      );
    });

    expect(colorButtons.length).toBe(5);
  });

  it('should disable color already selected by other player', () => {
    render(
      <PlayerCustomization
        {...defaultProps}
        selectedColor="cherryBlossom"
        otherPlayerColor="dustyMauve"
      />
    );

    const dustyMauveButton = screen.getByRole('button', {
      name: /Dusty Mauve.*unavailable/i,
    });

    expect(dustyMauveButton).toBeDisabled();
    expect(dustyMauveButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should call onColorChange when a color is selected', () => {
    const handleColorChange = vi.fn();

    render(
      <PlayerCustomization
        {...defaultProps}
        onColorChange={handleColorChange}
      />
    );

    const pastelPinkButton = screen.getByRole('button', {
      name: /Pastel Pink/i,
    });

    fireEvent.click(pastelPinkButton);
    expect(handleColorChange).toHaveBeenCalledWith('pastelPink');
  });

  it('should not allow selecting disabled color', () => {
    const handleColorChange = vi.fn();

    render(
      <PlayerCustomization
        {...defaultProps}
        selectedColor="cherryBlossom"
        onColorChange={handleColorChange}
        otherPlayerColor="dustyMauve"
      />
    );

    const dustyMauveButton = screen.getByRole('button', {
      name: /Dusty Mauve.*unavailable/i,
    });

    fireEvent.click(dustyMauveButton);
    // Should not call onColorChange for disabled color
    expect(handleColorChange).not.toHaveBeenCalled();
  });

  it('should show checkmark on selected color', () => {
    render(
      <PlayerCustomization {...defaultProps} selectedColor="cherryBlossom" />
    );

    const cherryBlossomButton = screen.getByRole('button', {
      name: /Cherry Blossom.*selected/i,
    });

    // Check if checkmark is present
    expect(cherryBlossomButton.textContent).toContain('✓');
  });

  it('should use contrasting checkmark color for light backgrounds', () => {
    const { container } = render(
      <PlayerCustomization
        {...defaultProps}
        selectedColor="alabasterGrey" // Light color
      />
    );

    const checkmark = container.querySelector('span[aria-hidden="true"]');
    expect(checkmark).toBeInTheDocument();
    // Should have dark color for light background
    expect(checkmark).toHaveStyle({ color: '#000000' });
  });

  it('should use white checkmark color for dark backgrounds', () => {
    const { container } = render(
      <PlayerCustomization
        {...defaultProps}
        selectedColor="dustyMauve" // Darker color
      />
    );

    const checkmark = container.querySelector('span[aria-hidden="true"]');
    expect(checkmark).toBeInTheDocument();
    // Should have white color for dark background
    expect(checkmark).toHaveStyle({ color: '#FFFFFF' });
  });

  it('should not show name edit UI when onNameChange is not provided', () => {
    render(<PlayerCustomization {...defaultProps} playerName="Player 1" />);

    const nameElement = screen.getByText('Player 1');
    // Should not have click handler attributes when onNameChange is not provided
    expect(nameElement).not.toHaveAttribute('aria-label');
  });
});
