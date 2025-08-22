import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from './storage.service';
import {
  StorageInstance,
  StorageInstanceType,
} from './entities/storage-instance.entity';
import { StoragePath } from './entities/storage-path.entity';
import { StoragePermissionEntity } from './entities/storage-permission.entity';
import { User } from '../users/entities/user.entity';
import { CreateStorageInstanceDto } from './dto/create-storage-instance.dto';
import { CreateStoragePathDto } from './dto/create-storage-path.dto';
import { GrantStoragePermissionDto } from './dto/grant-storage-permission.dto';
import { StoragePermission } from './entities/storage-permission.enum';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;
  let storageInstanceRepository: Repository<StorageInstance>;
  let storagePathRepository: Repository<StoragePath>;
  let storagePermissionRepository: Repository<StoragePermissionEntity>;
  let userRepository: Repository<User>;

  const mockStorageInstanceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    query: jest.fn(),
  };

  const mockStoragePathRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    query: jest.fn(),
  };

  const mockStoragePermissionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    query: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: getRepositoryToken(StorageInstance),
          useValue: mockStorageInstanceRepository,
        },
        {
          provide: getRepositoryToken(StoragePath),
          useValue: mockStoragePathRepository,
        },
        {
          provide: getRepositoryToken(StoragePermissionEntity),
          useValue: mockStoragePermissionRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    storageInstanceRepository = module.get<Repository<StorageInstance>>(
      getRepositoryToken(StorageInstance),
    );
    storagePathRepository = module.get<Repository<StoragePath>>(
      getRepositoryToken(StoragePath),
    );
    storagePermissionRepository = module.get<
      Repository<StoragePermissionEntity>
    >(getRepositoryToken(StoragePermissionEntity));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
      };
      mockStorageInstanceRepository.findOne.mockResolvedValue(null);
      mockStorageInstanceRepository.create.mockReturnValue(mockInstance);
      mockStorageInstanceRepository.save.mockResolvedValue(mockInstance);

      const result = await service.createStorageInstance(createDto, 1);

      expect(result).toEqual(mockInstance);
      expect(mockStorageInstanceRepository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(mockStorageInstanceRepository.create).toHaveBeenCalledWith({
        ...createDto,
        createdById: 1,
      });
    });

    it('should throw ConflictException if instance name already exists', async () => {
      const existingInstance = { id: 1, name: 'Test Instance' };
      mockStorageInstanceRepository.findOne.mockResolvedValue(existingInstance);

      await expect(service.createStorageInstance(createDto, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getAllStorageInstances', () => {
    it('should return all storage instances with relations', async () => {
      const mockInstances = [
        { id: 1, name: 'Instance 1', type: 'local' },
        { id: 2, name: 'Instance 2', type: 's3' },
      ];
      mockStorageInstanceRepository.find.mockResolvedValue(mockInstances);

      const result = await service.getAllStorageInstances();

      expect(result).toEqual(mockInstances);
      expect(mockStorageInstanceRepository.find).toHaveBeenCalledWith({
        relations: ['createdBy'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('createStoragePath', () => {
    const createDto: CreateStoragePathDto = {
      path: '/test/path',
      description: 'Test path',
      storageInstanceId: 1,
    };

    it('should create a storage path successfully', async () => {
      const mockPath = { id: 1, ...createDto, isActive: true, createdById: 1 };
      mockStoragePathRepository.findOne.mockResolvedValue(null);
      mockStoragePathRepository.create.mockReturnValue(mockPath);
      mockStoragePathRepository.save.mockResolvedValue(mockPath);

      const result = await service.createStoragePath(createDto, 1);

      expect(result).toEqual(mockPath);
      expect(mockStoragePathRepository.findOne).toHaveBeenCalledWith({
        where: { path: createDto.path },
      });
    });

    it('should throw ConflictException if path already exists', async () => {
      const existingPath = { id: 1, path: '/test/path' };
      mockStoragePathRepository.findOne.mockResolvedValue(existingPath);

      await expect(service.createStoragePath(createDto, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getAllStoragePaths', () => {
    it('should return all storage paths with relations using raw SQL', async () => {
      const mockRawData = [
        {
          id: 1,
          path: '/test/path',
          si_id: 1,
          si_name: 'Test Instance',
          si_type: 'local',
          createdBy_id: 1,
          createdBy_username: 'admin',
        },
      ];
      mockStoragePathRepository.query.mockResolvedValue(mockRawData);

      const result = await service.getAllStoragePaths();

      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('/test/path');
      expect(result[0].storageInstance).toBeDefined();
      expect(mockStoragePathRepository.query).toHaveBeenCalled();
    });
  });

  describe('grantPermission', () => {
    const grantDto: GrantStoragePermissionDto = {
      userIds: [1, 2],
      storagePathId: 1,
      permission: StoragePermission.READ,
    };

    it('should grant permissions to multiple users successfully', async () => {
      const mockStoragePath = {
        id: 1,
        path: '/test',
        storageInstance: { id: 1 },
      };
      const mockUsers = [{ id: 1 }, { id: 2 }];
      const mockPermissions = [
        {
          id: 1,
          userId: 1,
          storagePathId: 1,
          permission: StoragePermission.READ,
        },
        {
          id: 2,
          userId: 2,
          storagePathId: 1,
          permission: StoragePermission.READ,
        },
      ];

      mockStoragePathRepository.findOne.mockResolvedValue(mockStoragePath);
      mockUserRepository.findByIds.mockResolvedValue(mockUsers);
      mockStoragePermissionRepository.find.mockResolvedValue([]);
      mockStoragePermissionRepository.create.mockReturnValue(
        mockPermissions[0],
      );
      mockStoragePermissionRepository.save.mockResolvedValue(mockPermissions);
      mockStoragePermissionRepository.findOne
        .mockResolvedValueOnce({
          ...mockPermissions[0],
          user: {},
          storagePath: {},
        })
        .mockResolvedValueOnce({
          ...mockPermissions[1],
          user: {},
          storagePath: {},
        });

      const result = await service.grantPermission(grantDto);

      expect(result).toHaveLength(2);
      expect(mockStoragePermissionRepository.create).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException if storage path does not exist', async () => {
      mockStoragePathRepository.findOne.mockResolvedValue(null);

      await expect(service.grantPermission(grantDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if some users do not exist', async () => {
      const mockStoragePath = {
        id: 1,
        path: '/test',
        storageInstance: { id: 1 },
      };
      mockStoragePathRepository.findOne.mockResolvedValue(mockStoragePath);
      mockUserRepository.findByIds.mockResolvedValue([{ id: 1 }]);

      await expect(service.grantPermission(grantDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if permissions already exist', async () => {
      const mockStoragePath = {
        id: 1,
        path: '/test',
        storageInstance: { id: 1 },
      };
      const mockUsers = [{ id: 1 }, { id: 2 }];
      const existingPermissions = [{ userId: 1, storagePathId: 1 }];

      mockStoragePathRepository.findOne.mockResolvedValue(mockStoragePath);
      mockUserRepository.findByIds.mockResolvedValue(mockUsers);
      mockStoragePermissionRepository.find.mockResolvedValue(
        existingPermissions,
      );

      await expect(service.grantPermission(grantDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('revokePermission', () => {
    it('should revoke permission successfully', async () => {
      const mockPermission = { id: 1, userId: 1, storagePathId: 1 };
      mockStoragePermissionRepository.findOne.mockResolvedValue(mockPermission);
      mockStoragePermissionRepository.remove.mockResolvedValue(undefined);

      await service.revokePermission(1, 1);

      expect(mockStoragePermissionRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 1, storagePathId: 1 },
      });
      expect(mockStoragePermissionRepository.remove).toHaveBeenCalledWith(
        mockPermission,
      );
    });

    it('should throw NotFoundException if permission does not exist', async () => {
      mockStoragePermissionRepository.findOne.mockResolvedValue(null);

      await expect(service.revokePermission(1, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('revokeMultiplePermissions', () => {
    it('should revoke multiple permissions successfully', async () => {
      const mockPermissions = [
        { id: 1, userId: 1, storagePathId: 1 },
        { id: 2, userId: 2, storagePathId: 1 },
      ];
      mockStoragePermissionRepository.find.mockResolvedValue(mockPermissions);
      mockStoragePermissionRepository.remove.mockResolvedValue(undefined);

      await service.revokeMultiplePermissions([1, 2], 1);

      expect(mockStoragePermissionRepository.find).toHaveBeenCalledWith({
        where: [
          { userId: 1, storagePathId: 1 },
          { userId: 2, storagePathId: 1 },
        ],
      });
      expect(mockStoragePermissionRepository.remove).toHaveBeenCalledWith(
        mockPermissions,
      );
    });

    it('should throw NotFoundException if no permissions found', async () => {
      mockStoragePermissionRepository.find.mockResolvedValue([]);

      await expect(
        service.revokeMultiplePermissions([1, 2], 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllStoragePermissions', () => {
    it('should return all storage permissions using raw SQL', async () => {
      const mockRawData = [
        {
          id: 1,
          userId: 1,
          storagePathId: 1,
          permission: 'read',
          user_id: 1,
          user_username: 'admin',
          storagePath_id: 1,
          storagePath_path: '/test',
          si_id: 1,
          si_name: 'Test Instance',
          si_type: 'local',
        },
      ];
      mockStoragePermissionRepository.query.mockResolvedValue(mockRawData);

      const result = await service.getAllStoragePermissions();

      expect(result).toHaveLength(1);
      expect(result[0].user).toBeDefined();
      expect(result[0].storagePath).toBeDefined();
      expect(mockStoragePermissionRepository.query).toHaveBeenCalled();
    });
  });

  describe('getUserStoragePermissions', () => {
    it('should return user storage permissions using raw SQL', async () => {
      const mockRawData = [
        {
          id: 1,
          userId: 1,
          storagePathId: 1,
          permission: 'read',
          user_id: 1,
          user_username: 'admin',
          storagePath_id: 1,
          storagePath_path: '/test',
          si_id: 1,
          si_name: 'Test Instance',
          si_type: 'local',
        },
      ];
      mockStoragePermissionRepository.query.mockResolvedValue(mockRawData);

      const result = await service.getUserStoragePermissions(1);

      expect(result).toHaveLength(1);
      expect(mockStoragePermissionRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE sp.userId = ?'),
        [1],
      );
    });
  });

  describe('checkUserPermission', () => {
    it('should return true for READ permission when WRITE permission exists', async () => {
      const mockPermission = {
        userId: 1,
        storagePathId: 1,
        permission: StoragePermission.WRITE,
      };
      mockStoragePermissionRepository.findOne.mockResolvedValue(mockPermission);

      const result = await service.checkUserPermission(
        1,
        1,
        StoragePermission.READ,
      );

      expect(result).toBe(true);
    });

    it('should return true for WRITE permission when WRITE permission exists', async () => {
      const mockPermission = {
        userId: 1,
        storagePathId: 1,
        permission: StoragePermission.WRITE,
      };
      mockStoragePermissionRepository.findOne.mockResolvedValue(mockPermission);

      const result = await service.checkUserPermission(
        1,
        1,
        StoragePermission.WRITE,
      );

      expect(result).toBe(true);
    });

    it('should return false for WRITE permission when only READ permission exists', async () => {
      const mockPermission = {
        userId: 1,
        storagePathId: 1,
        permission: StoragePermission.READ,
      };
      mockStoragePermissionRepository.findOne.mockResolvedValue(mockPermission);

      const result = await service.checkUserPermission(
        1,
        1,
        StoragePermission.WRITE,
      );

      expect(result).toBe(false);
    });

    it('should return false when no permission exists', async () => {
      mockStoragePermissionRepository.findOne.mockResolvedValue(null);

      const result = await service.checkUserPermission(
        1,
        1,
        StoragePermission.READ,
      );

      expect(result).toBe(false);
    });
  });
});
