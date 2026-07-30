import {
  DataTypes,
  Model,
  Sequelize,
} from 'sequelize';

export class Role extends Model {
  declare id: number;

  declare name: string;
  declare description: string | null;

  declare businessUnitId: number | null;
  declare companyId: number | null;

  declare isSystem: boolean;
  declare isActive: boolean;

  // Audit
  declare createdBy: number | null;
  declare updatedBy: number | null;
  declare deletedBy: number | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date | null;
}

export function initRoleModel(
  sequelize: Sequelize,
): typeof Role {
  Role.init(
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
        allowNull: true,
      },

      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: 'Role',
      tableName: 'roles',

      timestamps: true,

      // Soft Delete
      paranoid: true,

      underscored: false,

      indexes: [
        {
          unique: true,
          fields: [
            'name',
            'businessUnitId',
          ],
        },
      ],
    },
  );

  return Role;
}