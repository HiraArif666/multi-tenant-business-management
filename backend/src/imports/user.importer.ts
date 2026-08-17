import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';

import { DatabaseService } from '../database/database.service';
import { Importer, ImportTemplateColumn } from './importer.interface';

export interface UserImportData {
  username: string;
  email: string;
  password: string;
  name: string | null;
  role: string;
}

export class UserImporter implements Importer<UserImportData> {
  moduleName = 'user';

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  getTemplateColumns(): ImportTemplateColumn[] {
    return [
      {
        header: 'Username',
        key: 'username',
        width: 24,
        hint: 'Required: unique username',
      },
      {
        header: 'Email',
        key: 'email',
        width: 32,
        hint: 'Required: valid email address',
      },
      {
        header: 'Password',
        key: 'password',
        width: 24,
        hint: 'Required: password for the new user',
      },
      {
        header: 'Name',
        key: 'name',
        width: 28,
        hint: 'Optional: full name',
      },
      {
        header: 'Role',
        key: 'role',
        width: 20,
        hint: 'Optional: user, company-admin, bu-admin, superadmin',
      },
    ];
  }

  parseRow(row: ExcelJS.Row) {
    const username = String(row.getCell(1).value ?? '').trim();
    const email = String(row.getCell(2).value ?? '').trim();
    const password = String(row.getCell(3).value ?? '').trim();
    const name = String(row.getCell(4).value ?? '').trim();
    const role = String(row.getCell(5).value ?? '').trim();

    const data: UserImportData = {
      username,
      email,
      password,
      name: name || null,
      role: role || 'user',
    };

    return {
      data,
      errors: this.validateData(data),
    };
  }

  validateData(data: UserImportData) {
    const errors: string[] = [];

    if (!data.username) {
      errors.push('Username is required');
    }

    if (!data.email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email must be a valid email address');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    const normalizedRole = data.role?.toLowerCase();
    const allowedRoles = [
      'superadmin',
      'bu-admin',
      'company-admin',
      'user',
    ];

    if (
      normalizedRole &&
      !allowedRoles.includes(normalizedRole)
    ) {
      errors.push(
        'Role must be one of: superadmin, bu-admin, company-admin, user',
      );
    }

    return errors;
  }

  async bulkInsert(
    rows: UserImportData[],
    businessUnitId: number,
    user: any,
  ) {
    const createRows = await Promise.all(
      rows.map(async (row) => ({
        username: row.username,
        email: row.email,
        password: await bcrypt.hash(row.password, 10),
        name: row.name || null,
        role: (row.role || 'user').toLowerCase(),
        businessUnitId,
        companyId: null,
        selectedBusinessUnitId: null,
        selectedCompanyId: null,
        isActive: true,
        createdBy: user.id,
        updatedBy: user.id,
      })),
    );

    return this.databaseService.User.bulkCreate(createRows);
  }
}
