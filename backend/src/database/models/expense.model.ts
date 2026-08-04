import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class Expense extends Model {
  declare id: number;

  declare title: string;
  declare description: string | null;
  declare amount: number;

  declare status: 'pending' | 'approved' | 'rejected';
  declare approvedBy: number | null;

  declare businessUnitId: number;

  declare isActive: boolean;

  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export function initExpenseModel(
  sequelize: Sequelize,
): typeof Expense {
  Expense.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM(
          'pending',
          'approved',
          'rejected',
        ),
        allowNull: false,
        defaultValue: 'pending',
      },

      approvedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: 'Expense',
      tableName: 'expenses',
      timestamps: true,
      paranoid: true,
    },
  );

  return Expense;
}