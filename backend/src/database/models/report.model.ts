import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class Report extends Model {
  declare id: number;

  declare name: string;
  declare moduleKey: string;

  declare columns: string[];
  declare filters: Record<string, any> | null;

  declare businessUnitId: number;

  declare createdBy: number | null;
  declare updatedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initReportModel(
  sequelize: Sequelize,
): typeof Report {
  Report.init(
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

      moduleKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      columns: {
        type: DataTypes.JSONB,
        allowNull: false,
      },

      filters: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'reports',
      timestamps: true,
    },
  );

  return Report;
}