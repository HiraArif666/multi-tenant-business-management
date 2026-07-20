import { DataTypes, Model, Sequelize } from 'sequelize';

export class LoginToken extends Model {
  declare id: number;
  declare userId: number;
  declare token: string;
  declare expiresAt: Date;
  declare isRevoked: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function initLoginTokenModel(
  sequelize: Sequelize,
): typeof LoginToken {
  LoginToken.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      isRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'login_tokens',
      timestamps: true,
    },
  );

  return LoginToken;
}