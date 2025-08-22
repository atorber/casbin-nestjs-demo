'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';

const storageInstanceSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  description: z.string().optional(),
  type: z.enum(['local', 's3', 'minio', 'aliyun_oss', 'tencent_cos', 'qiniu']),
  config: z.string().optional(),
  isActive: z.boolean().default(true),
});

type StorageInstanceFormData = z.infer<typeof storageInstanceSchema>;

interface StorageInstanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const storageTypeLabels = {
  local: '本地存储',
  s3: 'AWS S3',
  minio: 'MinIO',
  aliyun_oss: '阿里云 OSS',
  tencent_cos: '腾讯云 COS',
  qiniu: '七牛云',
};

export function StorageInstanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: StorageInstanceDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StorageInstanceFormData>({
    resolver: zodResolver(storageInstanceSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'local',
      config: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: StorageInstanceFormData) => {
    if (!token) {
      toast({
        title: '错误',
        description: '请先登录',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // 解析配置 JSON
      let config = {};
      if (data.config) {
        try {
          config = JSON.parse(data.config);
        } catch (error) {
          toast({
            title: '错误',
            description: '配置 JSON 格式不正确',
            variant: 'destructive',
          });
          return;
        }
      }

      const response = await apiClient.post(
        '/storage/instances',
        {
          ...data,
          config,
        },
        token
      );

      toast({
        title: '成功',
        description: '对象存储实例创建成功',
      });

      form.reset();
      onSuccess();
    } catch (error: any) {
      console.error('创建对象存储实例失败:', error);
      toast({
        title: '错误',
        description: error.response?.data?.message || '创建对象存储实例失败',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>添加对象存储实例</DialogTitle>
          <DialogDescription>
            创建新的对象存储实例，用于管理不同类型的存储服务
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>实例名称</FormLabel>
                  <FormControl>
                    <Input placeholder="输入实例名称" {...field} />
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
                      placeholder="输入实例描述（可选）"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>存储类型</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择存储类型" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(storageTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
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
              name="config"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>配置 (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='{"key": "value"}'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    输入 JSON 格式的配置信息（可选）
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '创建中...' : '创建实例'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
