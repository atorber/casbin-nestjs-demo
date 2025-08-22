'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { StoragePathDialog } from '@/components/storage/storage-path-dialog';
import { StoragePermissionDialog } from '@/components/storage/storage-permission-dialog';
import { StoragePathList } from '@/components/storage/storage-path-list';
import { UserStoragePermissions } from '@/components/storage/user-storage-permissions';

interface StoragePath {
  id: number;
  path: string;
  description?: string;
  createdBy?: {
    id: number;
    username: string;
  };
  createdAt: string;
}

interface StoragePermission {
  id: number;
  userId: number;
  storagePathId: number;
  permission: 'read' | 'write';
  grantedAt: string;
  user: {
    id: number;
    username: string;
  };
  storagePath: {
    id: number;
    path: string;
    description?: string;
  };
}

export default function StoragePage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [storagePaths, setStoragePaths] = useState<StoragePath[]>([]);
  const [storagePermissions, setStoragePermissions] = useState<StoragePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStoragePathDialog, setShowStoragePathDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  const isAdmin = user?.roles.includes('admin');

  useEffect(() => {
    if (token && user) {
      loadData();
    }
  }, [token, user]);

  const loadData = async () => {
    console.log('loadData 开始执行');
    console.log('token:', token);
    console.log('isAdmin:', isAdmin);
    console.log('user:', user);
    
    if (!token) {
      console.log('没有 token，退出 loadData');
      return;
    }
    
    try {
      setLoading(true);
      console.log('开始加载数据...');
      
      if (isAdmin) {
        console.log('管理员模式：加载所有数据');
        // 管理员加载所有数据
        const [pathsResponse, permissionsResponse] = await Promise.all([
          apiClient.get('/storage/paths', token),
          apiClient.get('/storage/permissions', token)
        ]);
        console.log('存储路径数据:', pathsResponse.data);
        console.log('权限数据:', permissionsResponse.data);
        setStoragePaths(pathsResponse.data);
        setStoragePermissions(permissionsResponse.data);
      } else {
        console.log('普通用户模式：加载用户权限');
        // 普通用户只加载自己的权限
        const permissionsResponse = await apiClient.get('/storage/my-permissions', token);
        console.log('用户权限数据:', permissionsResponse.data);
        setStoragePermissions(permissionsResponse.data);
      }
      console.log('数据加载完成');
    } catch (error) {
      console.error('加载数据错误:', error);
      toast({
        title: '错误',
        description: '加载存储数据失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStoragePathCreated = (newPath: StoragePath) => {
    setStoragePaths(prev => [newPath, ...prev]);
    setShowStoragePathDialog(false);
    toast({
      title: '成功',
      description: '存储路径创建成功',
    });
  };

  const handleStoragePathDeleted = (pathId: number) => {
    setStoragePaths(prev => prev.filter(path => path.id !== pathId));
    setStoragePermissions(prev => prev.filter(perm => perm.storagePathId !== pathId));
    toast({
      title: '成功',
      description: '存储路径删除成功',
    });
  };

  const handlePermissionGranted = (newPermission: StoragePermission) => {
    setStoragePermissions(prev => [newPermission, ...prev]);
    setShowPermissionDialog(false);
    toast({
      title: '成功',
      description: '权限授予成功',
    });
  };

  const handlePermissionRevoked = async (userId: number, storagePathId: number) => {
    if (!token) return;
    
    try {
      await apiClient.delete(`/storage/permissions/${userId}/${storagePathId}`, token);
      setStoragePermissions(prev => 
        prev.filter(perm => !(perm.userId === userId && perm.storagePathId === storagePathId))
      );
      toast({
        title: '成功',
        description: '权限撤销成功',
      });
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '撤销权限失败',
        variant: 'destructive',
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">正在加载...</h1>
          <p className="text-muted-foreground">正在验证用户信息和加载数据，请稍候</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p className="text-muted-foreground mb-4">您需要登录后才能访问存储管理功能</p>
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            前往登录页面 →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">存储管理</h1>
        {isAdmin && (
          <div className="space-x-2">
            <Button onClick={() => setShowStoragePathDialog(true)}>
              添加存储路径
            </Button>
            <Button onClick={() => setShowPermissionDialog(true)} variant="outline">
              授予权限
            </Button>
          </div>
        )}
      </div>

      {isAdmin ? (
        // 管理员视图
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>存储路径管理</CardTitle>
              <CardDescription>
                管理系统中的所有存储路径
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StoragePathList
                storagePaths={storagePaths}
                onDelete={handleStoragePathDeleted}
                isAdmin={true}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>权限管理</CardTitle>
              <CardDescription>
                管理用户对存储路径的访问权限
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storagePermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {permission.user?.username || `用户ID: ${permission.userId}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {permission.storagePath?.path || `路径ID: ${permission.storagePathId}`}
                      </div>
                      <Badge variant={permission.permission === 'write' ? 'default' : 'secondary'}>
                        {permission.permission === 'write' ? '读写' : '只读'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePermissionRevoked(permission.userId, permission.storagePathId)}
                    >
                      撤销
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        // 普通用户视图
        <Card>
          <CardHeader>
            <CardTitle>我的存储权限</CardTitle>
            <CardDescription>
              查看您有权访问的存储路径
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserStoragePermissions permissions={storagePermissions} />
          </CardContent>
        </Card>
      )}

      {/* 对话框 */}
      {showStoragePathDialog && (
        <StoragePathDialog
          open={showStoragePathDialog}
          onOpenChange={setShowStoragePathDialog}
          onSuccess={handleStoragePathCreated}
        />
      )}

      {showPermissionDialog && (
        <StoragePermissionDialog
          open={showPermissionDialog}
          onOpenChange={setShowPermissionDialog}
          onSuccess={handlePermissionGranted}
          storagePaths={storagePaths}
        />
      )}
    </div>
  );
}
