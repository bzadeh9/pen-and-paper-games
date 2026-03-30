import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      gameStats: true,
      leaderboardEntry: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    profile: user.profile,
    gameStats: user.gameStats,
    leaderboardEntry: user.leaderboardEntry,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { displayName, avatarUrl, bio } = await req.json();

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      ...(displayName !== undefined && { displayName }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bio !== undefined && { bio }),
    },
    create: {
      userId: session.user.id,
      displayName,
      avatarUrl,
      bio,
    },
  });

  if (displayName) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: displayName },
    });
  }

  return NextResponse.json(profile);
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.delete({
    where: { id: session.user.id },
  });

  return NextResponse.json({ message: 'Account deleted' });
}
