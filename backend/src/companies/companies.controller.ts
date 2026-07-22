import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';

import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('api/companies')
@UseGuards(JwtGuard, PermissionGuard)
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  // ==========================
  // Get Companies
  // ==========================

  @Get()
  @HasPermission('companies.view')
  @ApiOperation({
    summary:
      'Get Companies according to logged-in user',
  })
  getCompanies(@Req() req: any) {
    return this.companiesService.getCompanies(
      req.user,
    );
  }

  // ==========================
  // Create Company
  // ==========================

  @Post()
  @HasPermission('companies.add')
  @ApiOperation({
    summary:
      'Create Company with Company Admin',
  })
  create(
    @Body() body: CreateCompanyDto,
    @Req() req: any,
  ) {
    return this.companiesService.create(
      body,
      req.user,
    );
  }
}