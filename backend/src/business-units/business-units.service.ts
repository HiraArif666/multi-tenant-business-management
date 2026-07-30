import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';

@Injectable()
export class BusinessUnitsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(data: any, adminUser: any) {
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

    const businessUnit =
      await this.databaseService.BusinessUnit.create({
        name: data.name,
        adminId: null,
        isActive: true,
        createdBy: adminUser.id,
        updatedBy: null,
        deletedBy: null,
      });

    const hashedPassword = await bcrypt.hash(
      data.admin.password,
      10,
    );

    const buAdmin =
      await this.databaseService.User.create({
        username: data.admin.username,
        email: data.admin.email,
        password: hashedPassword,
        name: data.admin.name,
        role: 'bu-admin',
        businessUnitId: businessUnit.id,
        companyId: null,
        isActive: true,
        createdBy: adminUser.id,
        updatedBy: null,
        deletedBy: null,
      });

    await businessUnit.update(
      {
        adminId: buAdmin.id,
      },
      {
        silent: true,
      },
    );

    return {
      success: true,
      message:
        'Business Unit and BU Admin created successfully',
      businessUnit,
      admin: {
        id: buAdmin.id,
        username: buAdmin.username,
        email: buAdmin.email,
        name: buAdmin.name,
        role: buAdmin.role,
      },
    };
  }

  async findAll(query: any, adminUser: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    where.isActive =
      query.status === 'false' ? false : true;

    if (query.search) {
      where.name = {
        [Op.iLike]: `%${query.search}%`,
      };
    }

    const { rows, count } =
      await this.databaseService.BusinessUnit.findAndCountAll(
        {
          where,

          attributes: {
            include: [
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "BusinessUnit"."createdBy")`,
                  ),
                'createdByName',
              ],
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "BusinessUnit"."updatedBy")`,
                  ),
                'updatedByName',
              ],
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "BusinessUnit"."deletedBy")`,
                  ),
                'deletedByName',
              ],
            ],
          },

          include: [
            {
              model: this.databaseService.User,
              as: 'admin',
              attributes: [
                'id',
                'name',
                'username',
                'email',
              ],
            },
          ],

          order: [['createdAt', 'DESC']],
          limit,
          offset,
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

async findOne(id: number, user: any) {
    const businessUnit =
      await this.databaseService.BusinessUnit.findByPk(
        id,
        {
          attributes: {
            include: [
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "BusinessUnit"."createdBy")`,
                  ),
                'createdByName',
              ],
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "BusinessUnit"."updatedBy")`,
                  ),
                'updatedByName',
              ],
              [
                this.databaseService
                  .getSequelize()
                  .literal(
                    `(SELECT name FROM users WHERE id = "BusinessUnit"."deletedBy")`,
                  ),
                'deletedByName',
              ],
            ],
          },

          include: [
            {
              model: this.databaseService.User,
              as: 'admin',
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

    if (!businessUnit) {
      throw new BadRequestException(
        'Business Unit not found',
      );
    }

    return {
      success: true,
      data: businessUnit,
    };
  }

  async update(
    id: number,
    data: any,
    adminUser: any,
  ) {
    const businessUnit =
      await this.databaseService.BusinessUnit.findByPk(
        id,
      );

    if (!businessUnit) {
      throw new BadRequestException(
        'Business Unit not found',
      );
    }

    await businessUnit.update({
      name: data.name,
      isActive:
        data.isActive ??
        businessUnit.isActive,
      updatedBy: adminUser.id,
      updatedAt: new Date(),
    });

    return {
      success: true,
      message:
        'Business Unit updated successfully',
      data: businessUnit,
    };
  }

  async remove(
    id: number,
    adminUser: any,
  ) {
    const businessUnit =
      await this.databaseService.BusinessUnit.findByPk(
        id,
      );

    if (!businessUnit) {
      throw new NotFoundException(
        'Business Unit not found',
      );
    }

    if (!businessUnit.isActive) {
      throw new BadRequestException(
        'Inactive Business Units cannot be edited',
      );
    }

    await businessUnit.update({
      isActive: false,
      deletedBy: adminUser.id,
      deletedAt: new Date(),
    });

    return {
      success: true,
      message:
        'Business Unit deleted successfully',
    };
  }

async selectBusinessUnit(
  id: number,
  currentUser: any,
) {
  console.log("SELECT BUSINESS UNIT SERVICE HIT");
  console.log("Current User:", currentUser.id);
console.log("Business Unit:", id);
  if (currentUser.role !== 'superadmin') {
    throw new BadRequestException(
      'Only Superadmin can select Business Unit',
    );
  }

  const businessUnit =
    await this.databaseService.BusinessUnit.findByPk(
      id,
    );

  if (!businessUnit) {
    throw new NotFoundException(
      'Business Unit not found',
    );
  }

  await this.databaseService.User.update(
    {
      selectedBusinessUnitId: businessUnit.id,
      selectedCompanyId: null,
    },
    {
      where: {
        id: currentUser.id,
      },
    },
  );


console.log('========== SELECT BUSINESS UNIT ==========');
console.log('Current User ID:', currentUser.id);
console.log('Business Unit ID:', id);


  const updatedUser =
    await this.databaseService.User.findByPk(
      currentUser.id,
    );

  return {
    success: true,
    message: 'Business Unit selected successfully',
    data: {
      id: businessUnit.id,
      name: businessUnit.name,
    },
    user: updatedUser,
  };
  
}}