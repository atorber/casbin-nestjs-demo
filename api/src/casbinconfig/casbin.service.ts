import { Injectable, OnModuleInit } from '@nestjs/common';
import { newEnforcer } from 'casbin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class CasbinService implements OnModuleInit {
  private enforcer: any;

  async onModuleInit() {
    // Try to find the config files in both development and production paths
    const isDevelopment = process.env.NODE_ENV !== 'production';
    let modelPath: string;
    let policyPath: string;

    if (isDevelopment) {
      modelPath = path.join(process.cwd(), 'src', 'casbinconfig', 'model.conf');
      policyPath = path.join(process.cwd(), 'src', 'casbinconfig', 'policy.csv');
    } else {
      modelPath = path.join(__dirname, 'model.conf');
      policyPath = path.join(__dirname, 'policy.csv');
    }

    // Verify that the files exist
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Casbin model file not found at ${modelPath}`);
    }
    if (!fs.existsSync(policyPath)) {
      throw new Error(`Casbin policy file not found at ${policyPath}`);
    }

    // Initialize the Casbin enforcer
    this.enforcer = await newEnforcer(modelPath, policyPath);
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

  async getRolesForUser(user: string): Promise<string[]> {
    return this.enforcer.getRolesForUser(user);
  }

  async getUsersForRole(role: string): Promise<string[]> {
    return this.enforcer.getUsersForRole(role);
  }

  async hasRoleForUser(user: string, role: string): Promise<boolean> {
    return this.enforcer.hasRoleForUser(user, role);
  }
} 