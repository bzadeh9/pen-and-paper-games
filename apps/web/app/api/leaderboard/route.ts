import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gameType = searchParams.get('gameType');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

  if (gameType) {
    // Per-game leaderboard: order by wins in that game type
    const stats = await prisma.gameStats.findMany({
      where: { gameType },
      orderBy: { wins: 'desc' },
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

    return NextResponse.json(
      stats.map((s, index) => ({
        rank: index + 1,
        userId: s.userId,
        name: s.user.profile?.displayName || s.user.name,
        image: s.user.profile?.avatarUrl || s.user.image,
        wins: s.wins,
        losses: s.losses,
        draws: s.draws,
      }))
    );
  }

  // Global leaderboard
  const entries = await prisma.leaderboardEntry.findMany({
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

  return NextResponse.json(
    entries.map((e, index) => ({
      rank: index + 1,
      userId: e.userId,
      name: e.user.profile?.displayName || e.user.name,
      image: e.user.profile?.avatarUrl || e.user.image,
      totalWins: e.totalWins,
      totalLosses: e.totalLosses,
      totalDraws: e.totalDraws,
      score: e.score,
    }))
  );
}
