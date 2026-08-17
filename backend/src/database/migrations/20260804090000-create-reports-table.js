'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // 'expense', 'users', 'vendors', 'suppliers', ...
      moduleKey: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // Ordered array of selected column keys, e.g. ["title","amount","status"]
      columns: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      // { startDate, endDate, isActive, search, status, ... }
      filters: {
        type: Sequelize.JSONB,
        allowNull: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reports');
  },
};