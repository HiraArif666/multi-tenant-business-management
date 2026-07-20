import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CompanyTypesService {
  constructor(private databaseService: DatabaseService) {}

  async create(data: any, adminUser: any) {
    if (adminUser.role !== 'superadmin') {
      throw new ForbiddenException(
        'Only superadmin can create company types',
      );
    }

    const existing = await this.databaseService.CompanyType.findOne({
      where: {
        name: data.name,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Company Type already exists',
      );
    }

    const companyType = await this.databaseService.CompanyType.create({
      name: data.name,
      description: data.description || null,
    });

    return {
      success: true,
      message: 'Company Type created successfully',
      data: companyType,
    };
  }

  async getAll() {
    const companyTypes = await this.databaseService.CompanyType.findAll({
      order: [['id', 'ASC']],
    });

    return {
      success: true,
      data: companyTypes,
    };
  }
}