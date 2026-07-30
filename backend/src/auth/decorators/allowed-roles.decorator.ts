import { SetMetadata } from '@nestjs/common';

export const ALLOWED_ROLES_KEY = 'allowedRoles';

// Restricts a route to specific `user.role` values (superadmin, bu-admin,
// company-admin, user) — independent of whatever permissions a Role has
// checked in the RBAC system. Use this for actions that should never be
// reachable by certain roles no matter how permissions get configured.
export const AllowedRoles = (...roles: string[]) =>
  SetMetadata(ALLOWED_ROLES_KEY, roles);