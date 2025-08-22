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
    email?: string;
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
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

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

  const handleBatchRevoke = async () => {
    if (!token || selectedPermissions.length === 0) return;
    
    try {
      // 获取选中的权限记录
      const permissionsToRevoke = storagePermissions.filter(perm => 
        selectedPermissions.includes(perm.id)
      );
      
      // 按存储路径分组，因为批量撤销需要相同的storagePathId
      const groupedPermissions = permissionsToRevoke.reduce((acc, perm) => {
        if (!acc[perm.storagePathId]) {
          acc[perm.storagePathId] = [];
        }
        acc[perm.storagePathId].push(perm.userId);
        return acc;
      }, {} as Record<number, number[]>);

      // 批量撤销每个存储路径的权限
      for (const [storagePathId, userIds] of Object.entries(groupedPermissions)) {
        await apiClient.post('/storage/permissions/batch/revoke', {
          userIds,
          storagePathId: parseInt(storagePathId)
        }, token);
      }

      // 从列表中移除已撤销的权限
      setStoragePermissions(prev => 
        prev.filter(perm => !selectedPermissions.includes(perm.id))
      );
      
      // 清空选择
      setSelectedPermissions([]);
      
      toast({
        title: '成功',
        description: `批量撤销了 ${selectedPermissions.length} 个权限`,
      });
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '批量撤销权限失败',
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
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleBatchRevoke}
                    disabled={selectedPermissions.length === 0}
                  >
                    批量撤销 ({selectedPermissions.length})
                  </Button>
                  <Button onClick={() => setShowPermissionDialog(true)}>
                    授予权限
                  </Button>
                </div>
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
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, permission.id]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1">
                          {/* 用户信息和权限类型 */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {permission.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-lg">
                                  {permission.user?.username || `用户ID: ${permission.userId}`}
                                </div>
                                {permission.user?.email && (
                                  <div className="text-sm text-muted-foreground">
                                    {permission.user.email}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge 
                              variant={permission.permission === 'write' ? 'default' : 'secondary'}
                              className="ml-2"
                            >
                              {permission.permission === 'write' ? '读写权限' : '只读权限'}
                            </Badge>
                          </div>
                          
                          {/* 存储路径信息 */}
                          <div className="bg-gray-50 rounded-md p-3 mb-3">
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">存储路径:</span>
                              <span className="ml-2 font-mono text-gray-800">
                                {permission.storagePath?.path || `路径ID: ${permission.storagePathId}`}
                              </span>
                            </div>
                            {permission.storagePath?.description && (
                              <div className="text-sm text-gray-600 mt-1">
                                {permission.storagePath.description}
                              </div>
                            )}
                          </div>
                          
                          {/* 存储实例信息 */}
                          {permission.storagePath?.storageInstance && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-700">存储实例:</span>
                              <span className="text-sm text-gray-800">
                                {permission.storagePath.storageInstance.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {permission.storagePath.storageInstance.type === 'local' ? '本地存储' : 
                                 permission.storagePath.storageInstance.type === 's3' ? 'Amazon S3' :
                                 permission.storagePath.storageInstance.type === 'minio' ? 'MinIO' :
                                 permission.storagePath.storageInstance.type === 'aliyun_oss' ? '阿里云OSS' :
                                 permission.storagePath.storageInstance.type === 'tencent_cos' ? '腾讯云COS' :
                                 permission.storagePath.storageInstance.type === 'qiniu' ? '七牛云' : permission.storagePath.storageInstance.type}
                              </Badge>
                            </div>
                          )}
                          
                          {/* 时间信息 */}
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">权限授予时间:</span> {new Date(permission.grantedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePermissionRevoked(permission.userId, permission.storagePathId)}
                          className="whitespace-nowrap"
                        >
                          撤销权限
                        </Button>
                      </div>
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

