import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Op } from 'sequelize';

import { DatabaseService } from '../../database/database.service';
import { PERMISSION_KEY } from '../decorators/has-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    // Route has no permission requirement
    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    // =====================================
    // Get User Roles
    // =====================================

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
      (x: any) => x.roleId,
    );

    // If user has Super Admin role, grant all permissions
    const roles = await this.databaseService.Role.findAll({
      where: {
        id: {
          [Op.in]: roleIds,
        },
      },
    });

    if (roles.some((r: any) => r.name === 'Super Admin')) {
      return true;
    }

    // =====================================
    // Get Role Permissions
    // =====================================

    const rolePermissions =
      await this.databaseService.RolePermission.findAll({
        where: {
          roleId: {
            [Op.in]: roleIds,
          },
        },

        include: [
          {
            model: this.databaseService.Permission,
            as: 'permission',
            required: false,
          },
        ],
      });

    // =====================================
    // Extract Permission Keys
    // =====================================

    const permissions = rolePermissions
      .map((x: any) => x.permission?.permissionKey)
      .filter(Boolean);

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