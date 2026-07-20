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
import { CompaniesService } from './companies.service';

import { CreateCompanyDto } from './dto/create-company.dto';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('api/companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  @ApiOperation({
    summary:
      'Get Companies according to logged-in user',
  })
  @Get()
  @UseGuards(JwtGuard)
  getCompanies(@Req() req: any) {
    return this.companiesService.getCompanies(
      req.user,
    );
  }

  @ApiOperation({
    summary:
      'Create Company with Company Admin',
  })
  @Post()
  @UseGuards(JwtGuard)
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