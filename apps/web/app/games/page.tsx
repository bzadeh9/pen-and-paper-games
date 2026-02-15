'use client';

import React from 'react';
import Link from 'next/link';
import { GameCard } from '@/components/game-card';

const games = [
  {
    name: 'Hold the Line',
    description: 'Connect the dots, and be the last one to move!',
    href: '/games/hold-the-line',
  },
  {
    name: 'Ultimate Tic-Tac-Toe',
    description: 'A strategic twist on the classic game!',
    href: '/games/ultimate-tic-tac-toe',
  },
  {
    name: 'Order and Chaos',
    description: 'Asymmetric strategy on a 6x6 grid',
    href: '/games/order-and-chaos',
  },
  {
    name: 'Knight Chase',
    description: 'Strategic knight movement with a twist!',
    href: '/games/knight-chase',
  },
  {
    name: 'Splatter',
    description: 'Strategic elimination - be the last one standing!',
    href: '/games/splatter',
  },
  {
    name: 'Black Hole',
    description: 'A game of reverse-area control',
    href: '/games/black-hole',
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight">
            Pen & Paper Games
          </h1>
          <p className="text-lg text-foreground/60">
            A collection of classic pen and paper games, re-imagined for the web.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard
              key={game.name}
              name={game.name}
              description={game.description}
              href={game.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}