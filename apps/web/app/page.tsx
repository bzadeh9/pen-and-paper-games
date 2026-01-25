import Link from 'next/link';

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
          <Link
            href="/games/hold-the-line"
            className="group rounded-lg border border-foreground/20 bg-background p-6 transition-all hover:border-foreground/40 hover:shadow-lg"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-cherry-blossom/20">
              <svg
                className="h-8 w-8 text-cherry-blossom"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Hold The Line</h2>
            <p className="text-sm text-foreground/60">
              Connect the dots strategically to make the last legal move!
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground/80">
              <span>Play Now</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          {/* Placeholder for future games */}
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
          <p>Developed by Leon &amp; Maya</p>
        </div>
      </main>
    </div>
  );
}
