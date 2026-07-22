import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserRolesService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async getUserRoles(userId: number) {
    const user =
      await this.databaseService.User.findByPk(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const userRoles =
      await this.databaseService.UserRole.findAll({
        where: {
          userId,
        },

        include: [
          {
            model: this.databaseService.Role,
            as: 'role',
          },
        ],
      });

    return {
      success: true,
      data: userRoles.map((x) => x.role),
    };
  }

  async assignRoles(
    userId: number,
    roleIds: number[],
  ) {
    const user =
      await this.databaseService.User.findByPk(
        userId,
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    await this.databaseService.UserRole.destroy({
      where: {
        userId,
      },
    });

    for (const roleId of roleIds) {
      await this.databaseService.UserRole.create({
        userId,
        roleId,
      });
    }

    return {
      success: true,
      message:
        'Roles assigned successfully',
    };
  }

  async removeRole(
    userId: number,
    roleId: number,
  ) {
    await this.databaseService.UserRole.destroy({
      where: {
        userId,
        roleId,
      },
    });

    return {
      success: true,
      message:
        'Role removed successfully',
    };
  }
}