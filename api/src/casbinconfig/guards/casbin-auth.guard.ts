import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CasbinService } from '../casbin.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class CasbinGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private casbinService: CasbinService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Get the required permission from the route handler metadata
    const requiredPermission = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true; // No permission required
    }

    if (!user || !user.username) {
      return false; // No user authenticated
    }

    // Extract object and action from the permission
    const [object, action] = requiredPermission;

    // Check if this is a user-specific operation
    const paramId = request.params.id;
    if (paramId && object === 'users') {
      // If accessing own user data
      if (parseInt(paramId) === user.userId) {
        return this.casbinService.checkPermission(
          user.username,
          'own_user',
          action,
        );
      }
    }

    // For all other cases, check regular permissions
    return this.casbinService.checkPermission(
      user.username,
      object,
      action,
    );
  }
} 