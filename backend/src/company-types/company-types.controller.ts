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
import { CompanyTypesService } from './company-types.service';

import { CreateCompanyTypeDto } from './dto/create-company-type.dto';

@ApiTags('Company Types')
@ApiBearerAuth()
@Controller('api/company-types')
export class CompanyTypesController {
  constructor(
    private readonly companyTypesService: CompanyTypesService,
  ) {}

  @ApiOperation({
    summary: 'Create Company Type',
  })
  @Post()
  @UseGuards(JwtGuard)
  create(
    @Body() body: CreateCompanyTypeDto,
    @Req() req: any,
  ) {
    return this.companyTypesService.create(
      body,
      req.user,
    );
  }

  @ApiOperation({
    summary: 'Get All Company Types',
  })
  @Get()
  @UseGuards(JwtGuard)
  getAll() {
    return this.companyTypesService.getAll();
  }
}