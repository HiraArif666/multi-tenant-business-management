import { Module } from '@nestjs/common';
import { BusinessUnitsController } from './business-units.controller';
import { BusinessUnitsService } from './business-units.service';
import { DatabaseModule } from '../database/database.module';
import { QueryFilterService } from '../common/services/query-filter.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BusinessUnitsController],
  providers: [BusinessUnitsService, QueryFilterService],
})
export class BusinessUnitsModule {}