import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './companies/companies.module';
import { BusinessUnitsModule } from './business-units/business-units.module';  // ✅ Add
import { CompanyTypesModule } from './company-types/company-types.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from './auth/guards/permission.guard';


@Module({
  imports: [
 DatabaseModule,
  AuthModule,
  BusinessUnitsModule,
  CompanyTypesModule,
  CompaniesModule,
  RolesModule,
  UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}