import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for a route
 * @param object The resource being accessed (e.g., 'users', 'posts')
 * @param action The action being performed (e.g., 'read', 'write', 'delete')
 */
export const RequirePermissions = (object: string, action: string) =>
  SetMetadata(PERMISSIONS_KEY, [object, action]); 