'use client';

import { Badge } from '@/components/ui/badge';

interface StoragePermission {
  id: number;
  userId: number;
  storagePathId: number;
  permission: 'read' | 'write';
  grantedAt: string;
  storagePath: {
    id: number;
    path: string;
    description?: string;
  };
}

interface UserStoragePermissionsProps {
  permissions: StoragePermission[];
}

export function UserStoragePermissions({ permissions }: UserStoragePermissionsProps) {
  if (permissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        您目前没有任何存储路径的访问权限
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {permissions.map((permission) => (
        <div key={permission.id} className="p-3 border rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">
              {permission.storagePath?.path || `路径ID: ${permission.storagePathId}`}
            </div>
            <Badge variant={permission.permission === 'write' ? 'default' : 'secondary'}>
              {permission.permission === 'write' ? '读写' : '只读'}
            </Badge>
          </div>
          {permission.storagePath?.description && (
            <div className="text-sm text-muted-foreground mb-2">
              {permission.storagePath.description}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            权限授予时间: {new Date(permission.grantedAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
}
