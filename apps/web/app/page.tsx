import Link from 'next/link';
import { games } from '@/config/games';
import { GameIcon, gameColors } from '@/components/game-icon';

// Create a lookup map for quick access to game metadata
const gamesMap = games.reduce((acc, game) => {
  acc[game.id] = game;
  return acc;
}, {} as Record<string, typeof games[0]>);

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
      <main className="w-full max-w-4xl text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          Pen & Paper Games
        </h1>
        <p className="mb-12 text-lg text-foreground/60 md:text-xl">
          Classic games reimagined for the digital age
        </p>

        {/* Game cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const colors = gameColors[game.id] ?? {
              bg: 'bg-foreground/10',
              text: 'text-foreground/60',
            };
            return (
              <Link
                key={game.id}
                href={game.href}
                className="group rounded-lg border border-foreground/20 bg-background p-6 transition-all hover:border-foreground/40 hover:shadow-lg"
              >
                <div
                  className={`mb-3 flex h-16 w-16 items-center justify-center rounded-full ${colors.bg}`}
                >
                  <GameIcon
                    id={game.id}
                    className={`h-8 w-8 ${colors.text}`}
                  />
                </div>
                <h2 className="mb-2 text-2xl font-semibold">{game.name}</h2>
                <p className="text-sm text-foreground/60">{game.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {gamesMap[game.id]?.category}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground/80">
                  <span>Play Now</span>
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            );
          })}

          <div className="rounded-lg border border-dashed border-foreground/20 bg-background/50 p-6 opacity-50">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/10">
              <svg
                className="h-8 w-8 text-foreground/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Coming Soon</h2>
            <p className="text-sm text-foreground/60">
              More games are on the way!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-foreground/40">
          <p>Developed by Leon &amp; Maya 😜</p>
        </div>
      </main>
    </div>
  );
}
