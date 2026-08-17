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

  declare profilePicture: string | null;

  declare resetPasswordToken: string | null;
  declare resetPasswordExpires: Date | null;

  declare failedLoginAttempts: number;
  declare lockedUntil: Date | null;

  // Temporary until RBAC fully replaces it
  declare role: string;

  declare businessUnitId: number | null;
  declare companyId: number | null;

  // Currently selected context
  declare selectedBusinessUnitId: number | null;
  declare selectedCompanyId: number | null;

  declare isActive: boolean;

  // Audit
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

      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      failedLoginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      lockedUntil: {
        type: DataTypes.DATE,
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

      selectedBusinessUnitId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      selectedCompanyId: {
        type: DataTypes.INTEGER,
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: false,
    },
  );

  return User;
}