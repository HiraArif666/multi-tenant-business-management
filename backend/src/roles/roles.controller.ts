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
import { JwtGuard } from '../auth/guards/jwt.guard';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('api/roles')
@UseGuards(JwtGuard)
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
  ) {}

  // ==========================
  // Create Role
  // ==========================

  @Post()
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

  // ==========================
  // Delete Role
  // ==========================

  @Delete(':id')
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
@ApiOperation({
  summary: 'Get Role Permissions',
})
getRolePermissions(
  @Param('id', ParseIntPipe) id: number,
) {
  return this.rolesService.getRolePermissions(
    id,
  );
}

// ==========================
// Assign Permissions
// ==========================

@Post(':id/permissions')
@ApiOperation({
  summary: 'Assign Permissions To Role',
})
assignPermissions(
  @Param('id', ParseIntPipe) id: number,
  @Body() body: AssignPermissionsDto,
) {
  return this.rolesService.assignPermissions(
    id,
    body.permissionIds,
  );
}

// ==========================
// Remove Permission
// ==========================

@Delete(':roleId/permissions/:permissionId')
@ApiOperation({
  summary: 'Remove Permission From Role',
})
removePermission(
  @Param('roleId', ParseIntPipe)
  roleId: number,

  @Param('permissionId', ParseIntPipe)
  permissionId: number,
) {
  return this.rolesService.removePermission(
    roleId,
    permissionId,
  );
}

  // ==========================
  // Get Permissions
  // ==========================

  @Get('/permissions/all')
  @ApiOperation({
    summary: 'Get All Permissions',
  })
  permissions() {
    return this.rolesService.getPermissions();
  }
}