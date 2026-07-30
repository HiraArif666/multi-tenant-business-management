import { Module } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

import { PermissionGuard } from '../auth/guards/permission.guard';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
  ],

  controllers: [
    RolesController,
  ],

  providers: [
    RolesService,
    PermissionGuard,
  ],

  exports: [
    RolesService,
  ],
})
export class RolesModule {}