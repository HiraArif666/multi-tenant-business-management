import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';
import { SecurityLogService } from './security-log.service';

@ApiTags('Security Logs')
@ApiBearerAuth()
@Controller('api/security-logs')
@UseGuards(JwtGuard, PermissionGuard, BusinessUnitGuard)
export class SecurityLogController {
  constructor(
    private readonly securityLogService: SecurityLogService,
  ) {}

  @Get()
  @HasPermission('security.view')
  @ApiOperation({
    summary: 'View security log events',
  })
  findAll(@Query() query: any, @Req() req: any) {
    return this.securityLogService.findAll(
      query,
      req.user,
    );
  }
}
