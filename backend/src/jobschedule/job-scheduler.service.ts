import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Op } from 'sequelize';

import { DatabaseService } from '../database/database.service';
import { ReportsService } from '../reports/reports.service';
import { MailService } from '../mail/mail.service';
import {
  computeNextRun,
  calculateDateRangeForSchedule,
  generateScheduledReportFileName,
} from './next-run.calculator';

@Injectable()
export class JobSchedulerService {
  private readonly logger = new Logger(
    JobSchedulerService.name,
  );

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly reportsService: ReportsService,
    private readonly mailService: MailService,
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

  private validateFrequencyFields(data: any) {
    if (
      data.frequency === 'weekly' &&
      (data.dayOfWeek === undefined ||
        data.dayOfWeek === null)
    ) {
      throw new BadRequestException(
        'dayOfWeek is required for weekly schedules',
      );
    }

    if (
      data.frequency === 'monthly' &&
      (data.dayOfMonth === undefined ||
        data.dayOfMonth === null)
    ) {
      throw new BadRequestException(
        'dayOfMonth is required for monthly schedules',
      );
    }
  }

  async findAll(query: any, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows, count } =
      await this.databaseService.JobSchedule.findAndCountAll(
        {
          where: { businessUnitId },
          limit,
          offset,
          order: [['createdAt', 'DESC']],
        },
      );

    const reportIds = [
      ...new Set(rows.map((r: any) => r.reportId)),
    ];

    const reports =
      await this.databaseService.Report.findAll({
        where: { id: reportIds },
        attributes: ['id', 'name'],
      });

    const reportNameById = new Map(
      reports.map((r: any) => [r.id, r.name]),
    );

    const allRecipientIds = [
      ...new Set(
        rows.flatMap(
          (r: any) => r.recipientUserIds || [],
        ),
      ),
    ];

    const users =
      await this.databaseService.User.findAll({
        where: { id: allRecipientIds },
        attributes: ['id', 'name', 'email'],
      });

    const userById = new Map(
      users.map((u: any) => [u.id, u]),
    );

    const data = rows.map((row: any) => {
      const json = row.toJSON();

      return {
        ...json,
        reportName:
          reportNameById.get(json.reportId) ?? null,
        recipients: (json.recipientUserIds || []).map(
          (id: number) => userById.get(id) ?? { id },
        ),
      };
    });

    return {
      success: true,
      data,
      total: count,
      page,
      limit,
    };
  }

  async findOne(id: number, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const schedule =
      await this.databaseService.JobSchedule.findOne({
        where: { id, businessUnitId },
      });

    if (!schedule) {
      throw new NotFoundException(
        'Job schedule not found',
      );
    }

    return {
      success: true,
      data: schedule,
    };
  }

  async create(data: any, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    this.validateFrequencyFields(data);

    const report =
      await this.databaseService.Report.findOne({
        where: { id: data.reportId, businessUnitId },
      });

    if (!report) {
      throw new BadRequestException(
        'Report not found',
      );
    }

    const nextRunAt = computeNextRun(
      data.frequency,
      data.time,
      data.dayOfWeek,
      data.dayOfMonth,
    );

    const schedule =
      await this.databaseService.JobSchedule.create({
        reportId: data.reportId,
        recipientUserIds: data.recipientUserIds,
        frequency: data.frequency,
        time: data.time,
        dayOfWeek: data.dayOfWeek ?? null,
        dayOfMonth: data.dayOfMonth ?? null,
        isActive: true,
        lastRunAt: null,
        nextRunAt,
        businessUnitId,
        createdBy: user.id,
      });

    return {
      success: true,
      message: 'Job schedule created successfully',
      data: schedule,
    };
  }

  async update(id: number, data: any, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const schedule =
      await this.databaseService.JobSchedule.findOne({
        where: { id, businessUnitId },
      });

    if (!schedule) {
      throw new NotFoundException(
        'Job schedule not found',
      );
    }

    const merged = {
      frequency: data.frequency ?? schedule.frequency,
      time: data.time ?? schedule.time,
      dayOfWeek:
        data.dayOfWeek !== undefined
          ? data.dayOfWeek
          : schedule.dayOfWeek,
      dayOfMonth:
        data.dayOfMonth !== undefined
          ? data.dayOfMonth
          : schedule.dayOfMonth,
    };

    this.validateFrequencyFields(merged);

    const scheduleChanged =
      data.frequency !== undefined ||
      data.time !== undefined ||
      data.dayOfWeek !== undefined ||
      data.dayOfMonth !== undefined;

    const nextRunAt = scheduleChanged
      ? computeNextRun(
          merged.frequency,
          merged.time,
          merged.dayOfWeek,
          merged.dayOfMonth,
        )
      : schedule.nextRunAt;

    await schedule.update({
      reportId: data.reportId ?? schedule.reportId,
      recipientUserIds:
        data.recipientUserIds ??
        schedule.recipientUserIds,
      ...merged,
      isActive:
        data.isActive ?? schedule.isActive,
      nextRunAt,
      updatedBy: user.id,
    });

    return {
      success: true,
      message: 'Job schedule updated successfully',
      data: schedule,
    };
  }

  async remove(id: number, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const schedule =
      await this.databaseService.JobSchedule.findOne({
        where: { id, businessUnitId },
      });

    if (!schedule) {
      throw new NotFoundException(
        'Job schedule not found',
      );
    }

    await schedule.destroy();

    return {
      success: true,
      message: 'Job schedule deleted successfully',
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async runDueSchedules() {
    const now = new Date();

    const dueSchedules =
      await this.databaseService.JobSchedule.findAll({
        where: {
          isActive: true,
          nextRunAt: { [Op.lte]: now },
        },
      });

    for (const schedule of dueSchedules) {
      try {
        await this.executeSchedule(schedule);
      } catch (error) {
        this.logger.error(
          `Failed to run job schedule ${schedule.id}`,
          error as Error,
        );
      }
    }
  }

  private async executeSchedule(schedule: any) {
    const report =
      await this.databaseService.Report.findByPk(
        schedule.reportId,
      );

    if (report) {
      const systemUser = {
        id: schedule.createdBy,
        role: 'bu-admin',
        businessUnitId: schedule.businessUnitId,
        selectedBusinessUnitId:
          schedule.businessUnitId,
      };

      const executionDate = new Date();
      const { startDate, endDate } =
        calculateDateRangeForSchedule(
          schedule.frequency,
          executionDate,
        );

      const mergedFilters = {
        ...report.filters,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      const buffer =
        await this.reportsService.exportToExcel(
          report.moduleKey,
          report.columns,
          mergedFilters,
          systemUser,
        );

      const filename =
        generateScheduledReportFileName(
          schedule.frequency,
          report.name,
          executionDate,
        );

      const recipients =
        await this.databaseService.User.findAll({
          where: {
            id: schedule.recipientUserIds,
          },
          attributes: ['email'],
        });

      const emails = recipients
        .map((r: any) => r.email)
        .filter(Boolean);

      await this.mailService.sendScheduledReportEmail(
        emails,
        report.name,
        buffer,
        filename,
      );
    } else {
      this.logger.warn(
        `Job schedule ${schedule.id} points at a deleted report — skipping send, still advancing nextRunAt`,
      );
    }

    const nextRunAt = computeNextRun(
      schedule.frequency,
      schedule.time,
      schedule.dayOfWeek,
      schedule.dayOfMonth,
      new Date(),
    );

    await schedule.update({
      lastRunAt: new Date(),
      nextRunAt,
    });
  }
}