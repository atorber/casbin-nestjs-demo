'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { StorageInstanceDialog } from '@/components/storage/storage-instance-dialog';
import { StoragePathDialog } from '@/components/storage/storage-path-dialog';
import { StoragePermissionDialog } from '@/components/storage/storage-permission-dialog';
import { StorageInstanceList } from '@/components/storage/storage-instance-list';
import { StoragePathList } from '@/components/storage/storage-path-list';
import { UserStoragePermissions } from '@/components/storage/user-storage-permissions';

import './storage-tabs.css';

interface StorageInstance {
  id: number;
  name: string;
  description?: string;
  type: 'local' | 's3' | 'minio' | 'aliyun_oss' | 'tencent_cos' | 'qiniu';
  config?: Record<string, any>;
  isActive: boolean;
  createdBy?: {
    id: number;
    username: string;
  };
  createdAt: string;
}

interface StoragePath {
  id: number;
  path: string;
  description?: string;
  storageInstanceId: number;
  storageInstance?: StorageInstance;
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
    storageInstance?: StorageInstance;
  };
}

export default function StoragePage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('instances');
  const [storageInstances, setStorageInstances] = useState<StorageInstance[]>([]);
  const [storagePaths, setStoragePaths] = useState<StoragePath[]>([]);
  const [storagePermissions, setStoragePermissions] = useState<StoragePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStorageInstanceDialog, setShowStorageInstanceDialog] = useState(false);
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
        const [instancesResponse, pathsResponse, permissionsResponse] = await Promise.all([
          apiClient.get('/storage/instances', token),
          apiClient.get('/storage/paths', token),
          apiClient.get('/storage/permissions', token)
        ]);
        console.log('对象存储实例数据:', instancesResponse.data);
        console.log('存储路径数据:', pathsResponse.data);
        console.log('第一个路径的存储实例:', (pathsResponse.data as any)[0]?.storageInstance);
        console.log('权限数据:', permissionsResponse.data);
        setStorageInstances(instancesResponse.data as StorageInstance[]);
        setStoragePaths(pathsResponse.data as StoragePath[]);
        setStoragePermissions(permissionsResponse.data as StoragePermission[]);
      } else {
        console.log('普通用户模式：加载用户权限');
        // 普通用户只加载自己的权限
        const permissionsResponse = await apiClient.get('/storage/my-permissions', token);
        console.log('用户权限数据:', permissionsResponse.data);
        setStoragePermissions(permissionsResponse.data as StoragePermission[]);
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

  const handleStorageInstanceCreated = () => {
    setShowStorageInstanceDialog(false);
    loadData();
  };

  const handleStorageInstanceDeleted = async (id: number) => {
    if (!token) return;
    
    try {
      await apiClient.delete(`/storage/instances/${id}`, token);
      toast({
        title: '成功',
        description: '对象存储实例已删除',
      });
      loadData();
    } catch (error) {
      console.error('删除对象存储实例失败:', error);
      toast({
        title: '错误',
        description: '删除对象存储实例失败',
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
          <h1 className="text-3xl font-bold mb-4">请先登录</h1>
          <p className="text-muted-foreground mb-4">您需要登录后才能访问存储管理功能</p>
          <a href="/login" className="text-blue-600 hover:text-blue-800">
            前往登录页面 →
          </a>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // 普通用户视图 - 只显示权限信息
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">我的存储权限</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>存储访问权限</CardTitle>
            <CardDescription>
              查看您有权访问的存储路径和权限级别
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserStoragePermissions permissions={storagePermissions} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 管理员视图 - 使用Tab切换
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">存储管理</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="storage-tabs">
        <TabsList className="storage-tabs-list">
          <TabsTrigger value="instances" className="storage-tabs-trigger">
            对象存储实例
          </TabsTrigger>
          <TabsTrigger value="paths" className="storage-tabs-trigger">
            存储路径管理
          </TabsTrigger>
          <TabsTrigger value="permissions" className="storage-tabs-trigger">
            权限管理
          </TabsTrigger>
        </TabsList>

        {/* 对象存储实例 Tab */}
        <TabsContent value="instances" className="storage-tabs-content space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>对象存储实例</CardTitle>
                  <CardDescription>
                    管理系统中的对象存储实例，包括本地存储、云存储等
                  </CardDescription>
                </div>
                <Button onClick={() => setShowStorageInstanceDialog(true)}>
                  添加对象存储实例
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StorageInstanceList
                storageInstances={storageInstances}
                onDelete={handleStorageInstanceDeleted}
                isAdmin={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 存储路径管理 Tab */}
        <TabsContent value="paths" className="storage-tabs-content space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>存储路径管理</CardTitle>
                  <CardDescription>
                    管理系统中的所有存储路径，配置存储位置和访问规则
                  </CardDescription>
                </div>
                <Button onClick={() => setShowStoragePathDialog(true)}>
                  添加存储路径
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StoragePathList
                storagePaths={storagePaths}
                onDelete={handleStoragePathDeleted}
                isAdmin={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* 权限管理 Tab */}
        <TabsContent value="permissions" className="storage-tabs-content space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>权限管理</CardTitle>
                  <CardDescription>
                    管理用户对存储路径的访问权限，包括读取和写入权限
                  </CardDescription>
                </div>
                <Button onClick={() => setShowPermissionDialog(true)}>
                  授予权限
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storagePermissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无权限记录
                  </div>
                ) : (
                  storagePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="font-medium text-lg">
                            {permission.user?.username || `用户ID: ${permission.userId}`}
                          </div>
                          <Badge variant={permission.permission === 'write' ? 'default' : 'secondary'}>
                            {permission.permission === 'write' ? '读写' : '只读'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">存储路径:</span> {permission.storagePath?.path || `路径ID: ${permission.storagePathId}`}
                        </div>
                        {permission.storagePath?.storageInstance && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">存储实例:</span> {permission.storagePath.storageInstance.name} 
                            <Badge variant="outline" className="ml-2 text-xs">
                              {permission.storagePath.storageInstance.type === 'local' ? '本地存储' : 
                               permission.storagePath.storageInstance.type === 's3' ? 'Amazon S3' :
                               permission.storagePath.storageInstance.type === 'minio' ? 'MinIO' :
                               permission.storagePath.storageInstance.type === 'aliyun_oss' ? '阿里云OSS' :
                               permission.storagePath.storageInstance.type === 'tencent_cos' ? '腾讯云COS' :
                               permission.storagePath.storageInstance.type === 'qiniu' ? '七牛云' : permission.storagePath.storageInstance.type}
                            </Badge>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          授予时间: {new Date(permission.grantedAt).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermissionRevoked(permission.userId, permission.storagePathId)}
                        className="ml-4"
                      >
                        撤销权限
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 对话框 */}
      {showStorageInstanceDialog && (
        <StorageInstanceDialog
          open={showStorageInstanceDialog}
          onOpenChange={setShowStorageInstanceDialog}
          onSuccess={handleStorageInstanceCreated}
        />
      )}

      {showStoragePathDialog && (
        <StoragePathDialog
          open={showStoragePathDialog}
          onOpenChange={setShowStoragePathDialog}
          onSuccess={handleStoragePathCreated}
          storageInstances={storageInstances}
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

