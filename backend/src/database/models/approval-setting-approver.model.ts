import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class ApprovalSettingApprover extends Model {
  declare id: number;

  declare approvalSettingId: number;
  declare userId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initApprovalSettingApproverModel(
  sequelize: Sequelize,
): typeof ApprovalSettingApprover {
  ApprovalSettingApprover.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      approvalSettingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'ApprovalSettingApprover',
      tableName: 'approval_setting_approvers',
      timestamps: true,
    },
  );

  return ApprovalSettingApprover;
}