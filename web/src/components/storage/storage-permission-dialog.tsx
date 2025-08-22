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

const formSchema = z.object({
  userId: z.string().min(1, { message: '请选择用户' }),
  storagePathId: z.string().min(1, { message: '请选择存储路径' }),
  permission: z.enum(['read', 'write'], { message: '请选择权限类型' }),
});

interface StoragePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (permission: any) => void;
  storagePaths: Array<{
    id: number;
    path: string;
    description?: string;
  }>;
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
  storagePaths 
}: StoragePermissionDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: '',
      storagePathId: '',
      permission: 'read',
    },
  });

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await apiClient.post('/storage/permissions', {
        userId: parseInt(values.userId),
        storagePathId: parseInt(values.storagePathId),
        permission: values.permission,
      }, token);
      onSuccess(response.data);
      form.reset();
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
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>授予存储权限</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>选择用户</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择用户" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      {storagePaths.map((path) => (
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
            <FormField
              control={form.control}
              name="permission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>权限类型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择权限类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="read">只读</SelectItem>
                      <SelectItem value="write">读写</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '授予中...' : '授予权限'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
