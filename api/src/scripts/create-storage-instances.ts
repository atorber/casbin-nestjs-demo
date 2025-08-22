import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { StorageService } from '../storage/storage.service';
import { StorageInstanceType } from '../storage/entities/storage-instance.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const storageService = app.get(StorageService);

  try {
    console.log('开始创建对象存储实例...');

    // 创建一些示例存储实例
    const instances = [
      {
        name: 'S3-Instance-1',
        type: StorageInstanceType.S3,
        endpoint: 'https://s3.amazonaws.com',
        description: 'Amazon S3 存储实例',
      },
      {
        name: 'Local-Instance-1',
        type: StorageInstanceType.LOCAL,
        endpoint: '/local/storage',
        description: '本地文件系统存储实例',
      },
      {
        name: 'Azure-Instance-1',
        type: StorageInstanceType.ALIYUN_OSS,
        endpoint: 'https://azure.blob.core.windows.net',
        description: 'Azure Blob 存储实例',
      },
      {
        name: 'GCS-Instance-1',
        type: StorageInstanceType.S3,
        endpoint: 'https://storage.googleapis.com',
        description: 'Google Cloud Storage 实例',
      },
    ];

    for (const instanceData of instances) {
      try {
        const instance = await storageService.createStorageInstance(instanceData, 1); // 使用 admin 用户 ID
        console.log(`存储实例创建成功: ${instance.name}`);
      } catch (error) {
        if ((error as any).message.includes('已存在')) {
          console.log(`存储实例已存在: ${instanceData.name}`);
        } else {
          console.error(`创建存储实例失败 ${instanceData.name}:`, (error as any).message);
        }
      }
    }

    console.log('对象存储实例创建完成！');
  } catch (error) {
    console.error('创建对象存储实例时发生错误:', (error as any).message);
  }

  await app.close();
}

void bootstrap();
