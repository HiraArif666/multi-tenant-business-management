'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      userName: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      userAgent: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      module: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      tableName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      recordId: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      action: {
        type: Sequelize.ENUM(
          'create',
          'update',
          'delete',
        ),
        allowNull: false,
      },

      beforeValues: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      afterValues: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      businessUnitId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('audit_logs', [
      'tableName',
      'recordId',
    ]);

    await queryInterface.addIndex('audit_logs', [
      'businessUnitId',
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};