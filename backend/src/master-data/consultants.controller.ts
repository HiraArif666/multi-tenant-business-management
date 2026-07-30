import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';

import { CompaniesService } from '../companies/companies.service';
import { CreateCompanyDto } from '../companies/dto/create-company.dto';
import { UpdateCompanyDto } from '../companies/dto/update-company.dto';

const TYPE_NAME = 'Consultant';

@ApiTags('Master Data - Consultants')
@ApiBearerAuth()
@Controller('api/consultants')
@UseGuards(JwtGuard, BusinessUnitGuard, PermissionGuard)
export class ConsultantsController {
  constructor(
    private readonly companiesService: CompaniesService,
  ) {}

  @Get()
  @HasPermission('master-data.consultant.view')
  @ApiOperation({ summary: 'Get Consultants' })
  findAll(@Query() query: any, @Req() req: any) {
    return this.companiesService.findAllForType(
      TYPE_NAME,
      query,
      req.user,
    );
  }

  @Get(':id')
  @HasPermission('master-data.consultant.view')
  @ApiOperation({ summary: 'Get Consultant by Id' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.companiesService.findOneForType(
      TYPE_NAME,
      id,
      req.user,
    );
  }

  @Post()
  @HasPermission('master-data.consultant.add')
  @ApiOperation({ summary: 'Create Consultant' })
  create(@Body() body: CreateCompanyDto, @Req() req: any) {
    return this.companiesService.createForType(
      TYPE_NAME,
      body,
      req.user,
    );
  }

  @Put(':id')
  @HasPermission('master-data.consultant.edit')
  @ApiOperation({ summary: 'Update Consultant' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCompanyDto,
    @Req() req: any,
  ) {
    return this.companiesService.updateForType(
      TYPE_NAME,
      id,
      body,
      req.user,
    );
  }

  @Delete(':id')
  @HasPermission('master-data.consultant.delete')
  @ApiOperation({ summary: 'Delete Consultant' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.companiesService.removeForType(
      TYPE_NAME,
      id,
      req.user,
    );
  }
}