import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JwtGuard implements CanActivate {
  private readonly jwtSecret =
    'your-secret-key-change-this';

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request =
      context.switchToHttp().getRequest();

    const authHeader =
      request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException(
        'No token provided',
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const loginToken =
        await this.databaseService.LoginToken.findOne({
          where: {
            token,
            isRevoked: false,
          },
        });

      if (!loginToken) {
        throw new UnauthorizedException(
          'Token revoked',
        );
      }

      if (
        new Date(loginToken.expiresAt) <
        new Date()
      ) {
        throw new UnauthorizedException(
          'Token expired',
        );
      }

      const decoded = jwt.verify(
        token,
        this.jwtSecret,
      );

      request.user = decoded;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid token',
      );
    }
  }
}