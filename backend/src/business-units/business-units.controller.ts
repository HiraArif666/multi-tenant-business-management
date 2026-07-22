import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { BusinessUnitsService } from './business-units.service';
import { CreateBusinessUnitDto } from './dto/create-business-units.dto';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { ParseIntPipe } from '@nestjs/common';

@ApiTags('Business Units')
@ApiBearerAuth()
@Controller('api/business-units')
@UseGuards(JwtGuard, PermissionGuard)
export class BusinessUnitsController {
  constructor(
    private readonly businessUnitsService: BusinessUnitsService,
  ) {}

  // ==========================
  // Create Business Unit
  // ==========================

  @Post()
  @HasPermission('business-units.add')
  @ApiOperation({
    summary: 'Create Business Unit with BU Admin',
  })
  create(
    @Body() body: CreateBusinessUnitDto,
    @Req() req: any,
  ) {
    return this.businessUnitsService.create(
      body,
      req.user,
    );
  }

  // ==========================
  // Get All Business Units
  // ==========================

  @Get()
  @HasPermission('business-units.view')
  @ApiOperation({
    summary: 'Get all Business Units',
  })
  findAll(
    @Query() query: any,
    @Req() req: any,
  ) {
    return this.businessUnitsService.findAll(
      query,
      req.user,
    );
  }

  // ==========================
  // Get Business Unit By Id
  // ==========================

  @Get(':id')
  @HasPermission('business-units.view')
  @ApiOperation({
    summary: 'Get Business Unit by ID',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,

    @Req() req: any,
  ) {
return this.businessUnitsService.findOne(id);
  }

  // ==========================
  // Update Business Unit
  // ==========================

  @Put(':id')
  @HasPermission('business-units.edit')
  @ApiOperation({
    summary: 'Update Business Unit',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.businessUnitsService.update(
      id,
      body,
      req.user,
    );
  }

  // ==========================
  // Delete Business Unit
  // ==========================

  @Delete(':id')
  @HasPermission('business-units.delete')
  @ApiOperation({
    summary: 'Delete Business Unit',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.businessUnitsService.remove(
      id,
      req.user,
    );
  }
}