import {
  DataTypes,
  Model,
  Sequelize,
} from 'sequelize';

export class Company extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare businessUnitId: number;
  declare companyTypeId: number;
  declare adminId: number | null;
  declare isActive: boolean;
  declare phone: string | null;
  declare email: string | null;
  declare address: string | null;
  declare website: string | null;
  declare logo: string | null;

  // ==========================
  // Audit Fields
  // ==========================
  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export function initCompanyModel(
  sequelize: Sequelize,
): typeof Company {
  Company.init(
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

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      companyTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      website: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      // ==========================
      // Audit Fields
      // ==========================

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
      modelName: 'Company',
      tableName: 'companies',
      timestamps: true,

      // Enable Soft Delete
      paranoid: true,

      underscored: false,
    },
  );

  return Company;
}