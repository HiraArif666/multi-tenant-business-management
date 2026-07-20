import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { DatabaseModule } from '../database/database.module';
import { QueryFilterService } from '../common/services/query-filter.service';

@Module({
  imports: [DatabaseModule],
  controllers: [CompaniesController],  // ✅ Controllers
  providers: [CompaniesService, QueryFilterService],  // ✅ Providers
})
export class CompaniesModule {}