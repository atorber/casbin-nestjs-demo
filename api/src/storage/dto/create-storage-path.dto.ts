import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateStoragePathDto {
  @ApiProperty({ example: '/data/documents', description: '存储路径' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiPropertyOptional({ example: '文档存储目录', description: '路径描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1, description: '对象存储实例ID' })
  @IsNumber()
  storageInstanceId: number;

  @ApiPropertyOptional({
    example: true,
    description: '是否激活',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
