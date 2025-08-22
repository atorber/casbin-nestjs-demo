import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto & { roles?: string[] }): Promise<{ access_token: string }> {
    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { username: registerDto.username },
        { email: registerDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create new user
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
      roles: registerDto.roles || ['user'], // Default role if none provided
    });

    await this.usersRepository.save(user);

    // Generate JWT
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersRepository.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    console.log('=== getUserById 被调用 ===');
    console.log('传入的 ID:', id);
    console.log('ID 类型:', typeof id);
    
    // 强制类型转换
    const userId = Number(id);
    console.log('转换后的 userId:', userId);
    
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.log('用户不存在，ID:', userId);
      throw new NotFoundException('用户不存在');
    }

    console.log('数据库查询结果:', { 
      id: user.id, 
      username: user.username, 
      roles: user.roles 
    });
    
    const result = plainToInstance(UserResponseDto, user);
    console.log('最终返回结果:', { 
      id: result.id, 
      username: result.username, 
      roles: result.roles 
    });
    console.log('=== getUserById 结束 ===');
    
    return result;
  }
} 