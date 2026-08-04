import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { ApprovalSettingsController } from './approval-settings.controller';
import { ApprovalSettingsService } from './approval-settings.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ApprovalSettingsController],
  providers: [ApprovalSettingsService],
  exports: [ApprovalSettingsService],
})
export class SettingsModule {}