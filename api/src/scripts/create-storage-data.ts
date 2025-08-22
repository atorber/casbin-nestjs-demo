import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';
import { StoragePermission } from '../storage/entities/storage-path.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const storageService = app.get(StorageService);
  const usersService = app.get(UsersService);

  try {
    console.log('开始创建存储路径...');

    // 创建一些示例存储路径
    const storagePaths = [
      { path: '/data/documents', description: '文档存储目录' },
      { path: '/data/images', description: '图片存储目录' },
      { path: '/data/videos', description: '视频存储目录' },
      { path: '/data/backups', description: '备份存储目录' },
      { path: '/data/temp', description: '临时文件目录' },
    ];

    for (const pathData of storagePaths) {
      try {
        const storagePath = await storageService.createStoragePath(pathData, 1); // 使用 admin 用户 ID
        console.log(`存储路径创建成功: ${storagePath.path}`);
      } catch (error) {
        if (error.message.includes('已存在')) {
          console.log(`存储路径已存在: ${pathData.path}`);
        } else {
          console.error(`创建存储路径失败 ${pathData.path}:`, error.message);
        }
      }
    }

    console.log('开始创建存储权限...');

    // 为不同用户授予不同的权限
    const permissions = [
      { userId: 2, storagePathId: 1, permission: StoragePermission.READ },   // user 用户对 documents 只读
      { userId: 2, storagePathId: 2, permission: StoragePermission.WRITE },  // user 用户对 images 读写
      { userId: 3, storagePathId: 1, permission: StoragePermission.WRITE },  // demo 用户对 documents 读写
      { userId: 3, storagePathId: 3, permission: StoragePermission.READ },   // demo 用户对 videos 只读
    ];

    for (const permData of permissions) {
      try {
        const permission = await storageService.grantPermission(permData);
        console.log(`权限授予成功: 用户 ${permData.userId} 对路径 ${permData.storagePathId} 拥有 ${permData.permission} 权限`);
      } catch (error) {
        if (error.message.includes('已存在')) {
          console.log(`权限已存在: 用户 ${permData.userId} 对路径 ${permData.storagePathId}`);
        } else {
          console.error(`授予权限失败:`, error.message);
        }
      }
    }

    console.log('存储数据初始化完成！');
  } catch (error) {
    console.error('初始化存储数据时发生错误:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
