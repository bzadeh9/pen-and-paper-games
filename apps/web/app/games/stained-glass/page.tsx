'use client';

import dynamic from 'next/dynamic';

const StainedGlassGame = dynamic(
  () => import('@/components/game/stained-glass/stained-glass-game'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8 flex items-center justify-center">
        <p className="text-center text-foreground/60">Loading game…</p>
      </div>
    ),
  }
);

export default function StainedGlassPage() {
  return <StainedGlassGame />;
}
