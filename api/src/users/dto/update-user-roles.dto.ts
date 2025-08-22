import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty({ example: ['admin', 'user'], description: '用户角色列表' })
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
