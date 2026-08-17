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

async create(body: any, user: any) {
  const businessUnitId =
    user.role === 'superadmin'
      ? user.selectedBusinessUnitId
      : user.businessUnitId;

  if (!businessUnitId) {
    throw new BadRequestException(
      'Please select a Business Unit first',
    );
  }

  const existing =
    await this.databaseService.Role.findOne({
      where: {
        name: body.name,
        businessUnitId,
        isActive: true,
      },
    });

  if (existing) {
    throw new BadRequestException(
      'Role already exists',
    );
  }

  // Create Role
  const role =
    await this.databaseService.Role.create({
      name: body.name,
      description: body.description,

      businessUnitId,
      companyId: null,

      isSystem: false,
      isActive: true,

      createdBy: user.id,
    });

  // Assign permissions
  console.log("BODY:", body);
console.log("permissionIds:", body.permissionIds);
console.log("Role ID:", role.id);
  if (
    body.permissionIds &&
    body.permissionIds.length > 0
  ) {
    const rows = body.permissionIds.map(
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
    message: 'Role created successfully',
    data: role,
  };
}

  // ==========================
  // Get All Roles
  // ==========================

  async findAll(
    query: any,
    user: any,
  ) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const page =
      Number(query.page) || 1;

    const limit =
      Number(query.limit) || 10;

    const offset =
      (page - 1) * limit;

    const where: any = {
      businessUnitId,
    };

    let paranoid = true;

    if (query.status === 'inactive' || query.status === 'false') {
      paranoid = false;
      where[Op.or] = [
        { isActive: false },
        { deletedAt: { [Op.ne]: null } },
      ];
    } else if (query.status === 'all') {
      paranoid = false;
    } else {
      where.isActive = true;
    }

    if (query.search) {
      where.name = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    const { rows, count } =
      await this.databaseService.Role.findAndCountAll({
        where,
        paranoid,

include: [
  {
    model: this.databaseService.UserRole,
    as: "userRoles",
    include: [
      {
        model: this.databaseService.User,
        as: "user",
        attributes: ["id", "name", "username"],
      },
    ],
  },
  {
    model: this.databaseService.RolePermission,
    as: "rolePermissions",
    include: [
      {
        model: this.databaseService.Permission,
        as: "permission",
      },
    ],
  },
],

        order: [
          ['createdAt', 'DESC'],
        ],

        limit,
        offset,
      });

    return {
      success: true,
      data: rows,
      total: count,
      page,
      limit,
    };
  }

  // ==========================
  // Get Single Role
  // ==========================

  async findOne(
    id: number,
    user: any,
  ) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

const role =
  await this.databaseService.Role.findOne({
    where: {
      id,
      businessUnitId,
      isActive: true,
    },
    include: [
      {
        model: this.databaseService.RolePermission,
        as: "rolePermissions",
      },
    ],
  });
  

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    return {
      success: true,
      data: role,
    };
  }

  // ==========================
  // Update Role
  // ==========================

// ==========================
// Update Role
// ==========================

async update(
  id: number,
  body: any,
  user: any,
) {
  const businessUnitId =
    user.role === "superadmin"
      ? user.selectedBusinessUnitId
      : user.businessUnitId;

  const role =
    await this.databaseService.Role.findOne({
      where: {
        id,
        businessUnitId,
        isActive: true,
      },
    });

  if (!role) {
    throw new NotFoundException(
      "Role not found",
    );
  }

  // Update role details
  await role.update({
    name: body.name,
    description: body.description,
    updatedBy: user.id,
  });

  // Update permissions
  if (Array.isArray(body.permissionIds)) {
    // Remove old permissions
    await this.databaseService.RolePermission.destroy({
      where: {
        roleId: id,
      },
    });

    // Insert new permissions
    if (body.permissionIds.length > 0) {
      await this.databaseService.RolePermission.bulkCreate(
        body.permissionIds.map(
          (permissionId: number) => ({
            roleId: id,
            permissionId,
          }),
        ),
      );
    }
  }

  return {
    success: true,
    message: "Role updated successfully",
    data: role,
  };
}

  // ==========================
  // Delete Role
  // ==========================

  async remove(
    id: number,
    user: any,
  ) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    const role =
      await this.databaseService.Role.findOne({
        where: {
          id,
          businessUnitId,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

    await role.update({
      isActive: false,
      deletedBy: user.id,
    });
    await role.destroy();

    return {
      success: true,
      message:
        'Role deleted successfully',
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

  // ==========================
  // Get Role Permissions
  // ==========================

  async getRolePermissions(
    roleId: number,
    user: any,
  ) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const role =
      await this.databaseService.Role.findOne({
        where: {
          id: roleId,
          businessUnitId,
          isActive: true,
        },
      });

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
        (x: any) => x.permission,
      ),
    };
  }

  // ==========================
  // Assign Permissions
  // ==========================

  async assignPermissions(
    roleId: number,
    permissionIds: number[],
    user: any,
  ) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const role =
      await this.databaseService.Role.findOne({
        where: {
          id: roleId,
          businessUnitId,
          isActive: true,
        },
      });

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

    const rows =
      permissionIds.map(
        (permissionId: number) => ({
          roleId,
          permissionId,
        }),
      );

    await this.databaseService.RolePermission.bulkCreate(
      rows,
    );

    return {
      success: true,
      message:
        'Permissions assigned successfully',
    };
  }

  // ==========================
  // Remove Permission
  // ==========================

  async removePermission(
    roleId: number,
    permissionId: number,
    user: any,
  ) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const role =
      await this.databaseService.Role.findOne({
        where: {
          id: roleId,
          businessUnitId,
          isActive: true,
        },
      });

    if (!role) {
      throw new NotFoundException(
        'Role not found',
      );
    }

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

  async updateStatus(
  id: number,
  isActive: boolean,
  user: any,
) {
  const businessUnitId =
    user.role === 'superadmin'
      ? user.selectedBusinessUnitId
      : user.businessUnitId;

  const role =
    await this.databaseService.Role.findOne({
      where: {
        id,
        businessUnitId,
      },
    });

  if (!role) {
    throw new NotFoundException(
      'Role not found',
    );
  }

  await role.update({
    isActive,
    updatedBy: user.id,
  });

  return {
    success: true,
    message: `Role ${
      isActive ? 'activated' : 'deactivated'
    } successfully`,
    data: role,
  };
}
}