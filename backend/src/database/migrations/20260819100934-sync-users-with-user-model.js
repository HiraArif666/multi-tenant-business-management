'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'users',
      'selectedBusinessUnitId',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );

    await queryInterface.addColumn(
      'users',
      'selectedCompanyId',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn(
      'users',
      'selectedCompanyId',
    );

    await queryInterface.removeColumn(
      'users',
      'selectedBusinessUnitId',
    );
  },
};