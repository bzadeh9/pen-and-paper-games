'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
  createdAt: string;
  profile: { displayName: string | null } | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      await fetchUsers();
    }
    setActionLoading(null);
  };

  const handleDelete = async (userId: string, userName: string | null) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName || 'this user'}? This cannot be undone.`
      )
    )
      return;

    setActionLoading(userId);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      await fetchUsers();
    }
    setActionLoading(null);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-foreground/60">Loading…</p>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-foreground/60">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center bg-background p-4 pt-8">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <span className="rounded-full bg-mauve/30 px-3 py-1 text-sm font-medium">
            {users.length} users
          </span>
        </div>

        <div className="rounded-lg border border-foreground/20 bg-background shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-foreground/10 text-left text-sm text-foreground/60">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-foreground/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-periwinkle/30 text-sm font-medium">
                        {(
                          user.profile?.displayName ||
                          user.name ||
                          'U'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <span className="font-medium">
                        {user.profile?.displayName || user.name || 'Unnamed'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/60">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={
                        user.id === session.user.id ||
                        actionLoading === user.id
                      }
                      className="rounded-md border border-foreground/20 bg-background px-2 py-1 text-sm focus:border-periwinkle focus:outline-none disabled:opacity-50"
                      aria-label={`Change role for ${user.name}`}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground/60">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.id !== session.user.id && (
                      <button
                        onClick={() =>
                          handleDelete(user.id, user.name)
                        }
                        disabled={actionLoading === user.id}
                        className="rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
