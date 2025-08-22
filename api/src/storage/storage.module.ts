import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { StoragePath } from './entities/storage-path.entity';
import { StoragePermissionEntity } from './entities/storage-permission.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([StoragePath, StoragePermissionEntity, User]),
  ],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
