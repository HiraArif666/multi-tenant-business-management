import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class ApprovalSetting extends Model {
  declare id: number;

  declare moduleName: string;
  declare businessUnitId: number;

  declare createdBy: number | null;
  declare updatedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initApprovalSettingModel(
  sequelize: Sequelize,
): typeof ApprovalSetting {
  ApprovalSetting.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      moduleName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ApprovalSetting',
      tableName: 'approval_settings',
      timestamps: true,
    },
  );

  return ApprovalSetting;
}