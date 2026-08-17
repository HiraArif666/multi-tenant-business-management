import * as ExcelJS from 'exceljs';
import { DatabaseService } from '../database/database.service';
import { Importer, ImportTemplateColumn } from './importer.interface';

export interface ExpenseImportData {
  title: string;
  description: string | null;
  amount: number;
}

export class ExpenseImporter
  implements Importer<ExpenseImportData>
{
  moduleName = 'expense';

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  getTemplateColumns(): ImportTemplateColumn[] {
    return [
      {
        header: 'Title',
        key: 'title',
        width: 32,
        hint: 'Required: expense title',
      },
      {
        header: 'Description',
        key: 'description',
        width: 48,
        hint: 'Optional: expense description',
      },
      {
        header: 'Amount',
        key: 'amount',
        width: 18,
        hint: 'Required: numeric amount',
      },
    ];
  }

  parseRow(row: ExcelJS.Row) {
    const title = String(
      row.getCell(1).value ?? '',
    ).trim();
    const description = String(
      row.getCell(2).value ?? '',
    ).trim();
    const amountCell = row.getCell(3).value;
    const amountValue =
      amountCell === null || amountCell === undefined
        ? ''
        : String(amountCell).trim();

    const data: ExpenseImportData = {
      title,
      description: description || null,
      amount: Number(amountValue),
    };

    return {
      data,
      errors: this.validateData(data),
    };
  }

  validateData(data: ExpenseImportData) {
    const errors: string[] = [];

    if (!data.title) {
      errors.push('Title is required');
    }

    if (
      data.amount === null ||
      data.amount === undefined ||
      Number.isNaN(data.amount) ||
      data.amount <= 0
    ) {
      errors.push('Amount must be a valid number greater than zero');
    }

    return errors;
  }

  async bulkInsert(
    rows: ExpenseImportData[],
    businessUnitId: number,
    user: any,
  ) {
    const createRows = rows.map((row) => ({
      title: row.title,
      description: row.description,
      amount: row.amount,
      status: 'pending',
      approvedBy: null,
      businessUnitId,
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    }));

    return this.databaseService.Expense.bulkCreate(createRows);
  }
}
