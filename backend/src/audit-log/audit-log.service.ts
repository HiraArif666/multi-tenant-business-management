import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { Op } from 'sequelize';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findAll(query: any, user: any) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const offset = (page - 1) * limit;

    const where: any = {
      businessUnitId,
    };

    if (query.module) {
      where.module = query.module;
    }

    if (query.action) {
      where.action = query.action;
    }

    if (query.tableName) {
      where.tableName = query.tableName;
    }

    if (query.search) {
      where.userName = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};

      if (query.dateFrom) {
        where.createdAt[Op.gte] = new Date(
          query.dateFrom,
        );
      }

      if (query.dateTo) {
        where.createdAt[Op.lte] = new Date(
          query.dateTo,
        );
      }
    }

    const { rows, count } =
      await this.databaseService.AuditLog.findAndCountAll(
        {
          where,
          limit,
          offset,
          order: [['createdAt', 'DESC']],
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

  // Distinct module names currently in the log, for the filter dropdown
  async getModules(user: any) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const rows =
      await this.databaseService.AuditLog.findAll({
        where: { businessUnitId },
        attributes: ['module'],
        group: ['module'],
        order: [['module', 'ASC']],
      });

    return {
      success: true,
      data: rows.map((r: any) => r.module),
    };
  }
}