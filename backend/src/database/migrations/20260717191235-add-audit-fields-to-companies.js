'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ==========================
    // createdBy
    // ==========================
    await queryInterface.addColumn('companies', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // ==========================
    // updatedBy
    // ==========================
    await queryInterface.addColumn('companies', 'updatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // ==========================
    // deletedBy
    // ==========================
    await queryInterface.addColumn('companies', 'deletedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // ==========================
    // deletedAt
    // ==========================
    await queryInterface.addColumn('companies', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('companies', 'deletedAt');
    await queryInterface.removeColumn('companies', 'deletedBy');
    await queryInterface.removeColumn('companies', 'updatedBy');
    await queryInterface.removeColumn('companies', 'createdBy');
  },
};