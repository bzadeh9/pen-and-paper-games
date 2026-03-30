'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
  } | null;
  gameStats: Array<{
    gameType: string;
    wins: number;
    losses: number;
    draws: number;
  }>;
  leaderboardEntry: {
    totalWins: number;
    totalLosses: number;
    totalDraws: number;
    score: number;
  } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/profile')
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setDisplayName(data.profile?.displayName || data.name || '');
          setBio(data.profile?.bio || '');
        });
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, bio }),
    });

    if (res.ok) {
      const updated = await fetch('/api/profile').then((r) => r.json());
      setProfile(updated);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    )
      return;

    setDeleting(true);
    const res = await fetch('/api/profile', { method: 'DELETE' });
    if (res.ok) {
      await signOut({ callbackUrl: '/' });
    }
    setDeleting(false);
  };

  if (status === 'loading' || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-foreground/60">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center bg-background p-4 pt-8">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>

        {/* Profile Info Card */}
        <div className="rounded-lg border border-foreground/20 bg-background p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-periwinkle text-2xl font-bold text-ink-black">
              {(profile.profile?.displayName || profile.name || 'U')
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-periwinkle focus:outline-none focus:ring-1 focus:ring-periwinkle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-periwinkle focus:outline-none focus:ring-1 focus:ring-periwinkle"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="rounded-md bg-periwinkle px-4 py-2 text-sm font-medium text-ink-black hover:bg-periwinkle/80 disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold">
                    {profile.profile?.displayName || profile.name}
                  </h2>
                  <p className="text-sm text-foreground/60">{profile.email}</p>
                  {profile.profile?.bio && (
                    <p className="mt-2 text-foreground/80">
                      {profile.profile.bio}
                    </p>
                  )}
                  <span className="mt-1 inline-block rounded-full bg-tea-green/30 px-2 py-0.5 text-xs font-medium">
                    {profile.role}
                  </span>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-3 block text-sm font-medium text-periwinkle hover:underline"
                  >
                    Edit profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="rounded-lg border border-foreground/20 bg-background p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Game Statistics</h2>
          {profile.gameStats.length === 0 ? (
            <p className="text-foreground/60">No games played yet.</p>
          ) : (
            <div className="space-y-3">
              {profile.gameStats.map((stat) => (
                <div
                  key={stat.gameType}
                  className="flex items-center justify-between rounded-md bg-foreground/5 px-4 py-3"
                >
                  <span className="font-medium capitalize">
                    {stat.gameType.replace(/-/g, ' ')}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-tea-green">
                      {stat.wins}W
                    </span>
                    <span className="text-powder-blush">
                      {stat.losses}L
                    </span>
                    <span className="text-foreground/60">
                      {stat.draws}D
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard Summary */}
        {profile.leaderboardEntry && (
          <div className="rounded-lg border border-foreground/20 bg-background p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Overall Stats</h2>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-periwinkle">
                  {profile.leaderboardEntry.score}
                </p>
                <p className="text-xs text-foreground/60">Score</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-tea-green">
                  {profile.leaderboardEntry.totalWins}
                </p>
                <p className="text-xs text-foreground/60">Wins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-powder-blush">
                  {profile.leaderboardEntry.totalLosses}
                </p>
                <p className="text-xs text-foreground/60">Losses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground/60">
                  {profile.leaderboardEntry.totalDraws}
                </p>
                <p className="text-xs text-foreground/60">Draws</p>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="rounded-lg border border-powder-blush/30 bg-background p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-foreground/60">
            Permanently delete your account and all associated data.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
