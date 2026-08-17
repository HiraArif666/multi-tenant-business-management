'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('job_schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      reportId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      // Array of user IDs, e.g. [3, 7, 12]
      recipientUserIds: {
        type: Sequelize.JSONB,
        allowNull: false,
      },

      frequency: {
        type: Sequelize.ENUM(
          'daily',
          'weekly',
          'monthly',
        ),
        allowNull: false,
      },

      // "HH:mm", 24-hour, server local time
      time: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      // 0-6 (Sun-Sat) — only used when frequency = weekly
      dayOfWeek: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      // 1-31 — only used when frequency = monthly
      dayOfMonth: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      lastRunAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      nextRunAt: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('job_schedules', [
      'nextRunAt',
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('job_schedules');
  },
};