import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { Op } from 'sequelize';
import * as ExcelJS from 'exceljs';

import { DatabaseService } from '../database/database.service';
import {
  REPORT_MODULES,
  getReportModuleConfig,
  ReportColumn,
} from './report-modules.config';

@Injectable()
export class ReportsService {
  async exportToExcel(
  moduleKey: string,
  columns: string[],
  filters: Record<string, any>,
  systemUser: {
    id: any;
    role: string;
    businessUnitId: any;
    selectedBusinessUnitId: any;
  },
): Promise<Buffer> {
  return this.exportReport(
    {
      moduleKey,
      columns,
      filters,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    },
    systemUser,
  );
}
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

  private normalizeColumns(
    moduleKey: string,
    providedColumns?: string[],
  ) {
    const config = getReportModuleConfig(moduleKey);

    if (!config) {
      throw new BadRequestException(
        `Invalid report module: ${moduleKey}`,
      );
    }

    const validKeys = new Set(
      config.columns.map((column) => column.key),
    );

    const selected = Array.isArray(providedColumns)
      ? providedColumns.filter((column) =>
          validKeys.has(column),
        )
      : [];

    if (selected.length === 0) {
      return config.columns.map((column) => column.key);
    }

    return selected;
  }

  private getColumnLabelMap(moduleKey: string) {
    const config = getReportModuleConfig(moduleKey);

    return new Map(
      (config?.columns || []).map((column) => [
        column.key,
        column.label,
      ]),
    );
  }

