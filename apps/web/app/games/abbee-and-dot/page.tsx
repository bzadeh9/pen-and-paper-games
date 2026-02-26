import Link from 'next/link';
import { games } from '@/config/games';
import { GameIcon, gameColors } from '@/components/game-icon';

const ayyamIHaGames = games.filter((g) => g.category === 'Ayyam-i-Ha' && g.id !== 'abbee-and-dot');

export default function AbbeeAndDotPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background p-4">
      <main className="w-full max-w-3xl text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${gameColors['abbee-and-dot'].bg}`}
            >
              <GameIcon
                id="abbee-and-dot"
                className={`h-10 w-10 ${gameColors['abbee-and-dot'].text}`}
              />
            </div>
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight">
            Abbee &amp; Dot
          </h1>
          <p className="text-lg text-foreground/60">
            Baha&apos;i Ayyam-i-Ha games featuring Abbee and Dot the bees!
          </p>
        </div>

        {/* Backstory */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-powder-petal/30 px-6 py-5 text-left">
          <h2 className="mb-2 text-lg font-semibold">About Abbee &amp; Dot</h2>
          <p className="text-sm leading-relaxed text-foreground/80">
            Every year during Ayyam-i-Ha, two tiny bees named Abbee and Dot
            wake up from their winter nap and go on adventures across the
            garden. These games follow their journeys — collecting virtues,
            finding hidden gems, and navigating mazes together. Perfect for
            families celebrating the Baha&apos;i Ayyam-i-Ha season!
          </p>
        </div>

        {/* Game cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ayyamIHaGames.map((game) => {
            const colors = gameColors[game.id] ?? {
              bg: 'bg-foreground/10',
              text: 'text-foreground/60',
            };
            return (
              <Link
                key={game.id}
                href={game.href}
                className="group rounded-lg border border-foreground/20 bg-background p-6 text-left transition-all hover:border-foreground/40 hover:shadow-lg"
              >
                <div
                  className={`mb-3 flex h-14 w-14 items-center justify-center rounded-full ${colors.bg}`}
                >
                  <GameIcon id={game.id} className={`h-7 w-7 ${colors.text}`} />
                </div>
                <h2 className="mb-2 text-xl font-semibold">{game.name}</h2>
                <p className="text-sm text-foreground/60">{game.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-foreground/5 px-2 py-1 text-xs font-medium text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
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
        </div>

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-foreground/50 transition-colors hover:text-foreground/80"
          >
            ← Back to all games
          </Link>
        </div>
      </main>
    </div>
  );
}
