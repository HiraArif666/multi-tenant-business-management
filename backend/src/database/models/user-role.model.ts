import { DataTypes, Model, Sequelize } from 'sequelize';

export class UserRole extends Model {
  declare id: number;
  declare userId: number;
  declare roleId: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initUserRoleModel(
  sequelize: Sequelize,
): typeof UserRole {
  UserRole.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'user_roles',
      timestamps: true,
    },
  );

  return UserRole;
}