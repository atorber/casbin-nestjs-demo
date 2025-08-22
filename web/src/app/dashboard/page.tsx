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
              <CardTitle>欢迎</CardTitle>
            </CardHeader>
            <CardContent>
              <UserWelcome />
            </CardContent>
          </Card>

          {user?.roles.includes('admin') && (
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  管理系统中的用户和他们的角色。
                </p>
                <a
                  href="/users"
                  className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                >
                  前往用户管理 →
                </a>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>我的资料</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                查看和更新您的个人资料信息。
              </p>
              <a
                href="/profile"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                前往个人资料 →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>存储管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                管理存储路径和访问权限。
              </p>
              <a
                href="/storage"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                前往存储管理 →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 