import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { SettingsModule } from '../settings/settings.module';

import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [DatabaseModule, SettingsModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}