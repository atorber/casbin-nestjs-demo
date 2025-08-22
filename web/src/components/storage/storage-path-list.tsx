'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

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
        <div key={path.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex-1">
            <div className="font-medium">{path.path}</div>
            {path.description && (
              <div className="text-sm text-muted-foreground">{path.description}</div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                创建者: {path.createdBy?.username || '未知用户'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                创建时间: {new Date(path.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(path.id)}
              disabled={deletingIds.has(path.id)}
            >
              {deletingIds.has(path.id) ? '删除中...' : '删除'}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
