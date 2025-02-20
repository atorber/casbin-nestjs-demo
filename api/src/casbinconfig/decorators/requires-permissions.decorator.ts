import { SetMetadata } from '@nestjs/common';

export const RequiresPermissions = (object: string, action: string) =>
  SetMetadata('permissions', [object, action]); 