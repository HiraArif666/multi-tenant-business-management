import { DataTypes, Model, Sequelize } from 'sequelize';

export class Module extends Model {
  declare id: number;

  declare name: string;

  declare slug: string;

  declare parentId: number | null;

  declare sortOrder: number;

  declare icon: string | null;

  declare isActive: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initModuleModel(
  sequelize: Sequelize,
): typeof Module {
  Module.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      sortOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      icon: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      tableName: 'modules',
      timestamps: true,
    },
  );

  return Module;
}