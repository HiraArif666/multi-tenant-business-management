import { Module } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { SecurityLogModule } from '../security-log/security-log.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRolesService } from './user-roles.service';

@Module({
  imports: [SecurityLogModule],
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