import {
  DataTypes,
  Sequelize,
  Model,
} from 'sequelize';

export class User extends Model {
  declare id: number;
  declare username: string;
  declare email: string;
  declare password: string;
  declare name: string | null;
  declare role: string;
  declare businessUnitId: number | null;
  declare companyId: number | null;
  declare isActive: boolean;

  // Audit Fields
  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export function initUserModel(
  sequelize: Sequelize,
): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      role: {
        type: DataTypes.ENUM(
          'superadmin',
          'bu-admin',
          'company-admin',
          'user',
        ),
        allowNull: false,
        defaultValue: 'user',
      },

      businessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      companyId: {
        type: DataTypes.INTEGER,
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true,

      // Enables deletedAt (Soft Delete)
      paranoid: true,

      underscored: false,
    },
  );

  return User;
}