import { DataTypes, Model, Sequelize } from 'sequelize';

export class CompanyType extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare isActive: boolean;
  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export function initCompanyTypeModel(
  sequelize: Sequelize,
): typeof CompanyType {
  CompanyType.init(
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

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
      modelName: 'CompanyType',
      tableName: 'company_types',
      timestamps: true,
      paranoid: true,
      underscored: false,
    },
  );

  return CompanyType;
}