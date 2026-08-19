import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { DatabaseService } from '../database/database.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger('NotificationService');

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private resolveBusinessUnitId(user: any) {
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

  async create(businessUnitId: number, createDto: any) {
    try {
      const notification = await this.databaseService.Notification.create({
        businessUnitId,
        userId: createDto.userId,
        type: createDto.type,
        title: createDto.title,
        message: createDto.message,
        actionUrl: createDto.actionUrl || null,
        metadata: createDto.metadata || null,
      });

      this.logger.log(
        `Notification created for user ${createDto.userId}: ${createDto.type}`,
      );

      return notification;
    } catch (error) {
      this.logger.error('Failed to create notification', error);
      throw error;
    }
  }

  async handleNotificationEvent(event: any) {
    try {
      const notification = await this.create(event.businessUnitId, {
        userId: event.userId,
        type: event.type,
        title: event.title,
        message: event.message,
        actionUrl: event.actionUrl,
        metadata: event.metadata,
      });

      return notification;
    } catch (error) {
      this.logger.error('Failed to handle notification event', error);
    }
  }

  async getUnreadCount(businessUnitId: number, userId: number) {
    const count = await this.databaseService.Notification.count({
      where: {
        businessUnitId,
        userId,
        isRead: false,
      },
    });

    return count;
  }

  async getNotifications(
    businessUnitId: number,
    userId: number,
    page = 1,
    limit = 10,
  ) {
    const offset = (page - 1) * limit;

    const { rows, count } =
      await this.databaseService.Notification.findAndCountAll({
        where: {
          businessUnitId,
          userId,
        },
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

    const unreadCount = await this.getUnreadCount(businessUnitId, userId);

    return {
      data: rows,
      total: count,
      page,
      limit,
      unreadCount,
    };
  }

  async markAsRead(
    businessUnitId: number,
    userId: number,
    notificationId: number,
  ) {
    await this.databaseService.Notification.update(
      { isRead: true },
      {
        where: {
          id: notificationId,
          userId,
          businessUnitId,
        },
      },
    );
  }

  async markAllAsRead(businessUnitId: number, userId: number) {
    const result = await this.databaseService.Notification.update(
      { isRead: true },
      {
        where: {
          businessUnitId,
          userId,
          isRead: false,
        },
      },
    );

    return result;
  }

  async deleteNotification(
    businessUnitId: number,
    userId: number,
    notificationId: number,
  ) {
    await this.databaseService.Notification.destroy({
      where: {
        id: notificationId,
        userId,
        businessUnitId,
      },
    });
  }

  async deleteAllNotifications(businessUnitId: number, userId: number) {
    await this.databaseService.Notification.destroy({
      where: {
        businessUnitId,
        userId,
      },
    });
  }

  async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.databaseService.Notification.destroy({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
        isRead: true,
      },
    });

    this.logger.log(`Cleaned up ${result} old notifications`);
    return result;
  }
}