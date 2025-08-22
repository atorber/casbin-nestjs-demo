'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, deleteUser } from '@/lib/api-client';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserDialog } from './user-dialog';
import { UserRolesDialog } from './user-roles-dialog';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function UserList({ token }: { token: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取用户列表失败');
      toast({
        variant: 'destructive',
        title: '错误',
        description: err instanceof Error ? err.message : '获取用户列表失败',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(token, user.id);
      toast({
        title: '成功',
        description: `用户 ${user.username} 已被删除。`,
      });
      fetchUsers();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: '错误',
        description: err instanceof Error ? err.message : '删除用户失败',
      });
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditRoles = (user: User) => {
    setSelectedUser(user);
    setIsRolesDialogOpen(true);
  };

  if (loading) {
    return <div className="p-4">正在加载用户...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>角色</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.roles.join(', ')}</TableCell>
              <TableCell>{user.isActive ? '激活' : '未激活'}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(user)}
                >
                  编辑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditRoles(user)}
                >
                  角色
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user)}
                >
                  删除
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserDialog
        user={selectedUser}
        token={token}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={fetchUsers}
      />

      <UserRolesDialog
        user={selectedUser}
        token={token}
        open={isRolesDialogOpen}
        onOpenChange={setIsRolesDialogOpen}
        onSuccess={fetchUsers}
      />
    </div>
  );
} 