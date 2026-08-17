import { SetMetadata } from '@nestjs/common';

export const PERMISSION_KEY = 'permission';

export const HasPermission = (
  permission: string | string[],
) => SetMetadata(
  PERMISSION_KEY,
  permission,
);