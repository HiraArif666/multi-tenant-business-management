import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { UpdateMeDto } from './dto/update-me.dto';

import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';

import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SecurityLogService } from '../security-log/security-log.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly securityLogService: SecurityLogService,
  ) {}

  async remove(id: number, adminUser: any) {
    const businessUnitId =
      adminUser.role === 'superadmin'
        ? adminUser.selectedBusinessUnitId
        : adminUser.businessUnitId;

    const user = await this.databaseService.User.findOne({
      where: {
        id,
        businessUnitId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.databaseService.UserRole.destroy({
      where: { userId: id },
    });

    await user.update({
      isActive: false,
      deletedBy: adminUser.id,
    });
    await user.destroy();

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

async findAll(
  query: any,
  currentUser: any,
) {
  const businessUnitId =
    currentUser.role === 'superadmin'
      ? currentUser.selectedBusinessUnitId
      : currentUser.businessUnitId;

  if (!businessUnitId) {
    throw new BadRequestException(
      'Please select a Business Unit first',
    );
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const offset = (page - 1) * limit;

  const where: any = {
    businessUnitId,
  };

  let paranoid = true;

  // Status filter: 'active' (default), 'inactive', or 'all'
  if (query.status === 'inactive') {
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

  if (query.role) {
    where.role = query.role;
  }

  const { rows, count } =
    await this.databaseService.User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      paranoid,
    });

  return {
    success: true,
    data: rows,
    total: count,
    page,
    limit,
  };
}



async findOne(
  id: number,
  currentUser: any,
) {
  const businessUnitId =
    currentUser.role === 'superadmin'
      ? currentUser.selectedBusinessUnitId
      : currentUser.businessUnitId;

  const user =
    await this.databaseService.User.findOne({
      where: {
        id,
        businessUnitId,
      },
    });

  if (!user) {
    throw new NotFoundException(
      'User not found',
    );
  }

  return {
    success: true,
    data: user,
  };
}



async create(
  data: CreateUserDto,
  adminUser: any,
) {
  const existing =
    await this.databaseService.User.findOne({
      where: {
        [Op.or]: [
          {
            username: data.username,
          },
          {
            email: data.email,
          },
        ],
      },
    });

  if (existing) {
    throw new BadRequestException(
      'Username or Email already exists',
    );
  }

  const password = await bcrypt.hash(
    data.password,
    10,
  );

const user = await this.databaseService.User.create({
  username: data.username,
  email: data.email,
  password,
  name: data.name,

  profilePicture: data.profilePicture ?? null,

  role: 'user',

  businessUnitId:
    adminUser.role === 'superadmin'
      ? adminUser.selectedBusinessUnitId
      : adminUser.businessUnitId,

  companyId: null,

  selectedBusinessUnitId: null,
  selectedCompanyId: null,

  isActive: true,

  createdBy: adminUser.id,
});

  if (
    data.roleIds &&
    Array.isArray(data.roleIds)
  ) {
    await this.databaseService.UserRole.bulkCreate(
      data.roleIds.map(
        (roleId: number) => ({
          userId: user.id,
          roleId,
        }),
      ),
    );
  }

  return {
    success: true,
    message: 'User created successfully',
    data: user,
  };
}


async update(
  id: number,
  data: UpdateUserDto,
  adminUser: any,
) {
  const where: any = {
    id,
  };

  if (adminUser.role === 'superadmin') {
    where.businessUnitId =
      adminUser.selectedBusinessUnitId;
  } else {
    where.businessUnitId =
      adminUser.businessUnitId;
  }

  const user =
    await this.databaseService.User.findOne({
      where,
    });

  if (!user) {
    throw new NotFoundException(
      'User not found',
    );
  }

  const { roleIds, password, ...rest } = data as any;

  const updateData: any = { ...rest };

  if (password) {
    updateData.password = await bcrypt.hash(
      password,
      10,
    );
  }

  await user.update({
    ...updateData,
    updatedBy: adminUser.id,
  });

  if (password) {
    await this.securityLogService.create(
      'password_changed',
      {
        userId: user.id,
        username: user.username,
        businessUnitId: user.businessUnitId,
        details: {
          changedBy: 'admin',
          adminId: adminUser.id,
        },
      },
    );
  }

  if (roleIds && Array.isArray(roleIds)) {
    await this.databaseService.UserRole.destroy({
      where: { userId: id },
    });

    await this.databaseService.UserRole.bulkCreate(
      roleIds.map((roleId: number) => ({
        userId: id,
        roleId,
      })),
    );
  }

  return {
    success: true,
    message: 'User updated successfully',
    data: user,
  };
}


// ==========================
  // Get My Own Profile
  // ==========================

  async getMe(userId: number) {
    const user = await this.databaseService.User.findByPk(
      userId,
      {
        attributes: {
          exclude: ['password'],
        },
      },
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  // ==========================
  // Update My Own Profile
  // ==========================

  async updateMe(userId: number, data: UpdateMeDto) {
    const user =
      await this.databaseService.User.findByPk(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing =
        await this.databaseService.User.findOne({
          where: {
            email: data.email,
            id: { [Op.ne]: userId },
          },
        });

      if (existing) {
        throw new BadRequestException(
          'Email already in use',
        );
      }
    }

    const updateData: any = {
      name: data.name ?? user.name,
      email: data.email ?? user.email,
      profilePicture:
        data.profilePicture ?? user.profilePicture,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(
        data.password,
        10,
      );
    }

    await user.update(updateData);

    if (data.password) {
      await this.securityLogService.create(
        'password_changed',
        {
          userId: user.id,
          username: user.username,
          businessUnitId: user.businessUnitId,
          details: {
            changedBy: 'self',
          },
        },
      );
    }

    const { password, ...safeUser } = user.toJSON();

    return {
      success: true,
      message: 'Profile updated successfully',
      data: safeUser,
    };
  }

  
  // ==========================
  // Get User Roles
  // ==========================

  async getRoles(
    userId: number,
    adminUser: any,
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

const businessUnitId =
  adminUser.role === 'superadmin'
    ? adminUser.selectedBusinessUnitId
    : adminUser.businessUnitId;

if (user.businessUnitId !== businessUnitId) {
  throw new NotFoundException(
    'User not found',
  );
}

    const roles =
      await this.databaseService.UserRole.findAll({
        where: {
          userId,
        },
        include: [
          {
            model:
              this.databaseService.Role,
            as: 'role',
          },
        ],
      });

    return {
      success: true,
      data: roles.map(
        (x: any) => x.role,
      ),
    };
  }

  // ==========================
  // Assign Roles
  // ==========================

  async assignRoles(
    userId: number,
    roleIds: number[],
    adminUser: any,
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

    if (
      user.businessUnitId !==
      adminUser.selectedBusinessUnitId
    ) {
      throw new NotFoundException(
        'User not found',
      );
    }

    await this.databaseService.UserRole.destroy({
      where: {
        userId,
      },
    });

    const rows = roleIds.map(
      (roleId) => ({
        userId,
        roleId,
      }),
    );

    await this.databaseService.UserRole.bulkCreate(
      rows,
    );

    return {
      success: true,
      message:
        'Roles assigned successfully',
    };
  }

  // ==========================
  // Remove Role
  // ==========================

  async removeRole(
    userId: number,
    roleId: number,
    adminUser: any,
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

    if (
      user.businessUnitId !==
      adminUser.selectedBusinessUnitId
    ) {
      throw new NotFoundException(
        'User not found',
      );
    }

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