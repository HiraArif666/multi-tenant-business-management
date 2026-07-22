import { DataTypes, Model, Sequelize } from 'sequelize';

export class Role extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;

  declare businessUnitId: number | null;
  declare companyId: number | null;

  declare isSystem: boolean;
  declare isActive: boolean;

  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initRoleModel(
  sequelize: Sequelize,
): typeof Role {
  Role.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      isSystem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'roles',
      timestamps: true,
    },
  );

  return Role;
}