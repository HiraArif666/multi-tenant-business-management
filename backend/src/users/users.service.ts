import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

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
      });

    return {
      success: true,
      data: rows,
      total: count,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const user =
      await this.databaseService.User.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
    };
  }

  async create(data: any, adminUser: any) {
    const existing =
      await this.databaseService.User.findOne({
        where: {
          [Op.or]: [
            { username: data.username },
            { email: data.email },
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

    const user =
      await this.databaseService.User.create({
        ...data,
        password,
        createdBy: adminUser.id,
      });

    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
  }

  async update(
    id: number,
    data: any,
    adminUser: any,
  ) {
    const user =
      await this.databaseService.User.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.password) {
      data.password = await bcrypt.hash(
        data.password,
        10,
      );
    }

    await user.update({
      ...data,
      updatedBy: adminUser.id,
    });

    return {
      success: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  async remove(
    id: number,
    adminUser: any,
  ) {
    const user =
      await this.databaseService.User.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.update({
      isActive: false,
      deletedBy: adminUser.id,
      deletedAt: new Date(),
    });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}