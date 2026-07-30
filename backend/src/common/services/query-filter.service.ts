import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';

@Injectable()
export class QueryFilterService {
  getCompanyFilter(user: any) {
    if (user.role === 'superadmin') {
      if (!user.selectedBusinessUnitId) {
        throw new BadRequestException(
          'Please select a Business Unit first',
        );
      }

      return { businessUnitId: user.selectedBusinessUnitId };
    }

    if (user.role === 'bu-admin') {
      if (!user.businessUnitId) {
        throw new ForbiddenException('Invalid user context');
      }
      return { businessUnitId: user.businessUnitId };
    }

    if (user.role === 'company-admin' || user.role === 'user') {
      if (!user.companyId) {
        throw new ForbiddenException('User not assigned to any company');
      }
      return { id: user.companyId };
    }

    throw new ForbiddenException('Invalid user role');
  }

  getBusinessUnitFilter(user: any) {
    if (user.role === 'superadmin') {
      return {};
    }

    if (user.role === 'bu-admin') {
      if (!user.businessUnitId) {
        throw new ForbiddenException('Invalid user context');
      }
      return { id: user.businessUnitId };
    }

    if (user.role === 'company-admin' || user.role === 'user') {
      if (!user.businessUnitId) {
        throw new ForbiddenException('Invalid user context');
      }
      return { id: user.businessUnitId };
    }

    throw new ForbiddenException('Invalid user role');
  }

  getUserFilter(user: any) {
    if (user.role === 'superadmin') {
      return {};
    }

    if (user.role === 'bu-admin') {
      if (!user.businessUnitId) {
        throw new ForbiddenException('Invalid user context');
      }
      return { businessUnitId: user.businessUnitId };
    }

    if (user.role === 'company-admin') {
      if (!user.companyId) {
        throw new ForbiddenException('Invalid user context');
      }
      return { companyId: user.companyId };
    }

    if (user.role === 'user') {
      return { id: user.id };
    }

    throw new ForbiddenException('Invalid user role');
  }
}