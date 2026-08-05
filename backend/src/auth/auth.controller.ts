import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtGuard } from './guards/jwt.guard';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({
    summary: 'Seed SuperAdmin',
  })
  @Post('seed')
  async seed() {
    return this.authService.createSuperAdmin();
  }

  @ApiOperation({
    summary: 'Login using username and password',
  })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(
      body.username,
      body.password,
      body.rememberMe,
    );
  }

  @ApiOperation({
    summary: 'Request a password reset email',
  })
  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @ApiOperation({
    summary: 'Reset password using a reset token',
  })
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(
      body.token,
      body.password,
    );
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout',
  })
  @Post('logout')
  @UseGuards(JwtGuard)
  logout(@Req() req: any) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.logout(token);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create User',
  })
  @Post('create-user')
  @UseGuards(JwtGuard)
  createUser(
    @Body() body: CreateUserDto,
    @Req() req: any,
  ) {
    return this.authService.createUser(body, req.user);
  }
}