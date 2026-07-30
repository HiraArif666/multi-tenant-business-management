'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('companies', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'address', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'website', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('companies', 'logo', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('companies', 'phone');
    await queryInterface.removeColumn('companies', 'email');
    await queryInterface.removeColumn('companies', 'address');
    await queryInterface.removeColumn('companies', 'website');
    await queryInterface.removeColumn('companies', 'logo');
  },
};