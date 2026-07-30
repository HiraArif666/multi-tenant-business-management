import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class BusinessUnitGuard
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    if (user.role !== 'superadmin') {
      return true;
    }

    if (!user.selectedBusinessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    return true;
  }
}