import { Module } from '@nestjs/common';
import { CompanyTypesController } from './company-types.controller';
import { CompanyTypesService } from './company-types.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CompanyTypesController],
  providers: [CompanyTypesService],
})
export class CompanyTypesModule {}