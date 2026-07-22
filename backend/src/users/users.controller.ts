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

import { UsersService } from './users.service';
import { UserRolesService } from './user-roles.service';

import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  // ==========================
  // Get Users
  // ==========================

  @Get()
  @ApiOperation({
    summary: 'Get Users',
  })
  findAll(
    @Query() query: any,
  ) {
    return this.usersService.findAll(query);
  }

  // ==========================
  // Get User By Id
  // ==========================

  @Get(':id')
  @ApiOperation({
    summary: 'Get User By Id',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.findOne(id);
  }

  // ==========================
  // Create User
  // ==========================

  @Post()
  @ApiOperation({
    summary: 'Create User',
  })
  create(
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.usersService.create(
      body,
      req.user,
    );
  }

  // ==========================
  // Update User
  // ==========================

  @Put(':id')
  @ApiOperation({
    summary: 'Update User',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.usersService.update(
      id,
      body,
      req.user,
    );
  }

  // ==========================
  // Delete User
  // ==========================

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete User',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.usersService.remove(
      id,
      req.user,
    );
  }

  // ==========================
  // Get User Roles
  // ==========================

  @Get(':id/roles')
  @ApiOperation({
    summary: 'Get User Roles',
  })
  getUserRoles(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.userRolesService.getUserRoles(id);
  }

  // ==========================
  // Assign Roles
  // ==========================

  @Post(':id/roles')
  @ApiOperation({
    summary: 'Assign Roles',
  })
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRoleDto,
  ) {
    return this.userRolesService.assignRoles(
      id,
      dto.roleIds,
    );
  }

  // ==========================
  // Remove Role
  // ==========================

  @Delete(':id/roles/:roleId')
  @ApiOperation({
    summary: 'Remove Role',
  })
  removeRole(
    @Param('id', ParseIntPipe) id: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userRolesService.removeRole(
      id,
      roleId,
    );
  }
}