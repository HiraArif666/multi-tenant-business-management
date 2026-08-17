import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../database/database.module';
import { JwtGuard } from './guards/jwt.guard';
import { MailModule } from '../mail/mail.module';
import { SecurityLogModule } from '../security-log/security-log.module';

@Module({
  imports: [DatabaseModule, MailModule, SecurityLogModule],
  controllers: [AuthController],
  providers: [AuthService, JwtGuard],
})
export class AuthModule {}