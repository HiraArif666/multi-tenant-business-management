import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import express from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';

import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/reports')
@UseGuards(JwtGuard, BusinessUnitGuard, PermissionGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('modules')
  @HasPermission('reports.view')
  @ApiOperation({ summary: 'Get available report modules and columns' })
  getModules() {
    return this.reportsService.getModules();
  }

  @Get()
  @HasPermission('reports.view')
  @ApiOperation({ summary: 'List saved reports' })
  listReports(@Req() req: any, @Query() query: any) {
    return this.reportsService.listReports(req.user, query);
  }

  @Get(':id')
  @HasPermission('reports.view')
  @ApiOperation({ summary: 'Get saved report by id' })
  getReport(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reportsService.getReport(id, req.user);
  }

  @Post()
  @HasPermission('reports.add')
  @ApiOperation({ summary: 'Save a generated report definition' })
  createReport(@Body() body: any, @Req() req: any) {
    return this.reportsService.createReport(body, req.user);
  }

  @Put(':id')
  @HasPermission('reports.edit')
  @ApiOperation({ summary: 'Update saved report' })
  updateReport(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.reportsService.updateReport(id, body, req.user);
  }

  @Delete(':id')
  @HasPermission('reports.delete')
  @ApiOperation({ summary: 'Delete saved report' })
  deleteReport(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.reportsService.deleteReport(id, req.user);
  }

  @Post('generate')
  @HasPermission('reports.view')
  @ApiOperation({ summary: 'Generate report data from selected module and filters' })
  generateReport(@Body() body: any, @Req() req: any) {
    return this.reportsService.generateReport(body, req.user);
  }

  @Post('export')
  @HasPermission('reports.export')
  @ApiOperation({ summary: 'Export report to Excel' })
  async exportReport(
    @Body() body: any,
    @Req() req: any,
    @Res() res: express.Response,
  ) {
    const buffer = await this.reportsService.exportReport(body, req.user);

    res.status(200)
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="report-export.xlsx"',
      })
      .send(buffer);
  }

  @Get(':id/export')
  @HasPermission('reports.export')
  @ApiOperation({ summary: 'Export a saved report to Excel' })
  async exportSavedReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: express.Response,
  ) {
    const buffer = await this.reportsService.exportSavedReport(id, req.user);

    res.status(200)
      .set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="saved-report.xlsx"',
      })
      .send(buffer);
  }
}
