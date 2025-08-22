'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
  path: z.string().min(1, { message: '存储路径是必填项' }),
  description: z.string().optional(),
  storageInstanceId: z.number().min(1, { message: '请选择对象存储实例' }),
});

interface StorageInstance {
  id: number;
  name: string;
  type: string;
}

interface StoragePathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (storagePath: any) => void;
  storageInstances?: StorageInstance[];
}

export function StoragePathDialog({ open, onOpenChange, onSuccess, storageInstances = [] }: StoragePathDialogProps) {
  const { toast } = useToast();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      path: '',
      description: '',
      storageInstanceId: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await apiClient.post('/storage/paths', values, token);
      onSuccess(response.data);
      form.reset();
    } catch (error: any) {
      toast({
        title: '错误',
        description: error.message || '创建存储路径失败',
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
          <DialogTitle>添加存储路径</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="storageInstanceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>对象存储实例</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择对象存储实例" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storageInstances.map((instance) => (
                        <SelectItem key={instance.id} value={instance.id.toString()}>
                          {instance.name} ({instance.type})
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
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>存储路径</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：/data/documents" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="可选：描述此存储路径的用途" 
                      {...field} 
                    />
                  </FormControl>
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
                {loading ? '创建中...' : '创建'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
