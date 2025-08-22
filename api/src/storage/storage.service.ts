import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoragePath, StoragePermission } from './entities/storage-path.entity';
import { StoragePermissionEntity } from './entities/storage-permission.entity';
import { CreateStoragePathDto } from './dto/create-storage-path.dto';
import { GrantStoragePermissionDto } from './dto/grant-storage-permission.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(StoragePath)
    private storagePathRepository: Repository<StoragePath>,
    @InjectRepository(StoragePermissionEntity)
    private storagePermissionRepository: Repository<StoragePermissionEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createStoragePath(createStoragePathDto: CreateStoragePathDto, createdById: number): Promise<StoragePath> {
    console.log('存储服务 - 创建存储路径 - createdById:', createdById);
    console.log('存储服务 - 创建存储路径 - DTO:', createStoragePathDto);
    
    // 检查路径是否已存在
    const existingPath = await this.storagePathRepository.findOne({
      where: { path: createStoragePathDto.path }
    });

    if (existingPath) {
      throw new ConflictException('存储路径已存在');
    }

    const storagePath = this.storagePathRepository.create({
      ...createStoragePathDto,
      createdById,
    });

    console.log('存储服务 - 准备保存的存储路径对象:', storagePath);
    return this.storagePathRepository.save(storagePath);
  }

  async getAllStoragePaths(): Promise<StoragePath[]> {
    return this.storagePathRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getStoragePathById(id: number): Promise<StoragePath> {
    const storagePath = await this.storagePathRepository.findOne({
      where: { id },
      relations: ['createdBy']
    });

    if (!storagePath) {
      throw new NotFoundException('存储路径不存在');
    }

    return storagePath;
  }

  async deleteStoragePath(id: number): Promise<void> {
    const storagePath = await this.getStoragePathById(id);
    
    // 删除相关的权限记录
    await this.storagePermissionRepository.delete({ storagePathId: id });
    
    // 删除存储路径
    await this.storagePathRepository.remove(storagePath);
  }

  async grantPermission(grantPermissionDto: GrantStoragePermissionDto): Promise<StoragePermissionEntity> {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: grantPermissionDto.userId }
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查存储路径是否存在
    const storagePath = await this.storagePathRepository.findOne({
      where: { id: grantPermissionDto.storagePathId }
    });

    if (!storagePath) {
      throw new NotFoundException('存储路径不存在');
    }

    // 检查权限是否已存在
    const existingPermission = await this.storagePermissionRepository.findOne({
      where: {
        userId: grantPermissionDto.userId,
        storagePathId: grantPermissionDto.storagePathId
      }
    });

    if (existingPermission) {
      // 更新现有权限
      existingPermission.permission = grantPermissionDto.permission;
      const savedPermission = await this.storagePermissionRepository.save(existingPermission);
      // 返回完整的关联数据
      return this.storagePermissionRepository.findOne({
        where: { id: savedPermission.id },
        relations: ['user', 'storagePath', 'storagePath.createdBy']
      });
    }

    // 创建新权限
    const permission = this.storagePermissionRepository.create(grantPermissionDto);
    const savedPermission = await this.storagePermissionRepository.save(permission);
    // 返回完整的关联数据
    return this.storagePermissionRepository.findOne({
      where: { id: savedPermission.id },
      relations: ['user', 'storagePath', 'storagePath.createdBy']
    });
  }

  async revokePermission(userId: number, storagePathId: number): Promise<void> {
    const permission = await this.storagePermissionRepository.findOne({
      where: { userId, storagePathId }
    });

    if (!permission) {
      throw new NotFoundException('权限记录不存在');
    }

    await this.storagePermissionRepository.remove(permission);
  }

  async getUserStoragePermissions(userId: number): Promise<StoragePermissionEntity[]> {
    return this.storagePermissionRepository.find({
      where: { userId },
      relations: ['user', 'storagePath', 'storagePath.createdBy'],
      order: { grantedAt: 'DESC' }
    });
  }

  async getAllStoragePermissions(): Promise<StoragePermissionEntity[]> {
    return this.storagePermissionRepository.find({
      relations: ['user', 'storagePath', 'storagePath.createdBy'],
      order: { grantedAt: 'DESC' }
    });
  }

  async checkUserPermission(userId: number, storagePathId: number, requiredPermission: StoragePermission): Promise<boolean> {
    const permission = await this.storagePermissionRepository.findOne({
      where: { userId, storagePathId }
    });

    if (!permission) {
      return false;
    }

    if (requiredPermission === StoragePermission.WRITE) {
      return permission.permission === StoragePermission.WRITE;
    }

    return true; // READ permission is satisfied by both READ and WRITE
  }
}
