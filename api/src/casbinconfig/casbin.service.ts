import { Injectable, OnModuleInit } from '@nestjs/common';
import { newEnforcer } from 'casbin';
import * as path from 'path';

@Injectable()
export class CasbinService implements OnModuleInit {
  private enforcer: any;

  async onModuleInit() {
    // Initialize the Casbin enforcer
    this.enforcer = await newEnforcer(
      path.join(__dirname, 'model.conf'),
      path.join(__dirname, 'policy.csv'),
    );
  }

  async checkPermission(
    subject: string,
    object: string,
    action: string,
  ): Promise<boolean> {
    return this.enforcer.enforce(subject, object, action);
  }

  async addPolicy(subject: string, object: string, action: string): Promise<boolean> {
    return this.enforcer.addPolicy(subject, object, action);
  }

  async removePolicy(subject: string, object: string, action: string): Promise<boolean> {
    return this.enforcer.removePolicy(subject, object, action);
  }

  async addRoleForUser(user: string, role: string): Promise<boolean> {
    return this.enforcer.addGroupingPolicy(user, role);
  }

  async removeRoleForUser(user: string, role: string): Promise<boolean> {
    return this.enforcer.removeGroupingPolicy(user, role);
  }
} 