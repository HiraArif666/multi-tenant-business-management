import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class SecurityLog extends Model {
  declare id: number;

  declare userId: number | null;
  declare username: string | null;

  declare eventType:
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'account_locked'
    | 'password_changed'
    | 'password_reset'
    | 'suspicious_activity';

  declare ipAddress: string | null;
  declare userAgent: string | null;

  declare businessUnitId: number | null;
  declare details: Record<string, any> | null;

  declare readonly createdAt: Date;
}

export function initSecurityLogModel(
  sequelize: Sequelize,
): typeof SecurityLog {
  SecurityLog.init(
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

      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      eventType: {
        type: DataTypes.ENUM(
          'login_success',
          'login_failed',
          'logout',
          'account_locked',
          'password_changed',
          'password_reset',
          'suspicious_activity',
        ),
        allowNull: false,
      },

      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'SecurityLog',
      tableName: 'security_logs',
      timestamps: true,
      updatedAt: false,
    },
  );

  return SecurityLog;
}