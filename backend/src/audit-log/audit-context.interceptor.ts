import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable } from 'rxjs';

import {
  auditContextStorage,
  AuditContext,
} from './audit-context';

@Injectable()
export class AuditContextInterceptor
  implements NestInterceptor
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest();

    // Runs after guards, so req.user is already populated
    // for authenticated routes (undefined for public ones
    // like /login or /forgot-password — that's fine).
    const user = request.user;

    const ipAddress =
      (request.headers['x-forwarded-for'] as string)
        ?.split(',')[0]
        ?.trim() ||
      request.ip ||
      request.socket?.remoteAddress ||
      null;

    const auditContext: AuditContext = {
      userId: user?.id ?? null,
      userName: user?.name ?? null,
      ipAddress,
      userAgent:
        request.headers['user-agent'] || null,
      businessUnitId:
        user?.role === 'superadmin'
          ? user?.selectedBusinessUnitId ?? null
          : user?.businessUnitId ?? null,
    };

    return new Observable((subscriber) => {
      auditContextStorage.run(auditContext, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}