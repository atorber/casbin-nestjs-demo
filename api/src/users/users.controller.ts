import { Controller, Get, Put, Delete, Param, Body, UseGuards, ParseIntPipe, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRolesDto } from './dto/update-user-roles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard } from '../casbinconfig/guards/casbin-auth.guard';
import { RequirePermissions } from '../casbinconfig/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, CasbinGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('users', 'read')
  @ApiOperation({ summary: '获取所有用户（仅管理员）' })
  @ApiResponse({ status: 200, description: '返回所有用户', type: [User] })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions('users', 'read')
  @ApiOperation({ summary: '根据ID获取用户（管理员或用户本人）' })
  @ApiResponse({ status: 200, description: '返回用户信息', type: User })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员或用户本人' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('users', 'write')
  @ApiOperation({ summary: '更新用户信息（管理员或用户本人）' })
  @ApiResponse({ status: 200, description: '用户更新成功', type: User })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员或用户本人' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/roles')
  @RequirePermissions('roles', 'write')
  @ApiOperation({ summary: '更新用户角色（仅管理员）' })
  @ApiResponse({ status: 200, description: '用户角色更新成功', type: User })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRolesDto: UpdateUserRolesDto,
  ): Promise<User> {
    return this.usersService.updateRoles(id, updateUserRolesDto);
  }

  @Delete(':id')
  @RequirePermissions('users', 'delete')
  @ApiOperation({ summary: '删除用户（仅管理员）' })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 403, description: '禁止访问 - 仅限管理员' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }
} 