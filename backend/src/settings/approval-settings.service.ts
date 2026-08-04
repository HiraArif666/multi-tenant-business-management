import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';
import { APPROVABLE_MODULES } from '../common/constants/approvable-module';

@Injectable()
export class ApprovalSettingsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  private resolveBusinessUnitId(user: any) {
    const businessUnitId =
      user.role === 'superadmin'
        ? user.selectedBusinessUnitId
        : user.businessUnitId;

    if (!businessUnitId) {
      throw new BadRequestException(
        'Please select a Business Unit first',
      );
    }

    return businessUnitId;
  }

  // ==========================
  // Available Modules (for the first dropdown)
  // ==========================

  getModules() {
    return {
      success: true,
      data: APPROVABLE_MODULES,
    };
  }

  // ==========================
  // BU Users (for the approvers dropdown)
  // ==========================

  async getApprovers(user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const users =
      await this.databaseService.User.findAll({
        where: {
          businessUnitId,
          isActive: true,
        },
        attributes: [
          'id',
          'name',
          'username',
          'email',
        ],
        order: [['name', 'ASC']],
      });

    return {
      success: true,
      data: users,
    };
  }

  // ==========================
  // Get Approval Setting for a Module
  // ==========================

  async getByModule(moduleName: string, user: any) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const setting =
      await this.databaseService.ApprovalSetting.findOne(
        {
          where: {
            moduleName,
            businessUnitId,
          },
          include: [
            {
              association: 'approvers',
              include: [
                {
                  association: 'user',
                  attributes: [
                    'id',
                    'name',
                    'username',
                    'email',
                  ],
                },
              ],
            },
          ],
        },
      );

    if (!setting) {
      return {
        success: true,
        data: {
          moduleName,
          approverIds: [],
          approvers: [],
        },
      };
    }

    return {
      success: true,
      data: {
        moduleName: setting.moduleName,
        approverIds: setting.approvers.map(
          (a: any) => a.userId,
        ),
        approvers: setting.approvers.map(
          (a: any) => a.user,
        ),
      },
    };
  }

  // ==========================
  // Upsert Approval Setting for a Module
  // ==========================

  async upsert(
    moduleName: string,
    approverIds: number[],
    user: any,
  ) {
    const businessUnitId =
      this.resolveBusinessUnitId(user);

    const isValidModule = APPROVABLE_MODULES.some(
      (m) => m.key === moduleName,
    );

    if (!isValidModule) {
      throw new BadRequestException(
        'Invalid module',
      );
    }

    let setting =
      await this.databaseService.ApprovalSetting.findOne(
        {
          where: {
            moduleName,
            businessUnitId,
          },
        },
      );

    if (!setting) {
      setting =
        await this.databaseService.ApprovalSetting.create(
          {
            moduleName,
            businessUnitId,
            createdBy: user.id,
          },
        );
    } else {
      await setting.update({
        updatedBy: user.id,
      });
    }

    await this.databaseService.ApprovalSettingApprover.destroy(
      {
        where: {
          approvalSettingId: setting.id,
        },
      },
    );

    if (approverIds && approverIds.length) {
      await this.databaseService.ApprovalSettingApprover.bulkCreate(
        approverIds.map((userId) => ({
          approvalSettingId: setting.id,
          userId,
        })),
      );
    }

    return {
      success: true,
      message:
        'Approval settings updated successfully',
    };
  }

  // ==========================
  // Used by other modules (e.g. ExpensesService) to
  // check whether a user is allowed to approve/reject
  // ==========================

  async isApprover(
    moduleName: string,
    businessUnitId: number,
    userId: number,
  ): Promise<boolean> {
    const setting =
      await this.databaseService.ApprovalSetting.findOne(
        {
          where: {
            moduleName,
            businessUnitId,
          },
        },
      );

    if (!setting) {
      return false;
    }

    const approver =
      await this.databaseService.ApprovalSettingApprover.findOne(
        {
          where: {
            approvalSettingId: setting.id,
            userId,
          },
        },
      );

    return !!approver;
  }
}