'use client';

import React, { useState, useMemo } from 'react';
import { GameCard } from '@/components/game-card';
import { games, type GameCategory } from '@/config/games';

const categories: (GameCategory | 'All')[] = ['All', 'Strategy', 'Puzzle', 'Party', 'Abstract'];

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'All'>('All');

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-foreground/20 bg-background px-4 py-2 text-foreground placeholder:text-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              name={game.name}
              description={game.description}
              href={game.href}
              category={game.category}
              tags={game.tags}
            />
          ))}
        </div>

        {/* No Results Message */}
        {filteredGames.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-foreground/60">
              No games found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}