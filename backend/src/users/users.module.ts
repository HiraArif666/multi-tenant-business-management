import { Module } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRolesService } from './user-roles.service';

@Module({
  controllers: [UsersController],

  providers: [
    UsersService,
    UserRolesService,
    DatabaseService,
  ],

  exports: [
    UsersService,
    UserRolesService,
  ],
})
export class UsersModule {}