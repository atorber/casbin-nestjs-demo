import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard } from '../casbinconfig/guards/casbin-auth.guard';
import { RequirePermissions } from '../casbinconfig/decorators/permissions.decorator';
import { StorageService } from './storage.service';
import { CreateStoragePathDto } from './dto/create-storage-path.dto';
import { CreateStorageInstanceDto } from './dto/create-storage-instance.dto';
import { GrantStoragePermissionDto } from './dto/grant-storage-permission.dto';
import { StoragePath } from './entities/storage-path.entity';
import { StorageInstance } from './entities/storage-instance.entity';
import { StoragePermissionEntity } from './entities/storage-permission.entity';

@ApiTags('存储管理')
@Controller('storage')
@UseGuards(JwtAuthGuard, CasbinGuard)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('paths')
  @RequirePermissions('storage', 'write')
  @ApiOperation({ summary: '创建存储路径（仅管理员）' })
  @ApiResponse({
    status: 201,
    description: '存储路径创建成功',
    type: StoragePath,
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 409, description: '存储路径已存在' })
  async createStoragePath(
    @Body() createStoragePathDto: CreateStoragePathDto,
    @Request() req,
  ): Promise<StoragePath> {
    console.log('创建存储路径 - 请求用户信息:', req.user);
    console.log('创建存储路径 - 用户ID:', req.user?.id);
    console.log('创建存储路径 - 用户ID (userId):', req.user?.userId);

    // 尝试多种方式获取用户ID
    const userId = req.user?.id || req.user?.userId;
    console.log('创建存储路径 - 最终使用的用户ID:', userId);

    if (!userId) {
      throw new Error('无法获取用户ID');
    }

    return this.storageService.createStoragePath(
      createStoragePathDto,
      userId as number,
    );
  }

  @Get('paths')
  @RequirePermissions('storage', 'read')
  @ApiOperation({ summary: '获取所有存储路径（仅管理员）' })
  @ApiResponse({
    status: 200,
    description: '返回所有存储路径',
    type: [StoragePath],
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  async getAllStoragePaths(): Promise<StoragePath[]> {
    return this.storageService.getAllStoragePaths();
  }

  @Get('paths/:id')
  @RequirePermissions('storage', 'read')
  @ApiOperation({ summary: '根据ID获取存储路径（仅管理员）' })
  @ApiResponse({
    status: 200,
    description: '返回存储路径信息',
    type: StoragePath,
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '存储路径不存在' })
  async getStoragePathById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StoragePath> {
    return this.storageService.getStoragePathById(id);
  }

  @Delete('paths/:id')
  @RequirePermissions('storage', 'write')
  @ApiOperation({ summary: '删除存储路径（仅管理员）' })
  @ApiResponse({ status: 200, description: '存储路径删除成功' })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '存储路径不存在' })
  async deleteStoragePath(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.storageService.deleteStoragePath(id);
  }

  @Post('permissions')
  @RequirePermissions('storage', 'write')
  @ApiOperation({ summary: '批量授予存储权限（仅管理员）' })
  @ApiResponse({
    status: 201,
    description: '权限授予成功',
    type: [StoragePermissionEntity],
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '用户或存储路径不存在' })
  @ApiResponse({ status: 409, description: '部分用户权限已存在' })
  async grantPermission(
    @Body() grantPermissionDto: GrantStoragePermissionDto,
  ): Promise<StoragePermissionEntity[]> {
    return this.storageService.grantPermission(grantPermissionDto);
  }

  @Delete('permissions/:userId/:storagePathId')
  @RequirePermissions('storage', 'write')
  @ApiOperation({ summary: '撤销单个存储权限（仅管理员）' })
  @ApiResponse({ status: 200, description: '权限撤销成功' })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '权限记录不存在' })
  async revokePermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('storagePathId', ParseIntPipe) storagePathId: number,
  ): Promise<void> {
    return this.storageService.revokePermission(userId, storagePathId);
  }

  @Post('permissions/batch/revoke')
  @RequirePermissions('storage', 'write')
  @ApiOperation({ summary: '批量撤销存储权限（仅管理员）' })
  @ApiResponse({ status: 200, description: '批量权限撤销成功' })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '未找到要撤销的权限记录' })
  async revokeMultiplePermissions(
    @Body() body: { userIds: number[]; storagePathId: number },
  ): Promise<void> {
    return this.storageService.revokeMultiplePermissions(
      body.userIds,
      body.storagePathId,
    );
  }

  @Get('permissions')
  @RequirePermissions('storage', 'read')
  @ApiOperation({ summary: '获取所有存储权限（仅管理员）' })
  @ApiResponse({
    status: 200,
    description: '返回所有存储权限',
    type: [StoragePermissionEntity],
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  async getAllStoragePermissions(): Promise<StoragePermissionEntity[]> {
    return this.storageService.getAllStoragePermissions();
  }

  @Get('my-permissions')
  @ApiOperation({ summary: '获取当前用户的存储权限' })
  @ApiResponse({
    status: 200,
    description: '返回当前用户的存储权限',
    type: [StoragePermissionEntity],
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getMyStoragePermissions(
    @Request() req,
  ): Promise<StoragePermissionEntity[]> {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    return this.storageService.getUserStoragePermissions(userId as number);
  }

  // 对象存储实例管理 API
  @Post('instances')
  @RequirePermissions('storage', 'write')
  @ApiOperation({ summary: '创建对象存储实例（仅管理员）' })
  @ApiResponse({
    status: 201,
    description: '对象存储实例创建成功',
    type: StorageInstance,
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 409, description: '对象存储实例名称已存在' })
  async createStorageInstance(
    @Body() createStorageInstanceDto: CreateStorageInstanceDto,
    @Request() req,
  ): Promise<StorageInstance> {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new Error('无法获取用户ID');
    }
    return this.storageService.createStorageInstance(
      createStorageInstanceDto,
      userId as number,
    );
  }

  @Get('instances')
  @RequirePermissions('storage', 'read')
  @ApiOperation({ summary: '获取所有对象存储实例（仅管理员）' })
  @ApiResponse({
    status: 200,
    description: '返回所有对象存储实例',
    type: [StorageInstance],
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  async getAllStorageInstances(): Promise<StorageInstance[]> {
    return this.storageService.getAllStorageInstances();
  }

  @Get('instances/:id')
  @RequirePermissions('storage', 'read')
  @ApiOperation({ summary: '根据ID获取对象存储实例（仅管理员）' })
  @ApiResponse({
    status: 200,
    description: '返回对象存储实例信息',
    type: StorageInstance,
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '对象存储实例不存在' })
  async getStorageInstanceById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StorageInstance> {
    return this.storageService.getStorageInstanceById(id);
  }

  @Get('instances/:id/paths')
  @RequirePermissions('storage', 'read')
  @ApiOperation({ summary: '获取指定实例下的所有存储路径（仅管理员）' })
  @ApiResponse({
    status: 200,
    description: '返回指定实例下的所有存储路径',
    type: [StoragePath],
  })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '对象存储实例不存在' })
  async getStoragePathsByInstance(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StoragePath[]> {
    return this.storageService.getStoragePathsByInstance(id);
  }

  @Delete('instances/:id')
  @RequirePermissions('storage', 'write')
  @ApiOperation({ summary: '删除对象存储实例（仅管理员）' })
  @ApiResponse({ status: 200, description: '对象存储实例删除成功' })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '对象存储实例不存在' })
  @ApiResponse({
    status: 409,
    description: '无法删除包含存储路径的对象存储实例',
  })
  async deleteStorageInstance(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.storageService.deleteStorageInstance(id);
  }
}
