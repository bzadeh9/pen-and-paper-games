'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { games } from '@/config/games';

interface LeaderboardRow {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  totalWins?: number;
  totalLosses?: number;
  totalDraws?: number;
  score?: number;
  wins?: number;
  losses?: number;
  draws?: number;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<LeaderboardRow[]>([]);
  const [gameType, setGameType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = gameType
      ? `/api/leaderboard?gameType=${encodeURIComponent(gameType)}`
      : '/api/leaderboard';
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [gameType]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center bg-background p-4 pt-8">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
            className="rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm text-foreground focus:border-periwinkle focus:outline-none focus:ring-1 focus:ring-periwinkle"
            aria-label="Filter by game type"
          >
            <option value="">All Games</option>
            {games
              .filter((g) => g.showOnHome !== false)
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
          </select>
        </div>

        <div className="rounded-lg border border-foreground/20 bg-background shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-foreground/60">
              Loading leaderboard…
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-foreground/60">
              No entries yet. Play some games to get on the leaderboard!
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10 text-left text-sm text-foreground/60">
                  <th className="px-4 py-3 font-medium">Rank</th>
                  <th className="px-4 py-3 font-medium">Player</th>
                  {gameType ? (
                    <>
                      <th className="px-4 py-3 text-right font-medium">
                        Wins
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Losses
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Draws
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3 text-right font-medium">
                        Score
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        W / L / D
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isCurrentUser =
                    session?.user?.id === entry.userId;
                  return (
                    <tr
                      key={entry.userId}
                      className={`border-b border-foreground/5 ${
                        isCurrentUser ? 'bg-periwinkle/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                            entry.rank === 1
                              ? 'bg-apricot-cream text-ink-black'
                              : entry.rank === 2
                                ? 'bg-baby-blue-ice text-ink-black'
                                : entry.rank === 3
                                  ? 'bg-tea-green text-ink-black'
                                  : 'bg-foreground/10 text-foreground/60'
                          }`}
                        >
                          {entry.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mauve/30 text-sm font-medium">
                            {(entry.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">
                            {entry.name || 'Anonymous'}
                            {isCurrentUser && (
                              <span className="ml-1 text-xs text-periwinkle">
                                (you)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      {gameType ? (
                        <>
                          <td className="px-4 py-3 text-right text-tea-green">
                            {entry.wins}
                          </td>
                          <td className="px-4 py-3 text-right text-powder-blush">
                            {entry.losses}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground/60">
                            {entry.draws}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 text-right font-semibold text-periwinkle">
                            {entry.score}
                          </td>
                          <td className="px-4 py-3 text-right text-sm">
                            <span className="text-tea-green">
                              {entry.totalWins}
                            </span>{' '}
                            /{' '}
                            <span className="text-powder-blush">
                              {entry.totalLosses}
                            </span>{' '}
                            /{' '}
                            <span className="text-foreground/60">
                              {entry.totalDraws}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
