'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface StorageInstance {
  id: number;
  name: string;
  type: 'local' | 's3' | 'minio' | 'aliyun_oss' | 'tencent_cos' | 'qiniu';
  description?: string;
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

interface StoragePathListProps {
  storagePaths: StoragePath[];
  onDelete: (pathId: number) => void;
  isAdmin: boolean;
}

export function StoragePathList({ storagePaths, onDelete, isAdmin }: StoragePathListProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // 添加调试日志
  console.log('StoragePathList 接收到的数据:', storagePaths);
  console.log('第一个路径的存储实例信息:', storagePaths[0]?.storageInstance);

  const handleDelete = async (pathId: number) => {
    if (!confirm('确定要删除这个存储路径吗？删除后相关的权限也会被移除。')) {
      return;
    }

    if (!token) return;

    try {
      setDeletingIds(prev => new Set(prev).add(pathId));
      await apiClient.delete(`/storage/paths/${pathId}`, token);
      onDelete(pathId);
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '删除存储路径失败',
        variant: 'destructive',
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(pathId);
        return newSet;
      });
    }
  };

  const getStorageInstanceTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      local: '本地存储',
      s3: 'Amazon S3',
      minio: 'MinIO',
      aliyun_oss: '阿里云OSS',
      tencent_cos: '腾讯云COS',
      qiniu: '七牛云'
    };
    return typeLabels[type] || type;
  };

  if (storagePaths.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无存储路径
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {storagePaths.map((path) => (
        <div key={path.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="font-medium text-lg">{path.path}</div>
              {path.storageInstance && (
                <Badge variant="secondary" className="text-xs">
                  {path.storageInstance.name}
                </Badge>
              )}
            </div>
            
            {path.description && (
              <div className="text-sm text-muted-foreground mb-2">{path.description}</div>
            )}
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {path.storageInstance && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">存储实例:</span>
                  <Badge variant="outline" className="text-xs">
                    {getStorageInstanceTypeLabel(path.storageInstance.type)}
                  </Badge>
                  {path.storageInstance.description && (
                    <span className="ml-1">({path.storageInstance.description})</span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <span className="font-medium">创建者:</span>
                <span>{path.createdBy?.username || '未知用户'}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="font-medium">创建时间:</span>
                <span>{new Date(path.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(path.id)}
              disabled={deletingIds.has(path.id)}
              className="ml-4"
            >
              {deletingIds.has(path.id) ? '删除中...' : '删除'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
