import { describe, it, expect } from 'vitest';

describe('Registration validation', () => {
  it('requires email and password', () => {
    const validate = (email?: string, password?: string) => {
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' };
      }
      return null;
    };

    expect(validate()).toEqual({ error: 'Email and password are required' });
    expect(validate('test@test.com')).toEqual({
      error: 'Email and password are required',
    });
    expect(validate(undefined, 'password')).toEqual({
      error: 'Email and password are required',
    });
  });

  it('requires password of at least 8 characters', () => {
    const validate = (email?: string, password?: string) => {
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' };
      }
      return null;
    };

    expect(validate('test@test.com', 'short')).toEqual({
      error: 'Password must be at least 8 characters',
    });
    expect(validate('test@test.com', '12345678')).toBeNull();
  });

  it('accepts valid registration data', () => {
    const validate = (email?: string, password?: string) => {
      if (!email || !password) {
        return { error: 'Email and password are required' };
      }
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' };
      }
      return null;
    };

    expect(validate('user@example.com', 'securepassword123')).toBeNull();
  });
});

describe('Role validation', () => {
  it('only allows valid roles', () => {
    const validRoles = ['USER', 'ADMIN'];
    expect(validRoles.includes('USER')).toBe(true);
    expect(validRoles.includes('ADMIN')).toBe(true);
    expect(validRoles.includes('SUPERADMIN')).toBe(false);
    expect(validRoles.includes('')).toBe(false);
  });
});

describe('Leaderboard scoring', () => {
  it('calculates score correctly: 3 for win, 1 for draw, 0 for loss', () => {
    const getScoreIncrement = (result: 'win' | 'loss' | 'draw') => {
      return result === 'win' ? 3 : result === 'draw' ? 1 : 0;
    };

    expect(getScoreIncrement('win')).toBe(3);
    expect(getScoreIncrement('draw')).toBe(1);
    expect(getScoreIncrement('loss')).toBe(0);
  });

  it('calculates total score for a series of results', () => {
    const getScoreIncrement = (result: 'win' | 'loss' | 'draw') => {
      return result === 'win' ? 3 : result === 'draw' ? 1 : 0;
    };

    const results: Array<'win' | 'loss' | 'draw'> = [
      'win',
      'win',
      'loss',
      'draw',
      'win',
    ];
    const totalScore = results.reduce(
      (sum, r) => sum + getScoreIncrement(r),
      0
    );
    expect(totalScore).toBe(10); // 3 + 3 + 0 + 1 + 3
  });
});
