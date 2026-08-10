import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';

import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('api/dashboard')
@UseGuards(JwtGuard, BusinessUnitGuard, PermissionGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @HasPermission('dashboard.view')
  @ApiOperation({ summary: 'Get Dashboard overview metrics' })
  overview(@Query() query: any, @Req() req: any) {
    return this.dashboardService.overview(query, req.user);
  }
}
