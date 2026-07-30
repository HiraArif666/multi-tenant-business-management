import { Model, DataTypes, Sequelize } from 'sequelize';

export class SelectedBusinessUnit extends Model {
  public userId!: number;
  public businessUnitId!: number;

  // Call this in your sequelize setup to initialize the model
  static initialize(sequelize: Sequelize) {
    SelectedBusinessUnit.init(
      {
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          unique: true,
        },
        businessUnitId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'selected_business_units',
      }
    );
  }
}