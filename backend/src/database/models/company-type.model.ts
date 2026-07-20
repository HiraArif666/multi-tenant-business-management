import { DataTypes, Model, Sequelize } from 'sequelize';

export class CompanyType extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
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
    },
    {
      sequelize,
      modelName: 'CompanyType',
      tableName: 'company_types',
      timestamps: true,
      underscored: false,
    },
  );

  return CompanyType;
}