import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CasbinGuard } from '../casbinconfig/guards/casbin-auth.guard';
import { RequirePermissions } from '../casbinconfig/decorators/permissions.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, CasbinGuard)
  @RequirePermissions('roles', 'write')
  @ApiOperation({ summary: '注册新用户（仅管理员）' })
  @ApiResponse({ status: 201, description: '用户注册成功' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '使用用户名和密码登录' })
  @ApiResponse({ status: 200, description: '用户登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户详情' })
  @ApiResponse({ status: 200, description: '返回当前用户详情', type: UserResponseDto })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCurrentUser(@CurrentUser() user: { userId: number }) {
    return this.authService.getUserById(user.userId);
  }
} 