import { Test, TestingModule } from '@nestjs/testing';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { CreateStorageInstanceDto } from './dto/create-storage-instance.dto';
import { CreateStoragePathDto } from './dto/create-storage-path.dto';
import { GrantStoragePermissionDto } from './dto/grant-storage-permission.dto';
import { StoragePermission } from './entities/storage-permission.enum';
import {
  StorageInstance,
  StorageInstanceType,
} from './entities/storage-instance.entity';
import { StoragePath } from './entities/storage-path.entity';
import { StoragePermissionEntity } from './entities/storage-permission.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard } from '../casbinconfig/guards/casbin-auth.guard';

describe('StorageController', () => {
  let controller: StorageController;
  let service: StorageService;

  const mockStorageService = {
    createStorageInstance: jest.fn(),
    getAllStorageInstances: jest.fn(),
    getStorageInstanceById: jest.fn(),
    deleteStorageInstance: jest.fn(),
    createStoragePath: jest.fn(),
    getAllStoragePaths: jest.fn(),
    getStoragePathById: jest.fn(),
    deleteStoragePath: jest.fn(),
    grantPermission: jest.fn(),
    revokePermission: jest.fn(),
    revokeMultiplePermissions: jest.fn(),
    getAllStoragePermissions: jest.fn(),
    getUserStoragePermissions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageController],
      providers: [
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CasbinGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StorageController>(StorageController);
    service = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createStorageInstance', () => {
    const createDto: CreateStorageInstanceDto = {
      name: 'Test Instance',
      type: StorageInstanceType.LOCAL,
      description: 'Test description',
      config: { path: '/test' },
    };

    it('should create a storage instance successfully', async () => {
      const mockInstance = {
        id: 1,
        ...createDto,
        isActive: true,
        createdById: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        storagePaths: [],
      } as StorageInstance;
      mockStorageService.createStorageInstance.mockResolvedValue(mockInstance);

      const result = await controller.createStorageInstance(createDto, {
        user: { id: 1 },
      } as any);

      expect(result).toEqual(mockInstance);
      expect(service.createStorageInstance).toHaveBeenCalledWith(createDto, 1);
    });
  });

  describe('getAllStorageInstances', () => {
    it('should return all storage instances', async () => {
      const mockInstances: StorageInstance[] = [
        {
          id: 1,
          name: 'Instance 1',
          type: StorageInstanceType.LOCAL,
          description: 'Test 1',
          config: {},
          isActive: true,
          createdById: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: null,
          storagePaths: [],
        } as StorageInstance,
        {
          id: 2,
          name: 'Instance 2',
          type: StorageInstanceType.S3,
          description: 'Test 2',
          config: {},
          isActive: true,
          createdById: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: null,
          storagePaths: [],
        } as StorageInstance,
      ];
      mockStorageService.getAllStorageInstances.mockResolvedValue(
        mockInstances,
      );

      const result = await controller.getAllStorageInstances();

      expect(result).toEqual(mockInstances);
      expect(service.getAllStorageInstances).toHaveBeenCalled();
    });
  });

  describe('getStorageInstanceById', () => {
    it('should return a storage instance by id', async () => {
      const mockInstance = {
        id: 1,
        name: 'Test Instance',
        type: StorageInstanceType.LOCAL,
        description: 'Test description',
        config: {},
        isActive: true,
        createdById: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        storagePaths: [],
      } as StorageInstance;
      mockStorageService.getStorageInstanceById.mockResolvedValue(mockInstance);

      const result = await controller.getStorageInstanceById(1);

      expect(result).toEqual(mockInstance);
      expect(service.getStorageInstanceById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when instance not found', async () => {
      mockStorageService.getStorageInstanceById.mockRejectedValue(
        new NotFoundException('Instance not found'),
      );

      await expect(controller.getStorageInstanceById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteStorageInstance', () => {
    it('should delete a storage instance successfully', async () => {
      mockStorageService.deleteStorageInstance.mockResolvedValue(undefined);

      await controller.deleteStorageInstance(1);

      expect(service.deleteStorageInstance).toHaveBeenCalledWith(1);
    });
  });

  describe('createStoragePath', () => {
    const createDto: CreateStoragePathDto = {
      path: '/test/path',
      description: 'Test path',
      storageInstanceId: 1,
    };

    it('should create a storage path successfully', async () => {
      const mockPath = {
        id: 1,
        ...createDto,
        isActive: true,
        createdById: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        storageInstance: null,
        createdBy: null,
        permissions: [],
      } as StoragePath;
      mockStorageService.createStoragePath.mockResolvedValue(mockPath);

      const result = await controller.createStoragePath(createDto, {
        user: { id: 1 },
      } as any);

      expect(result).toEqual(mockPath);
      expect(service.createStoragePath).toHaveBeenCalledWith(createDto, 1);
    });
  });

  describe('getAllStoragePaths', () => {
    it('should return all storage paths', async () => {
      const mockPaths: StoragePath[] = [
        {
          id: 1,
          path: '/test/path1',
          description: 'Test path 1',
          storageInstanceId: 1,
          isActive: true,
          createdById: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          storageInstance: null,
          createdBy: null,
          permissions: [],
        } as StoragePath,
        {
          id: 2,
          path: '/test/path2',
          description: 'Test path 2',
          storageInstanceId: 1,
          isActive: true,
          createdById: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          storageInstance: null,
          createdBy: null,
          permissions: [],
        } as StoragePath,
      ];
      mockStorageService.getAllStoragePaths.mockResolvedValue(mockPaths);

      const result = await controller.getAllStoragePaths();

      expect(result).toEqual(mockPaths);
      expect(service.getAllStoragePaths).toHaveBeenCalled();
    });
  });

  describe('getStoragePathById', () => {
    it('should return a storage path by id', async () => {
      const mockPath = {
        id: 1,
        path: '/test/path',
        description: 'Test path',
        storageInstanceId: 1,
        isActive: true,
        createdById: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        storageInstance: null,
        createdBy: null,
        permissions: [],
      } as StoragePath;
      mockStorageService.getStoragePathById.mockResolvedValue(mockPath);

      const result = await controller.getStoragePathById(1);

      expect(result).toEqual(mockPath);
      expect(service.getStoragePathById).toHaveBeenCalledWith(1);
    });
  });

  describe('deleteStoragePath', () => {
    it('should delete a storage path successfully', async () => {
      mockStorageService.deleteStoragePath.mockResolvedValue(undefined);

      await controller.deleteStoragePath(1);

      expect(service.deleteStoragePath).toHaveBeenCalledWith(1);
    });
  });

  describe('grantPermission', () => {
    const grantDto: GrantStoragePermissionDto = {
      userIds: [1, 2],
      storagePathId: 1,
      permission: StoragePermission.READ,
    };

    it('should grant permissions to multiple users successfully', async () => {
      const mockPermissions: StoragePermissionEntity[] = [
        {
          id: 1,
          userId: 1,
          storagePathId: 1,
          permission: StoragePermission.READ,
          grantedAt: new Date(),
          user: { id: 1, username: 'user1' } as any,
          storagePath: { id: 1, path: '/test' } as any,
        },
        {
          id: 2,
          userId: 2,
          storagePathId: 1,
          permission: StoragePermission.READ,
          grantedAt: new Date(),
          user: { id: 2, username: 'user2' } as any,
          storagePath: { id: 1, path: '/test' } as any,
        },
      ];
      mockStorageService.grantPermission.mockResolvedValue(mockPermissions);

      const result = await controller.grantPermission(grantDto);

      expect(result).toEqual(mockPermissions);
      expect(service.grantPermission).toHaveBeenCalledWith(grantDto);
    });

    it('should handle service errors properly', async () => {
      mockStorageService.grantPermission.mockRejectedValue(
        new ConflictException('Permission already exists'),
      );

      await expect(controller.grantPermission(grantDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('revokePermission', () => {
    it('should revoke a permission successfully', async () => {
      mockStorageService.revokePermission.mockResolvedValue(undefined);

      await controller.revokePermission(1, 1);

      expect(service.revokePermission).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('revokeMultiplePermissions', () => {
    it('should revoke multiple permissions successfully', async () => {
      const body = { userIds: [1, 2], storagePathId: 1 };
      mockStorageService.revokeMultiplePermissions.mockResolvedValue(undefined);

      await controller.revokeMultiplePermissions(body);

      expect(service.revokeMultiplePermissions).toHaveBeenCalledWith(
        body.userIds,
        body.storagePathId,
      );
    });
  });

  describe('getAllStoragePermissions', () => {
    it('should return all storage permissions', async () => {
      const mockPermissions: StoragePermissionEntity[] = [
        {
          id: 1,
          userId: 1,
          storagePathId: 1,
          permission: StoragePermission.READ,
          grantedAt: new Date(),
          user: { id: 1, username: 'user1' } as any,
          storagePath: { id: 1, path: '/test' } as any,
        },
      ];
      mockStorageService.getAllStoragePermissions.mockResolvedValue(
        mockPermissions,
      );

      const result = await controller.getAllStoragePermissions();

      expect(result).toEqual(mockPermissions);
      expect(service.getAllStoragePermissions).toHaveBeenCalled();
    });
  });

  describe('getMyStoragePermissions', () => {
    it('should return current user storage permissions', async () => {
      const mockPermissions: StoragePermissionEntity[] = [
        {
          id: 1,
          userId: 1,
          storagePathId: 1,
          permission: StoragePermission.READ,
          grantedAt: new Date(),
          user: { id: 1, username: 'user1' } as any,
          storagePath: { id: 1, path: '/test' } as any,
        },
      ];
      mockStorageService.getUserStoragePermissions.mockResolvedValue(
        mockPermissions,
      );

      const mockRequest = { user: { id: 1 } };
      const result = await controller.getMyStoragePermissions(
        mockRequest as any,
      );

      expect(result).toEqual(mockPermissions);
      expect(service.getUserStoragePermissions).toHaveBeenCalledWith(1);
    });

    it('should throw error when user id is not available', async () => {
      const mockRequest = { user: {} };

      await expect(
        controller.getMyStoragePermissions(mockRequest as any),
      ).rejects.toThrow('无法获取用户ID');
    });
  });

  // 注意：StorageController 没有 getStorageInstancePaths 方法
  // 这里测试其他方法
});
