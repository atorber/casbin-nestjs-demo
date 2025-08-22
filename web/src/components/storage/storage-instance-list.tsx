'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Info } from 'lucide-react';

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

interface StorageInstanceListProps {
  storageInstances: StorageInstance[];
  onDelete: (id: number) => void;
  isAdmin: boolean;
}

const storageTypeLabels = {
  local: '本地存储',
  s3: 'AWS S3',
  minio: 'MinIO',
  aliyun_oss: '阿里云 OSS',
  tencent_cos: '腾讯云 COS',
  qiniu: '七牛云',
};

const storageTypeColors = {
  local: 'bg-blue-100 text-blue-800',
  s3: 'bg-orange-100 text-orange-800',
  minio: 'bg-green-100 text-green-800',
  aliyun_oss: 'bg-red-100 text-red-800',
  tencent_cos: 'bg-purple-100 text-purple-800',
  qiniu: 'bg-yellow-100 text-yellow-800',
};

export function StorageInstanceList({
  storageInstances,
  onDelete,
  isAdmin,
}: StorageInstanceListProps) {
  if (storageInstances.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无对象存储实例
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {storageInstances.map((instance) => (
        <Card key={instance.id} className="p-4">
          <CardContent className="p-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{instance.name}</h4>
                  <Badge 
                    variant="outline" 
                    className={storageTypeColors[instance.type]}
                  >
                    {storageTypeLabels[instance.type]}
                  </Badge>
                  {!instance.isActive && (
                    <Badge variant="secondary">已停用</Badge>
                  )}
                </div>
                
                {instance.description && (
                  <p className="text-sm text-muted-foreground">
                    {instance.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {instance.createdBy && (
                    <span>创建者: {instance.createdBy.username}</span>
                  )}
                  <span>创建时间: {new Date(instance.createdAt).toLocaleDateString()}</span>
                </div>

                {instance.config && Object.keys(instance.config).length > 0 && (
                  <div className="text-xs">
                    <details className="cursor-pointer">
                      <summary className="font-medium text-muted-foreground">
                        配置信息
                      </summary>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                        {JSON.stringify(instance.config, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(instance.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
