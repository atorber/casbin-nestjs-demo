import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoragePath } from './entities/storage-path.entity';
import { StoragePermission } from './entities/storage-permission.enum';
import { StorageInstance } from './entities/storage-instance.entity';
import { StoragePermissionEntity } from './entities/storage-permission.entity';
import { CreateStoragePathDto } from './dto/create-storage-path.dto';
import { CreateStorageInstanceDto } from './dto/create-storage-instance.dto';
import { GrantStoragePermissionDto } from './dto/grant-storage-permission.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(StoragePath)
    private storagePathRepository: Repository<StoragePath>,
    @InjectRepository(StorageInstance)
    private storageInstanceRepository: Repository<StorageInstance>,
    @InjectRepository(StoragePermissionEntity)
    private storagePermissionRepository: Repository<StoragePermissionEntity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createStoragePath(
    createStoragePathDto: CreateStoragePathDto,
    createdById: number,
  ): Promise<StoragePath> {
    console.log('存储服务 - 创建存储路径 - createdById:', createdById);
    console.log('存储服务 - 创建存储路径 - DTO:', createStoragePathDto);

    // 检查路径是否已存在
    const existingPath = await this.storagePathRepository.findOne({
      where: { path: createStoragePathDto.path },
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
    console.log('StorageService - getAllStoragePaths 开始执行');
    
    // 使用原生SQL查询来确保获取完整的关联数据
    const rawData = await this.storagePathRepository.query(`
      SELECT 
        sp.id,
        sp.path,
        sp.description,
        sp.isActive,
        sp.storageInstanceId,
        sp.createdById,
        sp.createdAt,
        sp.updatedAt,
        u.id as createdBy_id,
        u.username as createdBy_username,
        u.email as createdBy_email,
        u.isActive as createdBy_isActive,
        u.roles as createdBy_roles,
        u.createdAt as createdBy_createdAt,
        u.updatedAt as createdBy_updatedAt,
        si.id as si_id,
        si.name as si_name,
        si.type as si_type,
        si.description as si_description,
        si.config as si_config,
        si.isActive as si_isActive,
        si.createdById as si_createdById,
        si.createdAt as si_createdAt,
        si.updatedAt as si_updatedAt
      FROM storage_paths sp
      LEFT JOIN users u ON sp.createdById = u.id
      LEFT JOIN storage_instances si ON sp.storageInstanceId = si.id
      ORDER BY sp.createdAt DESC
    `);

    console.log('StorageService - 原始SQL查询结果数量:', rawData.length);
    console.log('StorageService - 第一个原始数据行:', rawData[0]);

    // 转换原始数据为实体格式
    const result = rawData.map(row => ({
      id: row.id,
      path: row.path,
      description: row.description,
      isActive: row.isActive,
      storageInstanceId: row.storageInstanceId,
      createdById: row.createdById,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      createdBy: {
        id: row.createdBy_id,
        username: row.createdBy_username,
        email: row.createdBy_email,
        isActive: row.createdBy_isActive,
        roles: typeof row.createdBy_roles === 'string' ? [row.createdBy_roles] : row.createdBy_roles,
        createdAt: row.createdBy_createdAt,
        updatedAt: row.createdBy_updatedAt
      },
      storageInstance: {
        id: row.si_id,
        name: row.si_name,
        type: row.si_type,
        description: row.si_description,
        config: row.si_config ? (typeof row.si_config === 'string' ? JSON.parse(row.si_config) : row.si_config) : null,
        isActive: row.si_isActive,
        createdById: row.si_createdById,
        createdAt: row.si_createdAt,
        updatedAt: row.si_updatedAt
      }
    }));

    console.log('StorageService - 转换后的结果数量:', result.length);
    console.log('StorageService - 第一个结果的存储实例:', result[0]?.storageInstance);

    return result;
  }

  async getStoragePathById(id: number): Promise<StoragePath> {
    const storagePath = await this.storagePathRepository.findOne({
      where: { id },
      relations: ['createdBy', 'storageInstance'],
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

  async grantPermission(
    grantPermissionDto: GrantStoragePermissionDto,
  ): Promise<StoragePermissionEntity> {
    // 检查用户是否存在
    const user = await this.userRepository.findOne({
      where: { id: grantPermissionDto.userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查存储路径是否存在
    const storagePath = await this.storagePathRepository.findOne({
      where: { id: grantPermissionDto.storagePathId },
      relations: ['storageInstance'],
    });

    if (!storagePath) {
      throw new NotFoundException('存储路径不存在');
    }

    // 检查权限是否已存在
    const existingPermission = await this.storagePermissionRepository.findOne({
      where: {
        userId: grantPermissionDto.userId,
        storagePathId: grantPermissionDto.storagePathId,
      },
    });

    if (existingPermission) {
      // 更新现有权限
      existingPermission.permission = grantPermissionDto.permission;
      const savedPermission = await this.storagePermissionRepository.save(
        existingPermission,
      );
      // 返回完整的关联数据
      return this.storagePermissionRepository.findOne({
        where: { id: savedPermission.id },
        relations: ['user', 'storagePath', 'storagePath.createdBy'],
      });
    }

    // 创建新权限
    const permission =
      this.storagePermissionRepository.create(grantPermissionDto);
    const savedPermission = await this.storagePermissionRepository.save(
      permission,
    );
    // 返回完整的关联数据
    return this.storagePermissionRepository.findOne({
      where: { id: savedPermission.id },
      relations: ['user', 'storagePath', 'storagePath.createdBy', 'storagePath.storageInstance'],
    });
  }

  async revokePermission(userId: number, storagePathId: number): Promise<void> {
    const permission = await this.storagePermissionRepository.findOne({
      where: { userId, storagePathId },
    });

    if (!permission) {
      throw new NotFoundException('权限记录不存在');
    }

    await this.storagePermissionRepository.remove(permission);
  }

  async getUserStoragePermissions(
    userId: number,
  ): Promise<StoragePermissionEntity[]> {
    // 使用原生SQL查询来确保获取完整的关联数据
    const rawData = await this.storagePermissionRepository.query(`
      SELECT 
        sp.id,
        sp.userId,
        sp.storagePathId,
        sp.permission,
        sp.grantedAt,
        u.id as user_id,
        u.username as user_username,
        u.email as user_email,
        u.isActive as user_isActive,
        u.roles as user_roles,
        u.createdAt as user_createdAt,
        u.updatedAt as user_updatedAt,
        stp.id as storagePath_id,
        stp.path as storagePath_path,
        stp.description as storagePath_description,
        stp.isActive as storagePath_isActive,
        stp.storageInstanceId as storagePath_storageInstanceId,
        stp.createdById as storagePath_createdById,
        stp.createdAt as storagePath_createdAt,
        stp.updatedAt as storagePath_updatedAt,
        si.id as si_id,
        si.name as si_name,
        si.type as si_type,
        si.description as si_description,
        si.config as si_config,
        si.isActive as si_isActive,
        si.createdById as si_createdById,
        si.createdAt as si_createdAt,
        si.updatedAt as si_updatedAt,
        creator.id as creator_id,
        creator.username as creator_username,
        creator.email as creator_email,
        creator.isActive as creator_isActive,
        creator.roles as creator_roles,
        creator.createdAt as creator_createdAt,
        creator.updatedAt as creator_updatedAt
      FROM storage_permissions sp
      LEFT JOIN users u ON sp.userId = u.id
      LEFT JOIN storage_paths stp ON sp.storagePathId = stp.id
      LEFT JOIN storage_instances si ON stp.storageInstanceId = si.id
      LEFT JOIN users creator ON stp.createdById = creator.id
      WHERE sp.userId = ?
      ORDER BY sp.grantedAt DESC
    `, [userId]);

    // 转换原始数据为实体格式
    return rawData.map(row => ({
      id: row.id,
      userId: row.userId,
      storagePathId: row.storagePathId,
      permission: row.permission,
      grantedAt: row.grantedAt,
      user: {
        id: row.user_id,
        username: row.user_username,
        email: row.user_email,
        isActive: row.user_isActive,
        roles: typeof row.user_roles === 'string' ? [row.user_roles] : row.user_roles,
        createdAt: row.user_createdAt,
        updatedAt: row.user_updatedAt
      },
      storagePath: {
        id: row.storagePath_id,
        path: row.storagePath_path,
        description: row.storagePath_description,
        isActive: row.storagePath_isActive,
        storageInstanceId: row.storagePath_storageInstanceId,
        createdById: row.storagePath_createdById,
        createdAt: row.storagePath_createdAt,
        updatedAt: row.storagePath_updatedAt,
        storageInstance: {
          id: row.si_id,
          name: row.si_name,
          type: row.si_type,
          description: row.si_description,
          config: row.si_config ? (typeof row.si_config === 'string' ? JSON.parse(row.si_config) : row.si_config) : null,
          isActive: row.si_isActive,
          createdById: row.si_createdById,
          createdAt: row.si_createdAt,
          updatedAt: row.si_updatedAt
        },
        createdBy: {
          id: row.creator_id,
          username: row.creator_username,
          email: row.creator_email,
          isActive: row.creator_isActive,
          roles: typeof row.creator_roles === 'string' ? [row.creator_roles] : row.creator_roles,
          createdAt: row.creator_createdAt,
          updatedAt: row.creator_updatedAt
        }
      }
    }));
  }

  async getAllStoragePermissions(): Promise<StoragePermissionEntity[]> {
    // 使用原生SQL查询来确保获取完整的关联数据
    const rawData = await this.storagePermissionRepository.query(`
      SELECT 
        sp.id,
        sp.userId,
        sp.storagePathId,
        sp.permission,
        sp.grantedAt,
        u.id as user_id,
        u.username as user_username,
        u.email as user_email,
        u.isActive as user_isActive,
        u.roles as user_roles,
        u.createdAt as user_createdAt,
        u.updatedAt as user_updatedAt,
        stp.id as storagePath_id,
        stp.path as storagePath_path,
        stp.description as storagePath_description,
        stp.isActive as storagePath_isActive,
        stp.storageInstanceId as storagePath_storageInstanceId,
        stp.createdById as storagePath_createdById,
        stp.createdAt as storagePath_createdAt,
        stp.updatedAt as storagePath_updatedAt,
        si.id as si_id,
        si.name as si_name,
        si.type as si_type,
        si.description as si_description,
        si.config as si_config,
        si.isActive as si_isActive,
        si.createdById as si_createdById,
        si.createdAt as si_createdAt,
        si.updatedAt as si_updatedAt,
        creator.id as creator_id,
        creator.username as creator_username,
        creator.email as creator_email,
        creator.isActive as creator_isActive,
        creator.roles as creator_roles,
        creator.createdAt as creator_createdAt,
        creator.updatedAt as creator_updatedAt
      FROM storage_permissions sp
      LEFT JOIN users u ON sp.userId = u.id
      LEFT JOIN storage_paths stp ON sp.storagePathId = stp.id
      LEFT JOIN storage_instances si ON stp.storageInstanceId = si.id
      LEFT JOIN users creator ON stp.createdById = creator.id
      ORDER BY sp.grantedAt DESC
    `);

    // 转换原始数据为实体格式
    return rawData.map(row => ({
      id: row.id,
      userId: row.userId,
      storagePathId: row.storagePathId,
      permission: row.permission,
      grantedAt: row.grantedAt,
      user: {
        id: row.user_id,
        username: row.user_username,
        email: row.user_email,
        isActive: row.user_isActive,
        roles: typeof row.user_roles === 'string' ? [row.user_roles] : row.user_roles,
        createdAt: row.user_createdAt,
        updatedAt: row.user_updatedAt
      },
      storagePath: {
        id: row.storagePath_id,
        path: row.storagePath_path,
        description: row.storagePath_description,
        isActive: row.storagePath_isActive,
        storageInstanceId: row.storagePath_storageInstanceId,
        createdById: row.storagePath_createdById,
        createdAt: row.storagePath_createdAt,
        updatedAt: row.storagePath_updatedAt,
        storageInstance: {
          id: row.si_id,
          name: row.si_name,
          type: row.si_type,
          description: row.si_description,
          config: row.si_config ? (typeof row.si_config === 'string' ? JSON.parse(row.si_config) : row.si_config) : null,
          isActive: row.si_isActive,
          createdById: row.si_createdById,
          createdAt: row.si_createdAt,
          updatedAt: row.si_updatedAt
        },
        createdBy: {
          id: row.creator_id,
          username: row.creator_username,
          email: row.creator_email,
          isActive: row.creator_isActive,
          roles: typeof row.creator_roles === 'string' ? [row.creator_roles] : row.creator_roles,
          createdAt: row.creator_createdAt,
          updatedAt: row.creator_updatedAt
        }
      }
    }));
  }

  async checkUserPermission(
    userId: number,
    storagePathId: number,
    requiredPermission: StoragePermission,
  ): Promise<boolean> {
    const permission = await this.storagePermissionRepository.findOne({
      where: { userId, storagePathId },
    });

    if (!permission) {
      return false;
    }

    if (requiredPermission === StoragePermission.WRITE) {
      return permission.permission === StoragePermission.WRITE;
    }

    return true; // READ permission is satisfied by both READ and WRITE
  }

  // 对象存储实例管理方法
  async createStorageInstance(
    createStorageInstanceDto: CreateStorageInstanceDto,
    createdById: number,
  ): Promise<StorageInstance> {
    // 检查名称是否已存在
    const existingInstance = await this.storageInstanceRepository.findOne({
      where: { name: createStorageInstanceDto.name },
    });

    if (existingInstance) {
      throw new ConflictException('对象存储实例名称已存在');
    }

    const storageInstance = this.storageInstanceRepository.create({
      ...createStorageInstanceDto,
      createdById,
    });

    return this.storageInstanceRepository.save(storageInstance);
  }

  async getAllStorageInstances(): Promise<StorageInstance[]> {
    return this.storageInstanceRepository.find({
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStorageInstanceById(id: number): Promise<StorageInstance> {
    const storageInstance = await this.storageInstanceRepository.findOne({
      where: { id },
      relations: ['createdBy', 'storagePaths'],
    });

    if (!storageInstance) {
      throw new NotFoundException('对象存储实例不存在');
    }

    return storageInstance;
  }

  async updateStorageInstance(
    id: number,
    updateData: Partial<CreateStorageInstanceDto>,
  ): Promise<StorageInstance> {
    const storageInstance = await this.getStorageInstanceById(id);

    Object.assign(storageInstance, updateData);
    return this.storageInstanceRepository.save(storageInstance);
  }

  async deleteStorageInstance(id: number): Promise<void> {
    const storageInstance = await this.getStorageInstanceById(id);

    // 检查是否有关联的存储路径
    const storagePaths = await this.storagePathRepository.find({
      where: { storageInstanceId: id },
    });

    if (storagePaths.length > 0) {
      throw new ConflictException('无法删除包含存储路径的对象存储实例');
    }

    await this.storageInstanceRepository.remove(storageInstance);
  }

  async getStoragePathsByInstance(instanceId: number): Promise<StoragePath[]> {
    return this.storagePathRepository.find({
      where: { storageInstanceId: instanceId },
      relations: ['createdBy', 'storageInstance'],
      order: { createdAt: 'DESC' },
    });
  }
}
