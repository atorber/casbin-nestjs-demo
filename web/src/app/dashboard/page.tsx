'use client';

import { useAuth } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWelcome } from "@/components/dashboard/user-welcome";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <UserWelcome />
            </CardContent>
          </Card>

          {user?.roles.includes('admin') && (
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage users and their roles in the system.
                </p>
                <a
                  href="/users"
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Go to User Management →
                </a>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and update your profile information.
              </p>
              <a
                href="/profile"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                Go to Profile →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 