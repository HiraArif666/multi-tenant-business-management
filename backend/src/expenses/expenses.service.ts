import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { Op } from 'sequelize';

import { DatabaseService } from '../database/database.service';
import { ApprovalSettingsService } from '../settings/approval-settings.service';

const MODULE_NAME = 'expense';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly approvalSettingsService: ApprovalSettingsService,
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

  // ==========================
  // Find All
  // ==========================

  async findAll(query: any, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {
      businessUnitId,
      isActive: true,

    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.title = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    const { rows, count } =
      await this.databaseService.Expense.findAndCountAll(
        {
          where,
          limit,
          offset,
          order: [['createdAt', 'DESC']],

          include: [
            {
              association: 'approver',
              attributes: ['id', 'name'],
            },
          ],

          attributes: {
            include: [
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "Expense"."createdBy")`,
                  ),
                'createdByName',
              ],
            ],
          },
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
  // Find One
  // ==========================

  async findOne(id: number, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const expense =
      await this.databaseService.Expense.findOne({
        where: {
          id,
          businessUnitId,
        },

        include: [
          {
            association: 'approver',
            attributes: ['id', 'name'],
          },
        ],
      });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return {
      success: true,
      data: expense,
    };
  }

  // ==========================
  // Create
  // ==========================

  async create(data: any, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const expense =
      await this.databaseService.Expense.create({
        title: data.title,
        description: data.description || null,
        amount: data.amount,

        status: 'pending',
        approvedBy: null,

        businessUnitId,
        isActive: true,

        createdBy: user.id,
      });

    return {
      success: true,
      message: 'Expense created successfully',
      data: expense,
    };
  }

  // ==========================
  // Update — only while pending
  // ==========================

  async update(id: number, data: any, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const expense =
      await this.databaseService.Expense.findOne({
        where: {
          id,
          businessUnitId,
        },
      });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.status !== 'pending') {
      throw new ForbiddenException(
        'Only pending expenses can be edited',
      );
    }

    await expense.update({
      title: data.title ?? expense.title,
      description:
        data.description ?? expense.description,
      amount: data.amount ?? expense.amount,
      updatedBy: user.id,
    });

    return {
      success: true,
      message: 'Expense updated successfully',
      data: expense,
    };
  }

  // ==========================
  // Remove — only while pending
  // ==========================

  async remove(id: number, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const expense =
      await this.databaseService.Expense.findOne({
        where: {
          id,
          businessUnitId,
        },
      });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.status !== 'pending') {
      throw new ForbiddenException(
        'Only pending expenses can be deleted',
      );
    }

    await expense.update({
      isActive: false,
      deletedBy: user.id,
      deletedAt: new Date(),
    });

    return {
      success: true,
      message: 'Expense deleted successfully',
    };
  }

  // ==========================
  // Approve / Reject — shared guard logic
  // ==========================

  private async assertCanDecide(
    expense: any,
    businessUnitId: number,
    user: any,
  ) {
    if (expense.status !== 'pending') {
      throw new ForbiddenException(
        'This expense has already been decided',
      );
    }

    const allowed =
      await this.approvalSettingsService.isApprover(
        MODULE_NAME,
        businessUnitId,
        user.id,
      );

    if (!allowed) {
      throw new ForbiddenException(
        'You are not configured as an approver for Expenses',
      );
    }
  }

  async approve(id: number, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const expense =
      await this.databaseService.Expense.findOne({
        where: {
          id,
          businessUnitId,
        },
      });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await this.assertCanDecide(
      expense,
      businessUnitId,
      user,
    );

    await expense.update({
      status: 'approved',
      approvedBy: user.id,
      updatedBy: user.id,
    });

    return {
      success: true,
      message: 'Expense approved successfully',
      data: expense,
    };
  }

  async reject(id: number, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const expense =
      await this.databaseService.Expense.findOne({
        where: {
          id,
          businessUnitId,
        },
      });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    await this.assertCanDecide(
      expense,
      businessUnitId,
      user,
    );

    await expense.update({
      status: 'rejected',
      approvedBy: user.id,
      updatedBy: user.id,
    });

    return {
      success: true,
      message: 'Expense rejected successfully',
      data: expense,
    };
  }
}