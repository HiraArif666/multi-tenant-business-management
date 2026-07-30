'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('files', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      originalName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      fileName: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      mimeType: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      folder: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      provider: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'local',
      },

      uploadedBy: {
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
    await queryInterface.dropTable('files');
  },
};