import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { Op } from 'sequelize';

@Injectable()
export class RolesService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // ==========================
  // Create Role
  // ==========================

  async create(data: any, adminUser: any) {

    const existing =
      await this.databaseService.Role.findOne({
        where: {
          name: data.name,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Role already exists',
      );
    }

    const role =
      await this.databaseService.Role.create({
        name: data.name,
        description: data.description,
        businessUnitId:
          data.businessUnitId ?? null,
        companyId: data.companyId ?? null,
        isSystem: false,
        isActive:
          data.isActive ?? true,
        createdBy: adminUser.id,
      });

    if (
      data.permissionIds &&
      data.permissionIds.length
    ) {
      const rows = data.permissionIds.map(
        (permissionId: number) => ({
          roleId: role.id,
          permissionId,
        }),
      );

      await this.databaseService.RolePermission.bulkCreate(
        rows,
      );
    }

    return {
      success: true,
      message:
        'Role created successfully',
      data: role,
    };
  }

  // ==========================
  // Get All Roles
  // ==========================

  async findAll(query: any, adminUser: any) {

    const page = Number(query.page) || 1;

    const limit =
      Number(query.limit) || 10;

    const offset =
      (page - 1) * limit;

    const where: any = {};

    where.isActive =
      query.status === 'false'
        ? false
        : true;

    if (query.search) {
      where.name = {
        [Op.iLike]:
          `%${query.search}%`,
      };
    }

    const { rows, count } =
      await this.databaseService.Role.findAndCountAll(
        {
          where,

          attributes: {
            include: [
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT COUNT(*) FROM role_permissions WHERE role_permissions."roleId"="Role"."id")`,
                  ),
                'permissionCount',
              ],
            ],
          },

          order: [
            ['createdAt', 'DESC'],
          ],

          limit,

          offset,
        },
      );

    return {
      success: true,
      data: rows,
      total: count,
      page,
      limit,
    };
  }

  // ==========================
  // Get Role
  // ==========================

  async findOne(
    id: number,
    adminUser: any,
  ){
    const role =
      await this.databaseService.Role.findByPk(
        id,
      );

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    const permissions =
      await this.databaseService.RolePermission.findAll(
        {
          where: {
            roleId: id,
          },

          include: [
            {
              model:
                this.databaseService.Permission,
              as: 'permission',
            },
          ],
        },
      );

    return {
      success: true,
      data: {
        role,
        permissions,
      },
    };
  }
  // ==========================
// Update Role
// ==========================

async update(
  id: number,
  data: any,
  adminUser: any,
){

  const role =
    await this.databaseService.Role.findByPk(id);

  if (!role) {
    throw new NotFoundException(
      'Role not found',
    );
  }

  const duplicate =
    await this.databaseService.Role.findOne({
      where: {
        name: data.name,
        id: {
          [Op.ne]: id,
        },
      },
    });

  if (duplicate) {
    throw new BadRequestException(
      'Role already exists',
    );
  }

  await role.update({
    name: data.name,
    description: data.description,
    businessUnitId:
      data.businessUnitId ?? null,
    companyId: data.companyId ?? null,
    isActive:
      data.isActive ?? role.isActive,
    updatedBy: adminUser.id,
    updatedAt: new Date(),
  });

  if (data.permissionIds) {
    await this.databaseService.RolePermission.destroy({
      where: {
        roleId: id,
      },
    });

    const rows = data.permissionIds.map(
      (permissionId: number) => ({
        roleId: id,
        permissionId,
      }),
    );

    await this.databaseService.RolePermission.bulkCreate(
      rows,
    );
  }

  return {
    success: true,
    message: 'Role updated successfully',
    data: role,
  };
}

// ==========================
// Delete Role
// ==========================

async remove(
  id: number,
  adminUser: any,
) {

  const role =
    await this.databaseService.Role.findByPk(id);

  if (!role) {
    throw new NotFoundException(
      'Role not found',
    );
  }

  if (role.isSystem) {
    throw new BadRequestException(
      'System roles cannot be deleted',
    );
  }

  await role.update({
    isActive: false,
    deletedBy: adminUser.id,
    deletedAt: new Date(),
  });

  return {
    success: true,
    message: 'Role deleted successfully',
  };
}

// ==========================
// Get All Permissions
// ==========================

async getPermissions() {
  const permissions =
    await this.databaseService.Permission.findAll({
      where: {
        isActive: true,
      },
      order: [
        ['module', 'ASC'],
        ['subModule', 'ASC'],
        ['action', 'ASC'],
      ],
    });

  return {
    success: true,
    data: permissions,
  };
}


async getRolePermissions(roleId: number) {
  const role =
    await this.databaseService.Role.findByPk(
      roleId,
    );

  if (!role) {
    throw new NotFoundException(
      'Role not found',
    );
  }

  const rolePermissions =
    await this.databaseService.RolePermission.findAll({
      where: {
        roleId,
      },
      include: [
        {
          model:
            this.databaseService.Permission,
          as: 'permission',
        },
      ],
    });

  return {
    success: true,
    data: rolePermissions.map(
      (x) => x.permission,
    ),
  };
}

async assignPermissions(
  roleId: number,
  permissionIds: number[],
) {
  const role =
    await this.databaseService.Role.findByPk(
      roleId,
    );

  if (!role) {
    throw new NotFoundException(
      'Role not found',
    );
  }

  await this.databaseService.RolePermission.destroy({
    where: {
      roleId,
    },
  });

  for (const permissionId of permissionIds) {
    await this.databaseService.RolePermission.create({
      roleId,
      permissionId,
    });
  }

  return {
    success: true,
    message:
      'Permissions assigned successfully',
  };
}

async removePermission(
  roleId: number,
  permissionId: number,
) {
  await this.databaseService.RolePermission.destroy({
    where: {
      roleId,
      permissionId,
    },
  });

  return {
    success: true,
    message:
      'Permission removed successfully',
  };
}
}
