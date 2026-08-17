'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('security_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      eventType: {
        type: Sequelize.ENUM(
          'login_success',
          'login_failed',
          'logout',
          'account_locked',
          'password_changed',
          'password_reset',
          'suspicious_activity',
        ),
        allowNull: false,
      },

      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      userAgent: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      businessUnitId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      details: {
        type: Sequelize.JSONB,
        allowNull: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('security_logs', ['username']);
    await queryInterface.addIndex('security_logs', ['ipAddress']);
    await queryInterface.addIndex('security_logs', ['eventType']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('security_logs');
  },
};