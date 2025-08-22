import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StorageService } from '../storage/storage.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { StoragePath } from '../storage/entities/storage-path.entity';
import { StorageInstance } from '../storage/entities/storage-instance.entity';
import { StoragePermissionEntity } from '../storage/entities/storage-permission.entity';
import { StoragePermission } from '../storage/entities/storage-permission.enum';
import { StorageInstanceType } from '../storage/entities/storage-instance.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const storageService = app.get(StorageService);
  const storagePathRepository = app.get(getRepositoryToken(StoragePath)) as any;
  const storageInstanceRepository = app.get(
    getRepositoryToken(StorageInstance),
  ) as any;
  const storagePermissionRepository = app.get(
    getRepositoryToken(StoragePermissionEntity),
  ) as any;

  try {
    // Create storage instances
    const instances = [
      {
        name: 'S3-Instance-1',
        type: StorageInstanceType.S3,
        endpoint: 'https://s3.amazonaws.com',
      },
      { name: 'Local-Instance-1', type: StorageInstanceType.LOCAL, endpoint: '/local/storage' },
      {
        name: 'Azure-Instance-1',
        type: StorageInstanceType.ALIYUN_OSS,
        endpoint: 'https://azure.blob.core.windows.net',
      },
    ];

    for (const instanceData of instances) {
      try {
        const existingInstance = await storageInstanceRepository.findOne({
          where: { name: instanceData.name },
        });

        if (!existingInstance) {
          await storageService.createStorageInstance(
            instanceData,
            1,
          );
          console.log(`存储实例 ${instanceData.name} 创建成功`);
        } else {
          console.log(`存储实例 ${instanceData.name} 已存在`);
        }
      } catch (error) {
        console.error(`创建存储实例 ${instanceData.name} 失败:`, (error as any).message);
      }
    }

    // Create storage paths
    const paths = [
      { path: '/documents', name: 'Documents', storageInstanceId: 1 },
      { path: '/images', name: 'Images', storageInstanceId: 1 },
      { path: '/videos', name: 'Videos', storageInstanceId: 1 },
      { path: '/backups', name: 'Backups', storageInstanceId: 2 },
      { path: '/temp', name: 'Temporary', storageInstanceId: 2 },
    ];

    for (const pathData of paths) {
      try {
        const existingPath = await storagePathRepository.findOne({
          where: { path: pathData.path },
        });

        if (!existingPath) {
          await storageService.createStoragePath(pathData, 1);
          console.log(`存储路径 ${pathData.path} 创建成功`);
        } else {
          console.log(`存储路径 ${pathData.path} 已存在`);
        }
      } catch (error) {
        console.error(`创建存储路径 ${pathData.path} 失败:`, (error as any).message);
      }
    }

    // Create storage permissions
    const permissions = [
      { userIds: [2], storagePathId: 1, permission: StoragePermission.READ },
      { userIds: [2], storagePathId: 2, permission: StoragePermission.READ },
      { userIds: [3], storagePathId: 1, permission: StoragePermission.READ },
      { userIds: [3], storagePathId: 3, permission: StoragePermission.READ },
    ];

    for (const permissionData of permissions) {
      try {
        // 检查权限是否已存在（检查第一个用户）
        const existingPermission = await storagePermissionRepository.findOne({
          where: {
            userId: permissionData.userIds[0],
            storagePathId: permissionData.storagePathId,
          },
        });

        if (!existingPermission) {
          await storageService.grantPermission(permissionData);
          console.log(
            `权限授予成功: 用户 ${permissionData.userIds.join(', ')} -> 路径 ${permissionData.storagePathId}`,
          );
        } else {
          console.log(
            `权限已存在: 用户 ${permissionData.userIds.join(', ')} -> 路径 ${permissionData.storagePathId}`,
          );
        }
      } catch (error) {
        console.error(
          `授予权限失败: 用户 ${permissionData.userIds.join(', ')} -> 路径 ${permissionData.storagePathId}:`,
          (error as any).message,
        );
      }
    }

    console.log('存储数据创建完成');
  } catch (error) {
    console.error('创建存储数据时发生错误:', (error as any).message);
  }

  await app.close();
}

void bootstrap();
