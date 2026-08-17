import type * as ExcelJS from 'exceljs';

export interface ImportTemplateColumn {
  header: string;
  key: string;
  width?: number;
  hint?: string;
}

export interface ImportPreviewRow<T = any> {
  rowIndex: number;
  data: T;
  errors: string[];
}

export interface Importer<T = any> {
  moduleName: string;

  getTemplateColumns(): ImportTemplateColumn[];

  parseRow(row: ExcelJS.Row): {
    data: T;
    errors: string[];
  };

  validateData(data: T): string[];

  bulkInsert(
    rows: T[],
    businessUnitId: number,
    user: any,
  ): Promise<T[]>;
}
