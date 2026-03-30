import { PrismaClient, UserRole } from '../lib/generated/prisma';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed an admin user (password: admin123!)
  const adminPassword = await hash('admin123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@penandpapergames.com' },
    update: {},
    create: {
      email: 'admin@penandpapergames.com',
      name: 'Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
      profile: {
        create: {
          displayName: 'Admin',
        },
      },
      leaderboardEntry: {
        create: {},
      },
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
