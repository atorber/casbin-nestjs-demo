import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'Admin123!',
    },
    {
      username: 'user',
      email: 'user@example.com',
      password: 'User123!',
    },
    {
      username: 'demo',
      email: 'demo@example.com',
      password: 'Demo123!',
    },
  ];

  for (const user of users) {
    try {
      await authService.register(user);
      console.log(`User ${user.username} created successfully`);
    } catch (error) {
      console.error(`Failed to create user ${user.username}:`, error.message);
    }
  }

  await app.close();
}

bootstrap(); 