import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
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

import { AuditLogService } from './audit-log.service';

@ApiTags('Audit Log')
@ApiBearerAuth()
@Controller('api/audit-logs')
@UseGuards(JwtGuard, BusinessUnitGuard, PermissionGuard)
export class AuditLogController {
  constructor(
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @HasPermission('audit-log.view')
  @ApiOperation({ summary: 'Get Audit Logs' })
  findAll(@Query() query: any, @Req() req: any) {
    return this.auditLogService.findAll(
      query,
      req.user,
    );
  }

  @Get('modules')
  @HasPermission('audit-log.view')
  @ApiOperation({ summary: 'Get distinct modules for filtering' })
  getModules(@Req() req: any) {
    return this.auditLogService.getModules(req.user);
  }
}