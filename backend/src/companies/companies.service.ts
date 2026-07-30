import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { QueryFilterService } from '../common/services/query-filter.service';

import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly queryFilterService: QueryFilterService,
  ) {}

  // ==========================
  // Get Companies
  // ==========================

  async getCompanies(user: any) {
    const filter =
      this.queryFilterService.getCompanyFilter(user);

    const companies =
      await this.databaseService.Company.findAll({
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
            attributes: [
              'id',
              'username',
              'email',
              'name',
            ],
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

  async create(
    data: any,
    loggedInUser: any,
  ) {
    // Username already exists

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

    // Email already exists

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

    // Company Type Validation

    const companyType =
      await this.databaseService.CompanyType.findByPk(
        data.companyTypeId,
      );

    if (!companyType) {
      throw new BadRequestException(
        'Invalid Company Type',
      );
    }

    // Create Company

    const businessUnitId =
      loggedInUser.role === 'superadmin'
        ? loggedInUser.selectedBusinessUnitId
        : loggedInUser.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    const company =
      await this.databaseService.Company.create({
        name: data.name,
        description:
          data.description || null,

        businessUnitId,

        companyTypeId:
          data.companyTypeId,
        

           phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        website: data.website || null,
        logo: data.logo || null,

        
        adminId: null,

        isActive: true,

        createdBy: loggedInUser.id,
        updatedBy: null,
        deletedBy: null,
      });

    // Create Company Admin

    const hashedPassword =
      await bcrypt.hash(
        data.admin.password,
        10,
      );

    const companyAdmin =
      await this.databaseService.User.create({
        username: data.admin.username,
        email: data.admin.email,
        password: hashedPassword,

        name: data.admin.name,

        role: 'company-admin',

        businessUnitId,

        companyId: company.id,

        isActive: true,

        createdBy: loggedInUser.id,
        updatedBy: null,
        deletedBy: null,
      });

    // Update Company Admin

    await company.update({
      adminId: companyAdmin.id,
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

  // ==========================
  // Resolve Company Type Id by name
  // ==========================

  async resolveCompanyTypeId(typeName: string) {
    const companyType =
      await this.databaseService.CompanyType.findOne({
        where: { name: typeName },
      });

    if (!companyType) {
      throw new BadRequestException(
        `Company Type "${typeName}" not found`,
      );
    }

    return companyType.id;
  }

  // ==========================
  // Find All (scoped by type)
  // ==========================

  async findAllForType(
    typeName: string,
    query: any,
    user: any,
  ) {
    const companyTypeId =
      await this.resolveCompanyTypeId(typeName);

    const filter =
      this.queryFilterService.getCompanyFilter(user);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {
      ...filter,
      companyTypeId,
    };

    if (query.status === 'inactive') {
      where.isActive = false;
    } else if (query.status !== 'all') {
      where.isActive = true;
    }

    if (query.search) {
      where.name = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    const { rows, count } =
      await this.databaseService.Company.findAndCountAll(
        {
          where,
          limit,
          offset,
          order: [['createdAt', 'DESC']],

          attributes: {
            include: [
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "Company"."createdBy")`,
                  ),
                'createdByName',
              ],
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "Company"."updatedBy")`,
                  ),
                'updatedByName',
              ],
            ],
          },

          include: [
            {
              association: 'admin',
              attributes: [
                'id',
                'name',
                'username',
                'email',
              ],
            },
          ],
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
  // Find One (scoped by type)
  // ==========================

  async findOneForType(
    typeName: string,
    id: number,
    user: any,
  ) {
    const companyTypeId =
      await this.resolveCompanyTypeId(typeName);

    const filter =
      this.queryFilterService.getCompanyFilter(user);

    const company =
      await this.databaseService.Company.findOne({
        where: {
          id,
          companyTypeId,
          ...filter,
        },

        include: [
          {
            association: 'admin',
            attributes: [
              'id',
              'name',
              'username',
              'email',
            ],
          },
        ],
      });

    if (!company) {
      throw new NotFoundException(
        `${typeName} not found`,
      );
    }

    return {
      success: true,
      data: company,
    };
  }

  // ==========================
  // Create (scoped by type)
  // ==========================

  async createForType(
    typeName: string,
    data: any,
    loggedInUser: any,
  ) {
    const companyTypeId =
      await this.resolveCompanyTypeId(typeName);

    // Reuses the existing create() logic, but the server — not the
    // client — decides which companyTypeId this record gets.
    return this.create(
      { ...data, companyTypeId },
      loggedInUser,
    );
  }

  // ==========================
  // Update (scoped by type)
  // ==========================

  async updateForType(
    typeName: string,
    id: number,
    data: any,
    user: any,
  ) {
    const companyTypeId =
      await this.resolveCompanyTypeId(typeName);

    const filter =
      this.queryFilterService.getCompanyFilter(user);

    const company =
      await this.databaseService.Company.findOne({
        where: {
          id,
          companyTypeId,
          ...filter,
        },
      });

    if (!company) {
      throw new NotFoundException(
        `${typeName} not found`,
      );
    }

    await company.update({
      ...data,
      updatedBy: user.id,
    });

    return {
      success: true,
      message: `${typeName} updated successfully`,
      data: company,
    };
  }

  // ==========================
  // Remove (scoped by type, soft delete)
  // ==========================

  async removeForType(
    typeName: string,
    id: number,
    user: any,
  ) {
    const companyTypeId =
      await this.resolveCompanyTypeId(typeName);

    const filter =
      this.queryFilterService.getCompanyFilter(user);

    const company =
      await this.databaseService.Company.findOne({
        where: {
          id,
          companyTypeId,
          ...filter,
        },
      });

    if (!company) {
      throw new NotFoundException(
        `${typeName} not found`,
      );
    }

    await company.update({
      isActive: false,
      deletedBy: user.id,
      deletedAt: new Date(),
    });

    return {
      success: true,
      message: `${typeName} deleted successfully`,
    };
  }
}