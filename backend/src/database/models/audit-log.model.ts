import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class AuditLog extends Model {
  declare id: number;

  declare userId: number | null;
  declare userName: string | null;

  declare ipAddress: string | null;
  declare userAgent: string | null;

  declare module: string;
  declare tableName: string;
  declare recordId: string | null;

  declare action: 'create' | 'update' | 'delete';

  declare beforeValues: Record<string, any> | null;
  declare afterValues: Record<string, any> | null;

  declare businessUnitId: number | null;

  declare readonly createdAt: Date;
}

export function initAuditLogModel(
  sequelize: Sequelize,
): typeof AuditLog {
  AuditLog.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      userName: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      tableName: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      recordId: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      action: {
        type: DataTypes.ENUM(
          'create',
          'update',
          'delete',
        ),
        allowNull: false,
      },

      beforeValues: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      afterValues: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'audit_logs',
      timestamps: true,
      updatedAt: false,
    },
  );

  return AuditLog;
}