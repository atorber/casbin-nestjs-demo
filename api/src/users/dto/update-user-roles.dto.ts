import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRolesDto {
  @ApiProperty({ example: ['admin', 'user'] })
  @IsArray()
  @IsString({ each: true })
  roles: string[];
} 