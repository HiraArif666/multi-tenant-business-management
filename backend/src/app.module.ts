import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './companies/companies.module';
import { BusinessUnitsModule } from './business-units/business-units.module';
import { CompanyTypesModule } from './company-types/company-types.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { MasterDataModule } from './master-data/master-data.module';
import { SettingsModule } from './settings/settings.module';
import { ExpensesModule } from './expenses/expenses.module';
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    BusinessUnitsModule,
    CompanyTypesModule,
    CompaniesModule,
    RolesModule,
    UsersModule,
    FilesModule,
    MasterDataModule,
    SettingsModule,
    ExpensesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}