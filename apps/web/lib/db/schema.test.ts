import { describe, it, expect } from 'vitest';

describe('Prisma schema validation', () => {
  it('has all required models defined in schema', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Verify all required models exist
    expect(schema).toContain('model User {');
    expect(schema).toContain('model Account {');
    expect(schema).toContain('model Session {');
    expect(schema).toContain('model VerificationToken {');
    expect(schema).toContain('model Profile {');
    expect(schema).toContain('model GameStats {');
    expect(schema).toContain('model LeaderboardEntry {');
  });

  it('has UserRole enum with USER and ADMIN', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    expect(schema).toContain('enum UserRole {');
    expect(schema).toContain('USER');
    expect(schema).toContain('ADMIN');
  });

  it('has unique email constraint on User', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    expect(schema).toMatch(/email\s+String\?\s+@unique/);
  });

  it('has leaderboard indexes for ranking', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    expect(schema).toContain('@@index([score(sort: Desc)])');
    expect(schema).toContain('@@index([totalWins(sort: Desc)])');
  });

  it('has cascade delete relations', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    // Every relation to User should have onDelete: Cascade
    const cascadeCount = (schema.match(/onDelete: Cascade/g) || []).length;
    expect(cascadeCount).toBeGreaterThanOrEqual(5);
  });

  it('has composite unique constraint on GameStats for userId + gameType', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    expect(schema).toContain('@@unique([userId, gameType])');
  });

  it('has password field on User for credential-based auth', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    expect(schema).toMatch(/password\s+String\?/);
  });
});
