import { prisma } from '@/lib/db';
import { Eye } from 'lucide-react';

export default async function UsersPage() {
<<<<<<< HEAD
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  if (!hasDatabaseUrl) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-black/60">Database is not configured. Connect a DATABASE_URL to load users.</p>
        </div>
      </div>
    );
  }

  const [users, orderCounts] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    }),
    prisma.order.groupBy({
      by: ['customerEmail'],
      _count: { _all: true }
    })
  ]);

  const orderCountByEmail = Object.fromEntries(
    orderCounts
      .filter((entry) => entry.customerEmail)
      .map((entry) => [entry.customerEmail, entry._count._all])
  ) as Record<string, number>;
=======
  const users = await prisma.user.findMany({
    include: { 
      _count: { select: { accounts: true, sessions: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
>>>>>>> b570806 (Temp pre-rebase commit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-black/60">Manage customer accounts and view their orders.</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-black/5 bg-white p-6 text-center text-black/60">
          No users yet. Users will appear here when they create accounts.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-black/5 bg-white shadow-soft">
          <table className="min-w-full text-sm">
            <thead className="text-left text-black/60 border-b border-black/5">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-black/5">
                  <td className="px-4 py-3 font-semibold">{user.name || 'No name'}</td>
                  <td className="px-4 py-3 text-black/70">{user.email || 'No email'}</td>
<<<<<<< HEAD
                  <td className="px-4 py-3 text-black/70">
                    {user.email ? orderCountByEmail[user.email] ?? 0 : 0}
                  </td>
=======
                  <td className="px-4 py-3 text-black/70">{user._count.sessions}</td>
>>>>>>> b570806 (Temp pre-rebase commit)
                  <td className="px-4 py-3 text-black/70 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <a
                        href={`/admin/users/${user.id}`}
                        className="text-green hover:text-green/80 p-1"
                        title="View user details"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
