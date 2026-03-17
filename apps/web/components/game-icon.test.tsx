import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { GameIcon, gameColors } from './game-icon';

describe('GameIcon', () => {
  it('uses tea-green knight chase colors', () => {
    expect(gameColors['knight-chase']).toEqual({
      bg: 'bg-tea-green/20',
      text: 'text-tea-green',
    });
  });

  it('renders the updated knight chase icon path', () => {
    const { container } = render(<GameIcon id="knight-chase" />);
    const path = container.querySelector('path');

    expect(path).toHaveAttribute(
      'd',
      'M7 20h10M9 20v-2.5l-1.5-2V12c0-2.2 1.8-4 4-4h1.5V6.5l1.5-2.5h2l1.5 2.5-2 2v1.5c1.8.9 2.5 2.3 2.5 4v1.5l-1 2V20'
    );
  });
});
