'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add businessUnitId column
    await queryInterface.addColumn('users', 'businessUnitId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'business_units',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    // Add companyId column
    await queryInterface.addColumn('users', 'companyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'companies',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    // Update role ENUM to include new roles
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('superadmin', 'bu-admin', 'company-admin', 'user'),
      defaultValue: 'user'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'businessUnitId');
    await queryInterface.removeColumn('users', 'companyId');
  }
};