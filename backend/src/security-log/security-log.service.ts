import { Injectable, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { getAuditContext } from '../audit-log/audit-context';
import { DatabaseService } from '../database/database.service';

type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'account_locked'
  | 'password_changed'
  | 'password_reset'
  | 'suspicious_activity';

@Injectable()
export class SecurityLogService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(
    eventType: SecurityEventType,
    options: {
      userId?: number | null;
      username?: string | null;
      details?: Record<string, any> | null;
      businessUnitId?: number | null;
    } = {},
  ) {
    const ctx = getAuditContext();

    return this.databaseService.SecurityLog.create({
      eventType,
      userId: options.userId ?? null,
      username: options.username ?? null,
      ipAddress: ctx?.ipAddress ?? null,
      userAgent: ctx?.userAgent ?? null,
      businessUnitId:
        options.businessUnitId ?? ctx?.businessUnitId ?? null,
      details: options.details ?? null,
    });
  }

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

    if (query.eventType) {
      where.eventType = query.eventType;
    }

    if (query.username) {
      where.username = {
        [Op.iLike]: `%${query.username}%`,
      };
    }

    if (query.ipAddress) {
      where.ipAddress = {
        [Op.iLike]: `%${query.ipAddress}%`,
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
      await this.databaseService.SecurityLog.findAndCountAll({
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

  async countFailedAttemptsForUser(
    userId: number | null,
    username: string,
    windowMinutes: number,
  ) {
    const windowStart = new Date(
      Date.now() - windowMinutes * 60 * 1000,
    );

    const where: any = {
      eventType: 'login_failed',
      createdAt: {
        [Op.gte]: windowStart,
      },
    };

    const orConditions: Array<Record<string, any>> = [];

    if (typeof userId === 'number') {
      orConditions.push({ userId });
    }

    if (username) {
      orConditions.push({ username });
    }

    if (orConditions.length > 0) {
      where[Op.or] = orConditions;
    }

    return this.databaseService.SecurityLog.count({
      where,
    });
  }

  async countFailedAttemptsByIp(
    ipAddress: string,
    windowMinutes: number,
  ) {
    const windowStart = new Date(
      Date.now() - windowMinutes * 60 * 1000,
    );

    return this.databaseService.SecurityLog.count({
      where: {
        eventType: 'login_failed',
        ipAddress,
        createdAt: {
          [Op.gte]: windowStart,
        },
      },
    });
  }

  async hasPreviousSuccessfulLoginFromOtherIp(
    userId: number,
    ipAddress: string,
  ) {
    const count = await this.databaseService.SecurityLog.count(
      {
        where: {
          eventType: 'login_success',
          userId,
          ipAddress: {
            [Op.ne]: ipAddress,
          },
        },
      },
    );

    return count > 0;
  }

  async hasRecentSuspiciousActivity(
    ipAddress: string,
    windowMinutes: number,
  ) {
    const windowStart = new Date(
      Date.now() - windowMinutes * 60 * 1000,
    );

    const count = await this.databaseService.SecurityLog.count({
      where: {
        eventType: 'suspicious_activity',
        ipAddress,
        createdAt: {
          [Op.gte]: windowStart,
        },
      },
    });

    return count > 0;
  }
}
