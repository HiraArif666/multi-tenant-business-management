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

import { UpdateMeDto } from './dto/update-me.dto';

import { UsersService } from './users.service';
import { UserRolesService } from './user-roles.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { BusinessUnitGuard } from '../business-units/guards/business-unit.guard';


@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/users')
@UseGuards(JwtGuard, PermissionGuard, BusinessUnitGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}


  // ==========================
  // Get My Own Profile
  // ==========================

  @Get('me')
  @ApiOperation({
    summary: 'Get my own profile',
  })
  getMe(@Req() req: any) {
    return this.usersService.getMe(req.user.id);
  }

  // ==========================
  // Update My Own Profile
  // ==========================

  @Put('me')
  @ApiOperation({
    summary: 'Update my own profile',
  })
  updateMe(
    @Body() body: UpdateMeDto,
    @Req() req: any,
  ) {
    return this.usersService.updateMe(
      req.user.id,
      body,
    );
  }
  
  // ==========================
  // Get Users
  // ==========================

  @Get()
  @HasPermission('staff.users.view')
  @ApiOperation({
    summary: 'Get Users',
  })
  findAll(
    @Query() query: any,
    @Req() req: any,
  ) {
    return this.usersService.findAll(
      query,
      req.user,
    );
  }

  // ==========================
  // Get User By Id
  // ==========================

  @Get(':id')
  @HasPermission('staff.users.view')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.usersService.findOne(
      id,
      req.user,
    );
  }

  // ==========================
  // Create User
  // ==========================

  @Post()
  @HasPermission('staff.users.add')
  @ApiOperation({
    summary: 'Create User',
  })
  create(
    @Body() body: CreateUserDto,
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
  @HasPermission('staff.users.edit')
  @ApiOperation({
    summary: 'Update User',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
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
  @HasPermission('staff.users.delete')
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
  @HasPermission('staff.users.view')
  @ApiOperation({
    summary: 'Get User Roles',
  })
  getRoles(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.usersService.getRoles(
      id,
      req.user,
    );
  }

  // ==========================
  // Assign Roles
  // ==========================

  @Post(':id/roles')
  @HasPermission('staff.users.edit')
  @ApiOperation({
    summary: 'Assign Roles',
  })
  assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AssignRoleDto,
    @Req() req: any,
  ) {
    return this.usersService.assignRoles(
      id,
      body.roleIds,
      req.user,
    );
  }

  // ==========================
  // Remove Role
  // ==========================

  @Delete(':userId/roles/:roleId')
  @HasPermission('staff.users.edit')
  @ApiOperation({
    summary: 'Remove Role',
  })
  removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
    @Req() req: any,
  ) {
    return this.usersService.removeRole(
      userId,
      roleId,
      req.user,
    );
    
  }

  
}