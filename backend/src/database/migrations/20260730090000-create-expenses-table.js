'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('expenses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM(
          'pending',
          'approved',
          'rejected',
        ),
        allowNull: false,
        defaultValue: 'pending',
      },

      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      businessUnitId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      deletedBy: {
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

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('expenses');
  },
};
