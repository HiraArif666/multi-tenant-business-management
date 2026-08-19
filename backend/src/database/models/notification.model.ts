import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class Notification extends Model {
  declare id: number;
  declare businessUnitId: number;
  declare userId: number;
  declare type: string;
  declare title: string;
  declare message: string;
  declare isRead: boolean;
  declare actionUrl: string | null;
  declare metadata: Record<string, any> | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initNotificationModel(
  sequelize: Sequelize,
): typeof Notification {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      actionUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: 'notifications',
      timestamps: true,
    },
  );

  return Notification;
}