import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CasbinModule } from './casbinconfig/casbin.module';
import { User } from './users/entities/user.entity';
import { StoragePath } from './storage/entities/storage-path.entity';
import { StorageInstance } from './storage/entities/storage-instance.entity';
import { StoragePermissionEntity } from './storage/entities/storage-permission.entity';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { StorageModule } from './storage/storage.module';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'sqlite',
        database: path.join(__dirname, '..', '..', 'db', 'db.sqlite'),
        entities: [User, StoragePath, StorageInstance, StoragePermissionEntity],
        synchronize: false, // Temporarily disabled for migration
        logging: true,
      }),
      inject: [],
    }),
    AuthModule,
    CasbinModule,
    UsersModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
