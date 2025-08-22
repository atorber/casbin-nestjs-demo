import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { StoragePermission } from '../entities/storage-permission.enum';

export class GrantStoragePermissionDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: '用户ID列表，支持批量授予权限',
    type: [Number],
  })
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  userIds: number[];

  @ApiProperty({ example: 1, description: '存储路径ID' })
  @IsNumber()
  @IsNotEmpty()
  storagePathId: number;

  @ApiProperty({
    enum: StoragePermission,
    example: StoragePermission.READ,
    description: '权限类型：只读或读写',
  })
  @IsEnum(StoragePermission)
  @IsNotEmpty()
  permission: StoragePermission;
}
