import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  await queryInterface.addColumn('roles', 'deletedAt', {
    type: DataTypes.DATE,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('roles', 'deletedAt');
}