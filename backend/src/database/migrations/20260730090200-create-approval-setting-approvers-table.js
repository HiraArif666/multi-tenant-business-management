'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'approval_setting_approvers',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },

        approvalSettingId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'approval_settings',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },

        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onDelete: 'CASCADE',
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
      },
    );

    await queryInterface.addConstraint(
      'approval_setting_approvers',
      {
        fields: ['approvalSettingId', 'userId'],
        type: 'unique',
        name: 'approval_setting_approvers_unique',
      },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable(
      'approval_setting_approvers',
    );
  },
};