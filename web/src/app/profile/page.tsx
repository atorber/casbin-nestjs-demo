'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>我的资料</CardTitle>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  编辑资料
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <ProfileForm
                  user={user}
                  onCancel={() => setIsEditing(false)}
                  onSuccess={() => setIsEditing(false)}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">用户名</label>
                    <p className="mt-1">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">邮箱</label>
                    <p className="mt-1">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">角色</label>
                    <p className="mt-1">{user.roles.join(', ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">账户状态</label>
                    <p className="mt-1">{user.isActive ? '激活' : '未激活'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">注册时间</label>
                    <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 