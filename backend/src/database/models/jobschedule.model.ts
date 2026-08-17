import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class JobSchedule extends Model {
  declare id: number;

  declare reportId: number;
  declare recipientUserIds: number[];

  declare frequency: 'daily' | 'weekly' | 'monthly';
  declare time: string;

  declare dayOfWeek: number | null;
  declare dayOfMonth: number | null;

  declare isActive: boolean;

  declare lastRunAt: Date | null;
  declare nextRunAt: Date | null;

  declare businessUnitId: number;

  declare createdBy: number | null;
  declare updatedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initJobScheduleModel(
  sequelize: Sequelize,
): typeof JobSchedule {
  JobSchedule.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      reportId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      recipientUserIds: {
        type: DataTypes.JSONB,
        allowNull: false,
      },

      frequency: {
        type: DataTypes.ENUM(
          'daily',
          'weekly',
          'monthly',
        ),
        allowNull: false,
      },

      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      dayOfWeek: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      dayOfMonth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      lastRunAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      nextRunAt: {
        type: DataTypes.DATE,
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
      modelName: 'JobSchedule',
      tableName: 'job_schedules',
      timestamps: true,
    },
  );

  return JobSchedule;
}