import { DataTypes, Model, Sequelize } from 'sequelize';

export class Permission extends Model {
  declare id: number;
  declare module: string;
  declare subModule: string | null;
  declare action: string;
  declare permissionKey: string;
  declare description: string | null;
  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initPermissionModel(
  sequelize: Sequelize,
): typeof Permission {
  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      module: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      subModule: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      permissionKey: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'permissions',
      timestamps: true,
    },
  );

  return Permission;
}