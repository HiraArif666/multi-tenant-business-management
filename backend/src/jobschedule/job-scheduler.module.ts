import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { ReportsModule } from '../reports/reports.module';
import { MailModule } from '../mail/mail.module';

import { JobSchedulerController } from './job-scheduler.controller';
import { JobSchedulerService } from './job-scheduler.service';

@Module({
  imports: [DatabaseModule, ReportsModule, MailModule],
  controllers: [JobSchedulerController],
  providers: [JobSchedulerService],
})
export class JobSchedulerModule {}