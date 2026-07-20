import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class BusinessUnit extends Model {
  declare id: number;
  declare name: string;
  declare description: string | null;
  declare adminId: number | null;
  declare isActive: boolean;

  // Audit Fields
  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export function initBusinessUnitModel(
  sequelize: Sequelize,
): typeof BusinessUnit {
  BusinessUnit.init(
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

      adminId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      // ======================
      // Audit Fields
      // ======================

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
      modelName: 'BusinessUnit',
      tableName: 'business_units',
      timestamps: true,
      paranoid: true,
      underscored: false,
    },
  );

  return BusinessUnit;
}