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
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  UserAddedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
  UserPasswordChangedEvent,
  UserRolesUpdatedEvent,
} from '../notifications/notification.events';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
    private readonly securityLogService: SecurityLogService,
  ) {}

  // ==========================
  // Get Business Unit ID
  // ==========================

  private getBusinessUnitId(user: any): number {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    return businessUnitId;
  }

  // ==========================
  // Get Business Unit Admins
  // ==========================

private async getBusinessUnitAdmins(
  businessUnitId: number,
) {
  return this.databaseService.User.findAll({
    where: {
      isActive: true,
      [Op.or]: [
        // Superadmins are global and should
        // receive notifications for the selected BU
        {
          role: 'superadmin',
        },

        // BU Admins and Company Admins belong
        // to a specific Business Unit
        {
          businessUnitId,
          role: {
            [Op.in]: ['bu-admin', 'company-admin'],
          },
        },
      ],
    },
    attributes: ['id', 'role', 'businessUnitId'],
  });
}

  // ==========================
  // Delete User
  // ==========================

  async remove(id: number, adminUser: any) {
    const businessUnitId =
      this.getBusinessUnitId(adminUser);

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

    const userName =
      user.name || user.username;

    await this.databaseService.UserRole.destroy({
      where: {
        userId: id,
      },
    });

    await user.update({
      isActive: false,
      deletedBy: adminUser.id,
    });

    // Notify admins before destroying the user
    const adminsInBU =
      await this.getBusinessUnitAdmins(
        businessUnitId,
      );

    for (const admin of adminsInBU) {
      const event = new UserDeletedEvent(
        businessUnitId,
        admin.id,
        user.id,
        userName,
      );

      this.eventEmitter.emit(
        'user.deleted',
        event,
      );
    }

    await user.destroy();

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  // ==========================
  // Get All Users
  // ==========================

  async findAll(
    query: any,
    currentUser: any,
  ) {
    const businessUnitId =
      this.getBusinessUnitId(currentUser);

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

    // Status filter:
    // active = default
    // inactive
    // all
    if (query.status === 'inactive') {
      paranoid = false;

      where[Op.or] = [
        {
          isActive: false,
        },
        {
          deletedAt: {
            [Op.ne]: null,
          },
        },
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

    const {
      rows,
      count,
    } =
      await this.databaseService.User.findAndCountAll(
        {
          where,
          limit,
          offset,
          order: [
            ['createdAt', 'DESC'],
          ],
          paranoid,
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
  // Get Single User
  // ==========================

  async findOne(
    id: number,
    currentUser: any,
  ) {
    const businessUnitId =
      this.getBusinessUnitId(
        currentUser,
      );

    const user =
      await this.databaseService.User.findOne(
        {
          where: {
            id,
            businessUnitId,
          },
        },
      );

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

  // ==========================
  // Create User
  // ==========================

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

    const password =
      await bcrypt.hash(
        data.password,
        10,
      );

    const businessUnitId =
      this.getBusinessUnitId(
        adminUser,
      );

    const user =
      await this.databaseService.User.create(
        {
          username: data.username,
          email: data.email,
          password,
          name: data.name,

          profilePicture:
            data.profilePicture ?? null,

          role: 'user',

          businessUnitId,

          companyId: null,

          selectedBusinessUnitId:
            null,

          selectedCompanyId: null,

          isActive: true,

          createdBy: adminUser.id,
        },
      );

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

    // ==========================
    // USER ADDED NOTIFICATION
    // Notify only admins
    // ==========================

    const adminsInBU =
      await this.getBusinessUnitAdmins(
        businessUnitId,
      );

    for (const admin of adminsInBU) {
      const event =
        new UserAddedEvent(
          businessUnitId,
          admin.id,
          user.id,
          user.name ||
            user.username,
        );
console.log('EMITTING user.added EVENT:', {
  businessUnitId,
  recipientUserId: admin.id,
  targetUserId: user.id,
  userName: user.name || user.username,
});
      this.eventEmitter.emit(
        'user.added',
        event,
      );
    }

    return {
      success: true,
      message:
        'User created successfully',
      data: user,
    };
  }

  // ==========================
  // Update User
  // ==========================

  async update(
    id: number,
    data: UpdateUserDto,
    adminUser: any,
  ) {
    const businessUnitId =
      this.getBusinessUnitId(
        adminUser,
      );

    const user =
      await this.databaseService.User.findOne(
        {
          where: {
            id,
            businessUnitId,
          },
        },
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const {
      roleIds,
      password,
      ...rest
    } = data as any;

    const updateData: any = {
      ...rest,
    };

    if (password) {
      updateData.password =
        await bcrypt.hash(
          password,
          10,
        );
    }

    await user.update({
      ...updateData,
      updatedBy: adminUser.id,
    });

    const userName =
      user.name || user.username;

    // ==========================
    // PASSWORD CHANGED
    // ==========================

    if (password) {
      await this.securityLogService.create(
        'password_changed',
        {
          userId: user.id,
          username: user.username,
          businessUnitId:
            user.businessUnitId,
          details: {
            changedBy: 'admin',
            adminId: adminUser.id,
          },
        },
      );
    }

    // ==========================
    // ROLES UPDATED
    // ==========================

    if (
      roleIds &&
      Array.isArray(roleIds)
    ) {
      await this.databaseService.UserRole.destroy(
        {
          where: {
            userId: id,
          },
        },
      );

      await this.databaseService.UserRole.bulkCreate(
        roleIds.map(
          (roleId: number) => ({
            userId: id,
            roleId,
          }),
        ),
      );
    }

    // ==========================
    // FIND ADMINS
    // ==========================

    const adminsInBU =
      await this.getBusinessUnitAdmins(
        businessUnitId,
      );

    // ==========================
    // USER UPDATED
    // ==========================

    for (const admin of adminsInBU) {
      const event =
        new UserUpdatedEvent(
          businessUnitId,
          admin.id,
          user.id,
          userName,
        );

      this.eventEmitter.emit(
        'user.updated',
        event,
      );
    }

    // ==========================
    // PASSWORD CHANGED
    // ==========================

    if (password) {
      for (const admin of adminsInBU) {
        const event =
          new UserPasswordChangedEvent(
            businessUnitId,
            admin.id,
            user.id,
            userName,
          );

        this.eventEmitter.emit(
          'user.password.changed',
          event,
        );
      }
    }

    // ==========================
    // ROLES UPDATED
    // ==========================

    if (
      roleIds &&
      Array.isArray(roleIds)
    ) {
      for (const admin of adminsInBU) {
        const event =
          new UserRolesUpdatedEvent(
            businessUnitId,
            admin.id,
            user.id,
            userName,
          );

        this.eventEmitter.emit(
          'user.roles.updated',
          event,
        );
      }
    }

    return {
      success: true,
      message:
        'User updated successfully',
      data: user,
    };
  }

  // ==========================
  // Get My Own Profile
  // ==========================

  async getMe(userId: number) {
    const user =
      await this.databaseService.User.findByPk(
        userId,
        {
          attributes: {
            exclude: ['password'],
          },
        },
      );

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

  // ==========================
  // Update My Own Profile
  // ==========================

  async updateMe(
    userId: number,
    data: UpdateMeDto,
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
      data.email &&
      data.email !== user.email
    ) {
      const existing =
        await this.databaseService.User.findOne(
          {
            where: {
              email: data.email,
              id: {
                [Op.ne]: userId,
              },
            },
          },
        );

      if (existing) {
        throw new BadRequestException(
          'Email already in use',
        );
      }
    }

    const updateData: any = {
      name:
        data.name ?? user.name,

      email:
        data.email ?? user.email,

      profilePicture:
        data.profilePicture ??
        user.profilePicture,
    };

    if (data.password) {
      updateData.password =
        await bcrypt.hash(
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
          businessUnitId:
            user.businessUnitId,
          details: {
            changedBy: 'self',
          },
        },
      );
    }

    const {
      password,
      ...safeUser
    } = user.toJSON();

    return {
      success: true,
      message:
        'Profile updated successfully',
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
      this.getBusinessUnitId(
        adminUser,
      );

    if (
      user.businessUnitId !==
      businessUnitId
    ) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const roles =
      await this.databaseService.UserRole.findAll(
        {
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
        },
      );

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

    const businessUnitId =
      this.getBusinessUnitId(
        adminUser,
      );

    if (
      user.businessUnitId !==
      businessUnitId
    ) {
      throw new NotFoundException(
        'User not found',
      );
    }

    await this.databaseService.UserRole.destroy(
      {
        where: {
          userId,
        },
      },
    );

    const rows =
      roleIds.map(
        (roleId) => ({
          userId,
          roleId,
        }),
      );

    await this.databaseService.UserRole.bulkCreate(
      rows,
    );

    // ==========================
    // ROLE UPDATED NOTIFICATION
    // ==========================

    const adminsInBU =
      await this.getBusinessUnitAdmins(
        businessUnitId,
      );

    for (const admin of adminsInBU) {
      const event =
        new UserRolesUpdatedEvent(
          businessUnitId,
          admin.id,
          user.id,
          user.name ||
            user.username,
        );

      this.eventEmitter.emit(
        'user.roles.updated',
        event,
      );
    }

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

    const businessUnitId =
      this.getBusinessUnitId(
        adminUser,
      );

    if (
      user.businessUnitId !==
      businessUnitId
    ) {
      throw new NotFoundException(
        'User not found',
      );
    }

    await this.databaseService.UserRole.destroy(
      {
        where: {
          userId,
          roleId,
        },
      },
    );

    // ==========================
    // ROLE UPDATED NOTIFICATION
    // ==========================

    const adminsInBU =
      await this.getBusinessUnitAdmins(
        businessUnitId,
      );

    for (const admin of adminsInBU) {
      const event =
        new UserRolesUpdatedEvent(
          businessUnitId,
          admin.id,
          user.id,
          user.name ||
            user.username,
        );

      this.eventEmitter.emit(
        'user.roles.updated',
        event,
      );
    }

    return {
      success: true,
      message:
        'Role removed successfully',
    };
  }
}