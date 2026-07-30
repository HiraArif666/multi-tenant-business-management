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
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { RolesService } from './roles.service';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { HasPermission } from '../auth/decorators/has-permission.decorator';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('api/roles')
@UseGuards(JwtGuard, PermissionGuard, BusinessUnitGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  // ==========================
  // Create Role
  // ==========================

  @Post()
  @HasPermission('staff.roles.add')
  @ApiOperation({
    summary: 'Create Role',
  })
  create(
    @Body() body: CreateRoleDto,
    @Req() req: any,
  ) {
    return this.rolesService.create(
      body,
      req.user,
    );
  }

  // ==========================
  // Get Roles
  // ==========================

  @Get()
  @HasPermission('staff.roles.view')
  @ApiOperation({
    summary: 'Get Roles',
  })
  findAll(
    @Query() query: any,
    @Req() req: any,
  ) {
    return this.rolesService.findAll(
      query,
      req.user,
    );
  }

  // ==========================
  // Get Role By Id
  // ==========================

  @Get(':id')
  @HasPermission('staff.roles.view')
  @ApiOperation({
    summary: 'Get Role By Id',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.rolesService.findOne(
      id,
      req.user,
    );
  }

  // ==========================
  // Update Role
  // ==========================

  @Put(':id')
  @HasPermission('staff.roles.edit')
  @ApiOperation({
    summary: 'Update Role',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoleDto,
    @Req() req: any,
  ) {
    return this.rolesService.update(
      id,
      body,
      req.user,
    );
  }



  @Put(':id/status')
@HasPermission('staff.roles.edit')
@ApiOperation({
  summary: 'Update Role Status',
})
updateStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: UpdateRoleStatusDto,
  @Req() req: any,
) {
  return this.rolesService.updateStatus(
    id,
    body.isActive,
    req.user,
  );
}

  // ==========================
  // Delete Role
  // ==========================

  @Delete(':id')
  @HasPermission('staff.roles.delete')
  @ApiOperation({
    summary: 'Delete Role',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.rolesService.remove(
      id,
      req.user,
    );
  }

  // ==========================
  // Get Role Permissions
  // ==========================

  @Get(':id/permissions')
  @HasPermission('staff.roles.view')
  @ApiOperation({
    summary: 'Get Role Permissions',
  })
 getRolePermissions(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: any,
) {
  return this.rolesService.getRolePermissions(
    id,
    req.user,
  );
}

  // ==========================
  // Assign Permissions
  // ==========================

  @Post(':id/permissions')
  @HasPermission('staff.roles.edit')
  @ApiOperation({
    summary: 'Assign Permissions To Role',
  })
assignPermissions(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: AssignPermissionsDto,
  @Req() req: any,
) {
  return this.rolesService.assignPermissions(
    id,
    body.permissionIds,
    req.user,
  );
}

  // ==========================
  // Remove Permission
  // ==========================

  @Delete(':roleId/permissions/:permissionId')
  @HasPermission('staff.roles.edit')
  @ApiOperation({
    summary: 'Remove Permission From Role',
  })
removePermission(
  @Param('roleId', ParseIntPipe) roleId: number,
  @Param('permissionId', ParseIntPipe) permissionId: number,
  @Req() req: any,
) {
  return this.rolesService.removePermission(
    roleId,
    permissionId,
    req.user,
  );
}
  

  // ==========================
  // Get All Permissions
  // ==========================

  @Get('/permissions/all')
  @HasPermission('staff.roles.view')
  @ApiOperation({
    summary: 'Get All Permissions',
  })
  permissions() {
    return this.rolesService.getPermissions();
  }
}
  

