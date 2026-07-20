import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryFilterService } from '../common/services/query-filter.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompaniesService {
  constructor(
    private databaseService: DatabaseService,
    private queryFilterService: QueryFilterService,
  ) {}

  // ==========================
  // Get Companies
  // ==========================
  async getCompanies(user: any) {
    const filter = this.queryFilterService.getCompanyFilter(user);

    const companies = await this.databaseService.Company.findAll({
      where: filter,
      include: [
        {
          association: 'businessUnit',
          attributes: ['id', 'name'],
        },
        {
          association: 'companyType',
          attributes: ['id', 'name'],
        },
        {
          association: 'admin',
          attributes: ['id', 'username', 'email', 'name'],
        },
      ],
    });

    return {
      success: true,
      data: companies,
    };
  }

  // ==========================
  // Create Company
  // ==========================
  async create(data: any, loggedInUser: any) {
    console.log('Logged in user:', loggedInUser);

    if (loggedInUser.role !== 'bu-admin') {
      throw new ForbiddenException(
        'Only BU Admin can create companies',
      );
    }

    // Check duplicate username
    const existingUsername =
      await this.databaseService.User.findOne({
        where: {
          username: data.admin.username,
        },
      });

    if (existingUsername) {
      throw new BadRequestException(
        'Username already exists',
      );
    }

    // Check duplicate email
    const existingEmail =
      await this.databaseService.User.findOne({
        where: {
          email: data.admin.email,
        },
      });

    if (existingEmail) {
      throw new BadRequestException(
        'Email already exists',
      );
    }

    // Verify Company Type
    const companyType =
      await this.databaseService.CompanyType.findByPk(
        data.companyTypeId,
      );

    if (!companyType) {
      throw new BadRequestException(
        'Invalid Company Type',
      );
    }

    // ==========================
    // Create Company
    // ==========================
    const company =
      await this.databaseService.Company.create({
        name: data.name,
        description: data.description || null,
        businessUnitId:
          loggedInUser.businessUnitId,
        companyTypeId: data.companyTypeId,
        adminId: null,
        isActive: true,

        // Audit Fields
        createdBy: loggedInUser.id,
        updatedBy: null,
        deletedBy: null,
      });

    // ==========================
    // Create Company Admin
    // ==========================
    const hashedPassword = await bcrypt.hash(
      data.admin.password,
      10,
    );

    const companyAdmin = await this.databaseService.User.create({
      username: data.admin.username,
      email: data.admin.email,
      password: hashedPassword,
      name: data.admin.name,

      role: 'company-admin',

      businessUnitId: loggedInUser.businessUnitId,

      companyId: company.id,

      isActive: true,

      // Audit Fields
      createdBy: loggedInUser.id,
      updatedBy: null,
      deletedBy: null,
    });

    // ==========================
    // Update Company Admin
    // ==========================
    await company.update({
      adminId: companyAdmin.id,

      // Audit Fields
      updatedBy: loggedInUser.id,
    });

    return {
      success: true,
      message:
        'Company and Company Admin created successfully',

      company,

      admin: {
        id: companyAdmin.id,
        username: companyAdmin.username,
        email: companyAdmin.email,
        name: companyAdmin.name,
        role: companyAdmin.role,
      },
    };
  }
}