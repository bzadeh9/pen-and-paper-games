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

          <Link
            href="/games/splatter"
            className="group rounded-lg border border-foreground/20 bg-background p-6 transition-all hover:border-foreground/40 hover:shadow-lg"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-dusty-mauve/20">
              <svg
                className="h-8 w-8 text-dusty-mauve"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Splatter</h2>
            <p className="text-sm text-foreground/60">
              Strategic elimination game - be the last one standing!
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground/80">
              <span>Play Now</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/games/knight-chase"
            className="group rounded-lg border border-foreground/20 bg-background p-6 transition-all hover:border-foreground/40 hover:shadow-lg"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-prussian-blue/20">
              <svg
                className="h-8 w-8 text-prussian-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold">Knight Chase</h2>
            <p className="text-sm text-foreground/60">
              Strategic knight movement with a twist!
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground/80">
              <span>Play Now</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

          <Link
            href="/games/ultimate-tic-tac-toe"
            className="group rounded-lg border border-foreground/20 bg-background p-6 transition-all hover:border-foreground/40 hover:shadow-lg"
          >
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-powder-petal/20">
              <svg
                className="h-8 w-8 text-powder-petal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold">
              Ultimate Tic-Tac-Toe
            </h2>
            <p className="text-sm text-foreground/60">
              A strategic twist on the classic game!
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground/80">
              <span>Play Now</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
          </Link>

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
