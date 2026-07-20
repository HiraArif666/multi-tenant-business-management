'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('business_units', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('business_units', 'adminId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};