  private applyDateRange(where: any, filters: any) {
    if (!filters) {
      return;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};

      if (filters.startDate) {
        where.createdAt[Op.gte] = new Date(filters.startDate);
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = endDate;
      }
    }
  }

  private buildWhereClause(
    moduleKey: string,
    filters: any,
    businessUnitId: number,
  ) {
    const where: any = {
      businessUnitId,
    };

    if (moduleKey === 'users') {
      if (filters?.role) {
        where.role = filters.role;
      }
    }

if (
  filters?.status &&
  filters.status !== "all" &&
  moduleKey !== "reports"
) {
  where.status = filters.status;
}

    if (
      filters?.activeStatus === 'inactive' ||
      filters?.isActive === false ||
      filters?.isActive === 'false'
    ) {
      where.isActive = false;
    } else if (
      filters?.activeStatus === 'all' ||
      filters?.isActive === 'all'
    ) {
      delete where.isActive;
    } else if (
      filters?.isActive === true ||
      filters?.isActive === 'true'
    ) {
      where.isActive = true;
    }

    if (filters?.search) {
      const searchTerm = `%${String(filters.search).trim()}%`;

      if (moduleKey === 'expense') {
        where[Op.or] = [
          { title: { [Op.iLike]: searchTerm } },
          { description: { [Op.iLike]: searchTerm } },
        ];
      } else if (moduleKey === 'users') {
        where[Op.or] = [
          { name: { [Op.iLike]: searchTerm } },
          { email: { [Op.iLike]: searchTerm } },
          { username: { [Op.iLike]: searchTerm } },
        ];
      } else {
        where[Op.or] = [
          { name: { [Op.iLike]: searchTerm } },
          { email: { [Op.iLike]: searchTerm } },
          { address: { [Op.iLike]: searchTerm } },
        ];
      }
    }

    this.applyDateRange(where, filters);

    return where;
  }

  private async fetchRows(
    moduleKey: string,
    where: any,
    selectedColumns: string[],
    sortBy: string,
    sortDirection: 'ASC' | 'DESC',
  ) {
    const safeSortField =
      ['createdAt', 'name', 'amount', 'status', 'isActive'].includes(sortBy)
        ? sortBy
        : 'createdAt';

    switch (moduleKey) {
case 'expense': {
  const rows = await this.databaseService.Expense.findAll({
    where,
    order: [[safeSortField, sortDirection]],

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
              `(SELECT username FROM users WHERE id = "Expense"."createdBy")`,
            ),
          'createdByName',
        ],
      ],
    },
  });

  return rows.map((row) =>
    this.mapSelectedColumns(row, selectedColumns),
  );
}

      case 'users': {
        const rows = await this.databaseService.User.findAll({
          where,
          order: [[safeSortField, sortDirection]],
        });

        return rows.map((row) => this.mapSelectedColumns(row, selectedColumns));
      }

      case 'vendors':
      case 'suppliers':
      case 'contractors':
      case 'consultants':
      case 'customers': {
        const rows = await this.databaseService.Company.findAll({
          where: {
            ...where,
            companyTypeId: await this.getCompanyTypeIdByName(
              moduleKey,
            ),
          },
          order: [[safeSortField, sortDirection]],
          include: [
            {
              association: 'companyType',
              attributes: ['id', 'name'],
            },
            {
              association: 'admin',
              attributes: ['id', 'name'],
            },
          ],
        });

        return rows.map((row) => this.mapSelectedColumns(row, selectedColumns));
      }

      default:
        throw new BadRequestException(
          `Unsupported report module: ${moduleKey}`,
        );
    }
  }

  private async getCompanyTypeIdByName(moduleKey: string) {
    const typeNameMap: Record<string, string> = {
      vendors: 'Vendor',
      suppliers: 'Supplier',
      contractors: 'Contractor',
      consultants: 'Consultant',
      customers: 'Customer',
    };

    const typeName = typeNameMap[moduleKey];

    if (!typeName) {
      throw new BadRequestException(
        `No company type mapping for module: ${moduleKey}`,
      );
    }

    const companyType = await this.databaseService.CompanyType.findOne({
      where: { name: typeName },
    });

    if (!companyType) {
      throw new BadRequestException(
        `Company type "${typeName}" not found`,
      );
    }

    return companyType.id;
  }

  private mapSelectedColumns(row: any, selectedColumns: string[]) {
    const record: Record<string, any> = {};

    for (const column of selectedColumns) {
if (column === 'approverName') {
  record[column] =
    row?.approver?.username ??
    row?.approver?.name ??
    null;

  continue;
}

if (column === 'createdByName') {
  record[column] =
    row?.get?.('createdByName') ??
    row?.createdByName ??
    null;
  continue;
}

      if (column === 'contactPersonName') {
        record[column] = row?.admin?.name ?? row?.contactPersonName ?? null;
        continue;
      }

      if (column === 'companyTypeName') {
        record[column] = row?.companyType?.name ?? row?.companyTypeName ?? null;
        continue;
      }

      const value = row?.get ? row.get(column) : row?.[column];
      record[column] = value ?? null;
    }

    return record;
  }

  async getModules() {
    return {
      success: true,
      data: REPORT_MODULES,
    };
  }

  async listReports(user: any, query: any = {}) {
    const businessUnitId = this.resolveBusinessUnitId(user);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.databaseService.Report.findAndCountAll({
      where: { businessUnitId },
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

  async getReport(id: number, user: any) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const report = await this.databaseService.Report.findOne({
      where: { id, businessUnitId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return {
      success: true,
      data: report,
    };
  }

  async createReport(data: any, user: any) {
    if (!data?.name || !data?.moduleKey) {
      throw new BadRequestException(
        'Report name and moduleKey are required',
      );
    }

    const businessUnitId = this.resolveBusinessUnitId(user);
    const config = getReportModuleConfig(data.moduleKey);

    if (!config) {
      throw new BadRequestException(
        `Invalid report module: ${data.moduleKey}`,
      );
    }

    const selectedColumns = this.normalizeColumns(
      data.moduleKey,
      data.columns,
    );

    const report = await this.databaseService.Report.create({
      name: data.name,
      moduleKey: data.moduleKey,
      columns: selectedColumns,
      filters: data.filters || {},
      businessUnitId,
      createdBy: user.id,
      updatedBy: user.id,
    });

    return {
      success: true,
      message: 'Report saved successfully',
      data: report,
    };
  }

  async updateReport(id: number, data: any, user: any) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const report = await this.databaseService.Report.findOne({
      where: { id, businessUnitId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (data?.moduleKey) {
      const config = getReportModuleConfig(data.moduleKey);
      if (!config) {
        throw new BadRequestException(
          `Invalid report module: ${data.moduleKey}`,
        );
      }
    }

    const nextModuleKey = data?.moduleKey || report.moduleKey;
    const nextColumns = data?.columns
      ? this.normalizeColumns(nextModuleKey, data.columns)
      : report.columns;

    await report.update({
      name: data?.name ?? report.name,
      moduleKey: nextModuleKey,
      columns: nextColumns,
      filters: data?.filters ?? report.filters,
      updatedBy: user.id,
    });

    return {
      success: true,
      message: 'Report updated successfully',
      data: report,
    };
  }

  async deleteReport(id: number, user: any) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const report = await this.databaseService.Report.findOne({
      where: { id, businessUnitId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    await report.destroy();

    return {
      success: true,
      message: 'Report deleted successfully',
    };
  }

  async generateReport(payload: any, user: any) {
    const businessUnitId = this.resolveBusinessUnitId(user);
    const moduleKey = payload?.moduleKey;
    const config = getReportModuleConfig(moduleKey);

    if (!config) {
      throw new BadRequestException(
        `Invalid report module: ${moduleKey}`,
      );
    }

    const selectedColumns = this.normalizeColumns(
      moduleKey,
      payload?.columns,
    );

    const where = this.buildWhereClause(
      moduleKey,
      payload?.filters || {},
      businessUnitId,
    );

    const rows = await this.fetchRows(
      moduleKey,
      where,
      selectedColumns,
      payload?.sortBy || 'createdAt',
      payload?.sortDirection === 'ASC' ? 'ASC' : 'DESC',
    );

    return {
      success: true,
      data: rows,
      columns: selectedColumns.map((columnKey) => ({
        key: columnKey,
        label:
          this.getColumnLabelMap(moduleKey).get(columnKey) ||
          columnKey,
      })),
      total: rows.length,
      moduleKey,
    };
  }

  async exportReport(payload: any, user: any) {
    const result = await this.generateReport(payload, user);
    const moduleKey = payload?.moduleKey;
    const selectedColumns = result.columns.map((column: any) => column.key);
    const columnLabels = result.columns.map((column: any) => column.label);

const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Report');

worksheet.addRow(columnLabels);

for (const row of result.data) {
  const values = selectedColumns.map(
    (columnKey) => row[columnKey] ?? '',
  );

  const excelRow = worksheet.addRow(values);

  selectedColumns.forEach((columnKey, index) => {
    if (
      columnKey === 'createdAt' ||
      columnKey === 'updatedAt'
    ) {
      const cell = excelRow.getCell(index + 1);

      if (cell.value) {
        cell.value = new Date(cell.value as string);
        cell.numFmt = 'dd-mm-yyyy hh:mm';
      }
    }
  });
}

worksheet.columns.forEach((column) => {
  column.width = 20;
});

const buffer = await workbook.xlsx.writeBuffer();
return Buffer.from(buffer);
  }

  async exportSavedReport(id: number, user: any) {
    const businessUnitId = this.resolveBusinessUnitId(user);

    const savedReport = await this.databaseService.Report.findOne({
      where: { id, businessUnitId },
    });

    if (!savedReport) {
      throw new NotFoundException('Report not found');
    }

    const body = {
      moduleKey: savedReport.moduleKey,
      columns: savedReport.columns,
      filters: savedReport.filters || {},
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    };

    return this.exportReport(body, user);
  }
}
