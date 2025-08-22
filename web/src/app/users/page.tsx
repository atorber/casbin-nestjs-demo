'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserList } from '@/components/users/user-list';
import { useAuth } from '@/contexts/auth-context';

export default function UsersPage() {
  const { token } = useAuth();

  return (
    <ProtectedRoute>
      <main className="container mx-auto p-4">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">用户管理</h1>
          {token && <UserList token={token} />}
        </div>
      </main>
    </ProtectedRoute>
  );
} 