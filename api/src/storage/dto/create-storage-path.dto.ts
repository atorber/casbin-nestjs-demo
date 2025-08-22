import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStoragePathDto {
  @ApiProperty({ example: '/data/documents', description: '存储路径' })
  @IsString()
  @IsNotEmpty()
  path: string;

  @ApiPropertyOptional({ example: '文档存储目录', description: '路径描述' })
  @IsString()
  @IsOptional()
  description?: string;
}
