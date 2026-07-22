import { Module } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

import { PermissionGuard } from '../auth/guards/permission.guard';

@Module({
  controllers: [RolesController],

  providers: [
    RolesService,
    DatabaseService,
    PermissionGuard,
  ],

  exports: [
    RolesService,
    PermissionGuard,
  ],
})
export class RolesModule {}