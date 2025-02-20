import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CasbinService } from '../casbin.service';

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
      'permissions',
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

    // Check if user has the required permission
    return this.casbinService.checkPermission(
      user.username,
      object,
      action,
    );
  }
} 