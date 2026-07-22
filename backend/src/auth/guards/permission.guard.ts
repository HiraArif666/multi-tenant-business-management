import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { DatabaseService } from '../../database/database.service';
import { PERMISSION_KEY } from '../decorators/has-permission.decorator';

@Injectable()
export class PermissionGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredPermission =
      this.reflector.get<string>(
        PERMISSION_KEY,
        context.getHandler(),
      );

    if (!requiredPermission) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Unauthorized',
      );
    }

    const userRoles =
      await this.databaseService.UserRole.findAll({
        where: {
          userId: user.id,
        },
      });

    if (!userRoles.length) {
      throw new ForbiddenException(
        'No role assigned',
      );
    }

    const roleIds = userRoles.map(
      (r) => r.roleId,
    );

    const rolePermissions =
      await this.databaseService.RolePermission.findAll({
        where: {
          roleId: roleIds,
        },
        include: [
          {
            model:
              this.databaseService.Permission,
            as: 'permission',
          },
        ],
      });

    const permissions = rolePermissions.map(
      (rp) => rp.permission.name,
    );

    if (
      !permissions.includes(requiredPermission)
    ) {
      throw new ForbiddenException(
        'Permission denied',
      );
    }

    return true;
  }
}