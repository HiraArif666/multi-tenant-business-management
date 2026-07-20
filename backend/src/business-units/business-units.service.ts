import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BusinessUnitsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(data: any, adminUser: any) {
    console.log('Logged in user:', adminUser);

    if (adminUser.role !== 'superadmin') {
      throw new ForbiddenException(
        'Only superadmin can create business units',
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

    // Create Business Unit
    const businessUnit =
      await this.databaseService.BusinessUnit.create({
        name: data.name,
        description: data.description || null,
        adminId: null,
        isActive: true,

        // Audit Fields
        createdBy: adminUser.id,
        updatedBy: null,
        deletedBy: null,
      });

// Hash Password
const hashedPassword = await bcrypt.hash(
  data.admin.password,
  10,
);

// Create BU Admin
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

    // Audit Fields
    createdBy: adminUser.id,
    updatedBy: null,
    deletedBy: null,
  });

    // Update Business Unit Admin
    await businessUnit.update({
      adminId: buAdmin.id,

      // Audit Fields
      updatedBy: adminUser.id,
    });

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
}