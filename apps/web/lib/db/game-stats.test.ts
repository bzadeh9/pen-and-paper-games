import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock factory must not reference top-level variables; use vi.hoisted
const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      gameStats: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
      leaderboardEntry: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/db/prisma', () => ({
  prisma: mockPrisma,
}));

import {
  recordGameResult,
  getUserGameStats,
  getAllUserStats,
  getUserLeaderboardRank,
  getLeaderboard,
} from '@/lib/db/game-stats';

describe('game-stats database logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('recordGameResult', () => {
    it('records a win correctly', async () => {
      mockPrisma.gameStats.upsert.mockResolvedValue({});
      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({});

      await recordGameResult('user1', 'fences', 'win');

      expect(mockPrisma.gameStats.upsert).toHaveBeenCalledWith({
        where: { userId_gameType: { userId: 'user1', gameType: 'fences' } },
        update: {
          wins: { increment: 1 },
          losses: { increment: 0 },
          draws: { increment: 0 },
        },
        create: {
          userId: 'user1',
          gameType: 'fences',
          wins: 1,
          losses: 0,
          draws: 0,
        },
      });

      expect(mockPrisma.leaderboardEntry.upsert).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        update: {
          totalWins: { increment: 1 },
          totalLosses: { increment: 0 },
          totalDraws: { increment: 0 },
          score: { increment: 3 },
        },
        create: {
          userId: 'user1',
          totalWins: 1,
          totalLosses: 0,
          totalDraws: 0,
          score: 3,
        },
      });
    });

    it('records a loss correctly', async () => {
      mockPrisma.gameStats.upsert.mockResolvedValue({});
      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({});

      await recordGameResult('user1', 'sim', 'loss');

      expect(mockPrisma.gameStats.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: {
            wins: { increment: 0 },
            losses: { increment: 1 },
            draws: { increment: 0 },
          },
          create: expect.objectContaining({
            wins: 0,
            losses: 1,
            draws: 0,
          }),
        })
      );

      expect(mockPrisma.leaderboardEntry.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            score: { increment: 0 },
          }),
        })
      );
    });

    it('records a draw correctly with 1-point score increment', async () => {
      mockPrisma.gameStats.upsert.mockResolvedValue({});
      mockPrisma.leaderboardEntry.upsert.mockResolvedValue({});

      await recordGameResult('user1', 'black-hole', 'draw');

      expect(mockPrisma.leaderboardEntry.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            totalDraws: { increment: 1 },
            score: { increment: 1 },
          }),
          create: expect.objectContaining({
            totalDraws: 1,
            score: 1,
          }),
        })
      );
    });
  });

  describe('getUserGameStats', () => {
    it('returns stats for a specific game', async () => {
      const mockStats = {
        id: 'stat1',
        userId: 'user1',
        gameType: 'fences',
        wins: 5,
        losses: 3,
        draws: 1,
      };
      mockPrisma.gameStats.findUnique.mockResolvedValue(mockStats);

      const result = await getUserGameStats('user1', 'fences');

      expect(result).toEqual(mockStats);
      expect(mockPrisma.gameStats.findUnique).toHaveBeenCalledWith({
        where: { userId_gameType: { userId: 'user1', gameType: 'fences' } },
      });
    });

    it('returns null when no stats exist', async () => {
      mockPrisma.gameStats.findUnique.mockResolvedValue(null);

      const result = await getUserGameStats('user1', 'nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getAllUserStats', () => {
    it('returns all stats for a user', async () => {
      const mockStats = [
        { id: '1', userId: 'user1', gameType: 'fences', wins: 5, losses: 3, draws: 1 },
        { id: '2', userId: 'user1', gameType: 'sim', wins: 2, losses: 4, draws: 0 },
      ];
      mockPrisma.gameStats.findMany.mockResolvedValue(mockStats);

      const result = await getAllUserStats('user1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.gameStats.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { gameType: 'asc' },
      });
    });
  });

  describe('getUserLeaderboardRank', () => {
    it('returns entry with correct rank', async () => {
      const mockEntry = {
        id: 'lb1',
        userId: 'user1',
        totalWins: 10,
        totalLosses: 5,
        totalDraws: 2,
        score: 32,
      };
      mockPrisma.leaderboardEntry.findUnique.mockResolvedValue(mockEntry);
      mockPrisma.leaderboardEntry.count.mockResolvedValue(3); // 3 people above

      const result = await getUserLeaderboardRank('user1');

      expect(result).toEqual({ ...mockEntry, rank: 4 });
    });

    it('returns null when user has no leaderboard entry', async () => {
      mockPrisma.leaderboardEntry.findUnique.mockResolvedValue(null);

      const result = await getUserLeaderboardRank('user1');
      expect(result).toBeNull();
    });
  });

  describe('getLeaderboard', () => {
    it('returns top players ordered by score', async () => {
      const mockEntries = [
        { id: '1', userId: 'u1', score: 100, user: { id: 'u1', name: 'Alice', image: null, profile: null } },
        { id: '2', userId: 'u2', score: 80, user: { id: 'u2', name: 'Bob', image: null, profile: null } },
      ];
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue(mockEntries);

      const result = await getLeaderboard(10);

      expect(result).toHaveLength(2);
      expect(mockPrisma.leaderboardEntry.findMany).toHaveBeenCalledWith({
        orderBy: { score: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: { select: { displayName: true, avatarUrl: true } },
            },
          },
        },
      });
    });

    it('uses default limit of 50', async () => {
      mockPrisma.leaderboardEntry.findMany.mockResolvedValue([]);

      await getLeaderboard();

      expect(mockPrisma.leaderboardEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 })
      );
    });
  });
});
