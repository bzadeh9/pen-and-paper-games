import { prisma } from './prisma';

/**
 * Record a game result for a user and update their leaderboard entry.
 */
export async function recordGameResult(
  userId: string,
  gameType: string,
  result: 'win' | 'loss' | 'draw'
) {
  const winIncrement = result === 'win' ? 1 : 0;
  const lossIncrement = result === 'loss' ? 1 : 0;
  const drawIncrement = result === 'draw' ? 1 : 0;

  // Upsert per-game stats
  await prisma.gameStats.upsert({
    where: { userId_gameType: { userId, gameType } },
    update: {
      wins: { increment: winIncrement },
      losses: { increment: lossIncrement },
      draws: { increment: drawIncrement },
    },
    create: {
      userId,
      gameType,
      wins: winIncrement,
      losses: lossIncrement,
      draws: drawIncrement,
    },
  });

  // Upsert global leaderboard entry
  // Score formula: 3 points per win, 1 point per draw
  const scoreIncrement = result === 'win' ? 3 : result === 'draw' ? 1 : 0;

  await prisma.leaderboardEntry.upsert({
    where: { userId },
    update: {
      totalWins: { increment: winIncrement },
      totalLosses: { increment: lossIncrement },
      totalDraws: { increment: drawIncrement },
      score: { increment: scoreIncrement },
    },
    create: {
      userId,
      totalWins: winIncrement,
      totalLosses: lossIncrement,
      totalDraws: drawIncrement,
      score: scoreIncrement,
    },
  });
}

/**
 * Get a user's game stats for a specific game type.
 */
export async function getUserGameStats(userId: string, gameType: string) {
  return prisma.gameStats.findUnique({
    where: { userId_gameType: { userId, gameType } },
  });
}

/**
 * Get all game stats for a user.
 */
export async function getAllUserStats(userId: string) {
  return prisma.gameStats.findMany({
    where: { userId },
    orderBy: { gameType: 'asc' },
  });
}

/**
 * Get the user's leaderboard entry with their rank.
 */
export async function getUserLeaderboardRank(userId: string) {
  const entry = await prisma.leaderboardEntry.findUnique({
    where: { userId },
  });

  if (!entry) return null;

  const rank = await prisma.leaderboardEntry.count({
    where: { score: { gt: entry.score } },
  });

  return { ...entry, rank: rank + 1 };
}

/**
 * Get the global leaderboard.
 */
export async function getLeaderboard(limit = 50) {
  return prisma.leaderboardEntry.findMany({
    orderBy: { score: 'desc' },
    take: limit,
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
}
