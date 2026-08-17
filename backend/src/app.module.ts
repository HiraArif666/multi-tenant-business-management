import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './companies/companies.module';
import { BusinessUnitsModule } from './business-units/business-units.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { MasterDataModule } from './master-data/master-data.module';
import { ExpensesModule } from './expenses/expenses.module';
import { SettingsModule } from './settings/settings.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditContextInterceptor } from './audit-log/audit-context.interceptor';
import { ImportsModule } from './imports/imports.module';
import { SecurityLogModule } from './security-log/security-log.module';
import { ReportsModule } from './reports/reports.module';
import { ScheduleModule } from '@nestjs/schedule';
import { JobSchedulerModule } from './jobschedule/job-scheduler.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    BusinessUnitsModule,
    CompaniesModule,
    RolesModule,
    UsersModule,
    FilesModule,
    MasterDataModule,
    ExpensesModule,
    SettingsModule,
    AuditLogModule,
    DashboardModule,
    ImportsModule,
    SecurityLogModule,
    ReportsModule,
    ScheduleModule.forRoot(),
    JobSchedulerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditContextInterceptor,
    },
  ],
})
export class AppModule {}