import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { CasbinService } from '../casbinconfig/casbin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const casbinService = app.get(CasbinService);
  const userRepository = app.get(getRepositoryToken(User));

  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
      roles: ['admin'],
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: 'User123!',
      roles: ['user'],
    },
    {
      username: 'demo',
      email: 'demo@example.com',
      password: 'Demo123!',
      roles: ['user'],
    },
  ];

  for (const userData of users) {
    try {
      // Check if user exists
      let user = await userRepository.findOne({
        where: { username: userData.username },
      });

      if (!user) {
        // Create new user if doesn't exist
        await authService.register(userData);
        console.log(`用户 ${userData.username} 创建成功`);
        user = await userRepository.findOne({
          where: { username: userData.username },
        });
      } else {
        console.log(`用户 ${userData.username} 已存在，正在更新角色...`);
        // Update user roles in the database
        user.roles = userData.roles;
        await userRepository.save(user);
      }

      // Remove existing roles from Casbin
      const existingRoles = await casbinService.getRolesForUser(
        userData.username,
      );
      for (const role of existingRoles) {
        await casbinService.removeRoleForUser(userData.username, role);
      }

      // Add new roles to Casbin
      for (const role of userData.roles) {
        await casbinService.addRoleForUser(userData.username, role);
        console.log(`角色 ${role} 已分配给用户 ${userData.username}`);
      }
    } catch (error) {
      console.error(`处理用户 ${userData.username} 失败:`, error.message);
    }
  }

  await app.close();
}

void bootstrap();
