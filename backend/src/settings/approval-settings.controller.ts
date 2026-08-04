import {
  Controller,
  Get,
  Put,
  Param,
  Body,
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

import { ApprovalSettingsService } from './approval-settings.service';
import { UpsertApprovalSettingDto } from './dto/upsert-approval-setting.dto';

@ApiTags('Settings - Approval Settings')
@ApiBearerAuth()
@Controller('api/settings/approval-settings')
@UseGuards(JwtGuard, BusinessUnitGuard, PermissionGuard)
export class ApprovalSettingsController {
  constructor(
    private readonly approvalSettingsService: ApprovalSettingsService,
  ) {}

  // ==========================
  // Available Modules (first dropdown)
  // ==========================

  @Get('modules')
  @HasPermission('settings.approval-settings.view')
  @ApiOperation({ summary: 'Get approvable modules' })
  getModules() {
    return this.approvalSettingsService.getModules();
  }

  // ==========================
  // BU Users (approvers dropdown)
  // ==========================

  @Get('approvers')
  @HasPermission('settings.approval-settings.view')
  @ApiOperation({ summary: 'Get Business Unit users as approver options' })
  getApprovers(@Req() req: any) {
    return this.approvalSettingsService.getApprovers(
      req.user,
    );
  }

  // ==========================
  // Get Setting for a Module
  // ==========================

  @Get(':moduleName')
  @HasPermission('settings.approval-settings.view')
  @ApiOperation({ summary: 'Get approval setting for a module' })
  getByModule(
    @Param('moduleName') moduleName: string,
    @Req() req: any,
  ) {
    return this.approvalSettingsService.getByModule(
      moduleName,
      req.user,
    );
  }

  // ==========================
  // Upsert Setting for a Module
  // ==========================

  @Put(':moduleName')
  @HasPermission('settings.approval-settings.edit')
  @ApiOperation({ summary: 'Set approvers for a module' })
  upsert(
    @Param('moduleName') moduleName: string,
    @Body() body: UpsertApprovalSettingDto,
    @Req() req: any,
  ) {
    return this.approvalSettingsService.upsert(
      moduleName,
      body.approverIds,
      req.user,
    );
  }
}