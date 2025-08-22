import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * 装饰器，用于指定路由所需的权限
 * @param object 被访问的资源（例如：'users', 'posts'）
 * @param action 执行的操作（例如：'read', 'write', 'delete'）
 */
export const RequirePermissions = (object: string, action: string) =>
  SetMetadata(PERMISSIONS_KEY, [object, action]);
