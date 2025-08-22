import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
} from 'class-validator';
import { StorageInstanceType } from '../entities/storage-instance.entity';

export class CreateStorageInstanceDto {
  @ApiProperty({ description: '对象存储实例名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '对象存储实例描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '对象存储实例类型', enum: StorageInstanceType })
  @IsEnum(StorageInstanceType)
  type: StorageInstanceType;

  @ApiProperty({ description: '对象存储实例配置', required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiProperty({ description: '是否激活', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
