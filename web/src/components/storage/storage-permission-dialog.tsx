'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

// 修改表单结构，支持每个用户的独立权限选择
const formSchema = z.object({
  userPermissions: z.array(z.object({
    userId: z.string(),
    permission: z.enum(['read', 'write']),
  })).min(1, { message: '请至少选择一个用户' }),
  storagePathId: z.string().min(1, { message: '请选择存储路径' }),
});

interface StoragePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (permission: any) => void;
  storagePaths?: Array<{
    id: number;
    path: string;
    description?: string;
  }>;
  storagePathId?: number; // 新增：直接指定存储路径ID
}

interface User {
  id: number;
  username: string;
  email: string;
}

export function StoragePermissionDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  storagePaths,
  storagePathId
}: StoragePermissionDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPermissions: [],
      storagePathId: storagePathId ? storagePathId.toString() : '',
    },
  });

  // 当storagePathId变化时，更新表单值
  useEffect(() => {
    if (storagePathId) {
      form.setValue('storagePathId', storagePathId.toString());
    }
  }, [storagePathId, form]);

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open]);

  const loadUsers = async () => {
    if (!token) return;
    
    try {
      const response = await apiClient.get('/users', token);
      setUsers(response.data as User[]);
    } catch (error) {
      toast({
        title: '错误',
        description: '加载用户列表失败',
        variant: 'destructive',
      });
    }
  };

  // 处理用户选择
  const handleUserSelection = (userId: number, checked: boolean) => {
    const newSelectedUserIds = new Set(selectedUserIds);
    if (checked) {
      newSelectedUserIds.add(userId);
    } else {
      newSelectedUserIds.delete(userId);
    }
    setSelectedUserIds(newSelectedUserIds);
    
    // 更新表单中的用户权限数组
    const userPermissions = Array.from(newSelectedUserIds).map(id => ({
      userId: id.toString(),
      permission: 'read' as const, // 默认只读权限
    }));
    form.setValue('userPermissions', userPermissions);
  };

  // 处理单个用户的权限变更
  const handlePermissionChange = (userId: number, permission: 'read' | 'write') => {
    const currentPermissions = form.getValues('userPermissions');
    const updatedPermissions = currentPermissions.map(up => 
      up.userId === userId.toString() 
        ? { ...up, permission } 
        : up
    );
    form.setValue('userPermissions', updatedPermissions);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // 为每个用户单独创建权限
      const promises = values.userPermissions.map(userPerm => 
        apiClient.post('/storage/permissions', {
          userIds: [parseInt(userPerm.userId)],
          storagePathId: storagePathId || parseInt(values.storagePathId),
          permission: userPerm.permission,
        }, token)
      );
      
      await Promise.all(promises);
      
      onSuccess({ message: '权限授予成功' });
      form.reset();
      setSelectedUserIds(new Set());
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '授予权限失败',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setSelectedUserIds(new Set());
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {storagePathId ? '授予存储路径权限' : '批量授予存储权限'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userPermissions"
              render={() => (
                <FormItem>
                  <FormLabel>选择用户并设置权限（可多选）</FormLabel>
                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
                    {users.map((user) => {
                      const isSelected = selectedUserIds.has(user.id);
                      const userPermission = form.getValues('userPermissions').find(
                        up => up.userId === user.id.toString()
                      );
                      
                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              checked={isSelected}
                              onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`user-${user.id}`} className="text-sm font-medium">
                              {user.username} ({user.email})
                            </label>
                          </div>
                          
                          {isSelected && (
                            <Select
                              value={userPermission?.permission || 'read'}
                              onValueChange={(value: 'read' | 'write') => 
                                handlePermissionChange(user.id, value)
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="read">只读</SelectItem>
                                <SelectItem value="write">读写</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!storagePathId && (
              <FormField
                control={form.control}
                name="storagePathId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择存储路径</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择存储路径" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {storagePaths?.map((path) => (
                          <SelectItem key={path.id} value={path.id.toString()}>
                            {path.path} {path.description && `(${path.description})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading || selectedUserIds.size === 0}>
                {loading ? '授予中...' : (storagePathId ? '授予权限' : '批量授予权限')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
