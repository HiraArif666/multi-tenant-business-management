'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('approval_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // e.g. 'expense' — matches a key in APPROVABLE_MODULES
      moduleName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      businessUnitId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // One approval config per module per business unit
    await queryInterface.addConstraint(
      'approval_settings',
      {
        fields: ['moduleName', 'businessUnitId'],
        type: 'unique',
        name: 'approval_settings_module_bu_unique',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('approval_settings');
  },
};