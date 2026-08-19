import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationListener } from './notification.listener';

@Module({
  imports: [DatabaseModule, EventEmitterModule.forRoot()],
  providers: [NotificationService, NotificationListener],
  controllers: [NotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
export class AppModule {}