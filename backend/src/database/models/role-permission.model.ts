import { DataTypes, Model, Sequelize } from 'sequelize';

export class RolePermission extends Model {
  declare id: number;
  declare roleId: number;
  declare permissionId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initRolePermissionModel(
  sequelize: Sequelize,
): typeof RolePermission {
  RolePermission.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'role_permissions',
      timestamps: true,
    },
  );

  return RolePermission;
}