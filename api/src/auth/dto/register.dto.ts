import { IsString, MinLength, IsEmail, Matches, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'john.doe', description: '用户名' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'john@example.com', description: '邮箱地址' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!', description: '密码' })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: '密码必须包含大写字母、小写字母、数字或特殊字符',
  })
  password: string;

  @ApiPropertyOptional({ example: ['user'], type: [String], description: '用户角色' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];
} 