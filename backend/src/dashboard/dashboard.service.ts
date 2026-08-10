import { Injectable, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly databaseService: DatabaseService) {}

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

  async expensesThisMonth(user: any) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const total =
      (await this.databaseService.Expense.sum('amount', {
        where: {
          businessUnitId,
          isActive: true,
          createdAt: {
            [Op.gte]: start,
            [Op.lt]: end,
          },
        },
      })) || 0;

    return { totalAmount: total };
  }

  async pendingApprovals(user: any) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const count = await this.databaseService.Expense.count({
      where: {
        businessUnitId,
        isActive: true,
        status: 'pending',
      },
    });

    return { pending: count };
  }

  async monthlyExpenseChart(user: any, months = 6) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const results: Array<{ label: string; total: number }> = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const total =
        (await this.databaseService.Expense.sum('amount', {
          where: {
            businessUnitId,
            isActive: true,
            createdAt: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
          },
        })) || 0;

      results.push({
        label: start.toLocaleString('en-GB', { month: 'short', year: 'numeric' }),
        total: Number(total),
      });
    }

    return results;
  }

  // Top expense items by title (fallback when categories are not available)
  async topExpenseItems(user: any, limit = 5) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const sequelize = this.databaseService.getSequelize();

    const rows = await this.databaseService.Expense.findAll({
      where: { businessUnitId, isActive: true },
      attributes: [
        'title',
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
      ],
      group: ['title'],
      order: [[sequelize.literal('"totalAmount"'), 'DESC']],
      limit,
    });

    return rows.map((r: any) => ({
      title: r.title,
      total: Number(r.get ? r.get('totalAmount') : r.totalAmount || 0),
    }));
  }

  async recentActivity(user: any, limit = 10) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const rows = await this.databaseService.AuditLog.findAll({
      where: { businessUnitId },
      order: [['createdAt', 'DESC']],
      limit,
    });

    return rows;
  }

  async overview(query: any, user: any) {
    const [expensesMonth, pending, monthlyChart, topItems, recent] = await Promise.all([
      this.expensesThisMonth(user),
      this.pendingApprovals(user),
      this.monthlyExpenseChart(user, 6),
      this.topExpenseItems(user, 5),
      this.recentActivity(user, 10),
    ]);

    return {
      success: true,
      data: {
        expensesMonth: expensesMonth.totalAmount,
        pendingApprovals: pending.pending,
        monthlyChart,
        topItems,
        recentActivity: recent,
      },
    };
  }
}
