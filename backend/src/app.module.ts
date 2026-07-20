import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CompaniesModule } from './companies/companies.module';
import { BusinessUnitsModule } from './business-units/business-units.module';  // ✅ Add
import { CompanyTypesModule } from './company-types/company-types.module';

@Module({
  imports: [
    DatabaseModule, 
    AuthModule, 
    CompaniesModule,
    CompanyTypesModule,  // ✅ Add

    BusinessUnitsModule,  // ✅ Add
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}