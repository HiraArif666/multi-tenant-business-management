import {
  Controller,
  Post,
  Get,
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

import { CompanyTypesService } from './company-types.service';
import { CreateCompanyTypeDto } from './dto/create-company-type.dto';

@ApiTags('Company Types')
@ApiBearerAuth()
@Controller('api/company-types')
@UseGuards(JwtGuard, PermissionGuard)
export class CompanyTypesController {
  constructor(
    private readonly companyTypesService: CompanyTypesService,
  ) {}

  // ==========================
  // Create Company Type
  // ==========================

  @Post()
  @HasPermission('company-types.add')
  @ApiOperation({
    summary: 'Create Company Type',
  })
  create(
    @Body() body: CreateCompanyTypeDto,
    @Req() req: any,
  ) {
    return this.companyTypesService.create(
      body,
      req.user,
    );
  }

  // ==========================
  // Get Company Types
  // ==========================

  @Get()
  @HasPermission('company-types.view')
  @ApiOperation({
    summary: 'Get All Company Types',
  })
  getAll() {
    return this.companyTypesService.getAll();
  }
}