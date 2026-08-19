import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { Op } from 'sequelize';
import * as ExcelJS from 'exceljs';

import { DatabaseService } from '../database/database.service';
import { ApprovalSettingsService } from '../settings/approval-settings.service';

import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ExpenseApprovedEvent,
  ExpensePendingEvent,
  ExpenseRejectedEvent,
} from '../notifications/notification.events';

const MODULE_NAME = 'expense';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly approvalSettingsService: ApprovalSettingsService,
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
    };

    let paranoid = true;

    if (query.status === 'inactive' || query.activeStatus === 'inactive') {
      paranoid = false;
      where[Op.or] = [
        { isActive: false },
        { deletedAt: { [Op.ne]: null } },
      ];
    } else if (query.status === 'all' || query.activeStatus === 'all') {
      paranoid = false;
    } else {
      where.isActive = true;
    }

    if (query.status && query.status !== 'inactive' && query.status !== 'all') {
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
          paranoid,

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

    // Sum across ALL matching records, not just the current page —
    // this is what the frontend shows below the filters and what
    // gets printed at the top of the exported Excel file.
    const totalAmount =
      (await this.databaseService.Expense.sum(
        'amount',
        { where, paranoid },
      )) || 0;

    return {
      success: true,
      data: rows,
      total: count,
      totalAmount,
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

    // ✅ EMIT PENDING NOTIFICATION EVENT

const approvalSetting =
  await this.databaseService.ApprovalSetting.findOne({
    where: {
      businessUnitId,
      moduleName: MODULE_NAME,
    },
  });

if (approvalSetting) {
  const approver =
    await this.databaseService.ApprovalSettingApprover.findOne({
      where: {
        approvalSettingId: approvalSetting.id,
      },
    });

  if (approver) {
    const event = new ExpensePendingEvent(
      businessUnitId,
      approver.userId,
      expense.id,
    );

    this.eventEmitter.emit('expense.pending', event);
  }
}

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
    });
    await expense.destroy();

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

    // Superadmin bypasses the configured-approver check entirely
    if (user.role === 'superadmin') {
      return;
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

    // ✅ EMIT APPROVED NOTIFICATION EVENT
    const event = new ExpenseApprovedEvent(
      businessUnitId,
      expense.createdBy,
      expense.id,
      user.name || user.username,
    );
    this.eventEmitter.emit('expense.approved', event);

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
const event = new ExpenseRejectedEvent(
  businessUnitId,
  expense.createdBy,
  expense.id,
  user.name || user.username,
);

this.eventEmitter.emit('expense.rejected', event);
    return {
      success: true,
      message: 'Expense rejected successfully',
      data: expense,
    };
  }

  // ==========================
  // Export to Excel — same filters as findAll, but no
  // pagination (the full matching list goes into the file)
  // ==========================

  async exportToExcel(
    query: any,
    user: any,
  ): Promise<Buffer> {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

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

    const expenses =
      await this.databaseService.Expense.findAll({
        where,
        order: [['createdAt', 'DESC']],

        include: [
          {
            association: 'approver',
            attributes: ['id', 'name'],
          },
          {
            association: 'creator',
            attributes: ['id', 'name'],
          },
        ],
      });

    const totalAmount = expenses.reduce(
      (sum: number, expense: any) =>
        sum + Number(expense.amount),
      0,
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Expenses');

    const columns = [
      'Title',
      'Description',
      'Amount',
      'Status',
      'Decided By',
      'Created By',
      'Created At',
    ];

    // Sum banner across the top of the sheet
    sheet.mergeCells(
      `A1:${String.fromCharCode(64 + columns.length)}1`,
    );
    sheet.getCell('A1').value =
      `Total Amount: Rs. ${totalAmount.toLocaleString()}`;
    sheet.getCell('A1').font = {
      bold: true,
      size: 13,
    };

    sheet.addRow([]);

    const headerRow = sheet.addRow(columns);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' },
      };
    });

    expenses.forEach((expense: any) => {
      const createdByName =
        expense.creator?.name ??
        (typeof expense.get === 'function'
          ? expense.get('createdByName')
          : expense.createdByName);

      sheet.addRow([
        expense.title,
        expense.description ?? '',
        Number(expense.amount),
        expense.status,
        expense.approver?.name ?? '',
        createdByName ?? '',
        expense.createdAt
          ? new Date(
              expense.createdAt,
            ).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          : '',
      ]);
    });

    sheet.columns.forEach((column) => {
      column.width = 24;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer as unknown as Buffer;
  }
}