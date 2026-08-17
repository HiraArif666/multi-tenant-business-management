import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { File as MulterFile } from 'multer';

import { DatabaseService } from '../database/database.service';
import { ExpenseImporter } from './expense.importer';
import { UserImporter } from './user.importer';
import {
  ImportPreviewRow,
  Importer,
} from './importer.interface';
import {
  IMPORT_MODULES,
  isSupportedImportModule,
} from './import-permission.helper';

@Injectable()
export class ImportService {
  private readonly importers: Record<
    string,
    Importer<any>
  >;

  constructor(
    private readonly databaseService: DatabaseService,
  ) {
    this.importers = {
      expense: new ExpenseImporter(databaseService),
      user: new UserImporter(databaseService),
    };
  }

  getAvailableModules() {
    return IMPORT_MODULES;
  }

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

  private getImporter(moduleName: string) {
    if (!isSupportedImportModule(moduleName)) {
      throw new BadRequestException(
        'Unsupported import module',
      );
    }

    return this.importers[moduleName];
  }

  async buildTemplate(moduleName: string) {
    const importer = this.getImporter(moduleName);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Template');

    sheet.columns = importer
      .getTemplateColumns()
      .map((column) => ({
        header: column.header,
        key: column.key,
        width: column.width ?? 24,
      }));

    sheet.addRow(
      importer.getTemplateColumns().map(
        (column) => column.hint ?? '',
      ),
    );

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer as unknown as Buffer;
  }

  async previewImport(
    moduleName: string,
    file: MulterFile,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const importer = this.getImporter(moduleName);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);

    const sheet = workbook.worksheets[0];

    if (!sheet) {
      throw new BadRequestException('Excel file is empty');
    }

    const rows: ImportPreviewRow<any>[] = [];

    for (let index = 2; index <= sheet.rowCount; index += 1) {
      const row = sheet.getRow(index);

      const hasData = [1, 2, 3].some((columnIndex) => {
        const cellValue = row.getCell(columnIndex).value;
        return (
          cellValue !== null &&
          cellValue !== undefined &&
          String(cellValue).trim() !== ''
        );
      });

      if (!hasData) {
        continue;
      }

      const { data, errors } = importer.parseRow(row);

      rows.push({
        rowIndex: row.number,
        data,
        errors,
      });
    }

    return {
      success: true,
      data: {
        module: moduleName,
        rows,
      },
    };
  }

  async confirmImport(
    moduleName: string,
    rows: any[],
    user: any,
  ) {
    const importer = this.getImporter(moduleName);
    const businessUnitId = this.resolveBusinessUnitId(user);

    if (!Array.isArray(rows)) {
      throw new BadRequestException('Rows must be an array');
    }

    const validRows: any[] = [];
    const rowErrors: any[] = [];

    rows.forEach((row) => {
      const data = row.data;
      const errors = importer.validateData(data);

      if (errors.length) {
        rowErrors.push({
          rowIndex: row.rowIndex,
          errors,
        });
      } else {
        validRows.push({
          title: String(data.title).trim(),
          description:
            data.description &&
            String(data.description).trim()
              ? String(data.description).trim()
              : null,
          amount: Number(data.amount),
        });
      }
    });

    if (rowErrors.length) {
      throw new BadRequestException({
        message:
          'Imported rows contain validation errors',
        errors: rowErrors,
      });
    }

    const imported = await importer.bulkInsert(
      validRows,
      businessUnitId,
      user,
    );

    return {
      success: true,
      message: `${imported.length} rows imported successfully`,
      data: imported,
    };
  }
}
