'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ==========================
    // createdBy
    // ==========================
    await queryInterface.addColumn('users', 'createdBy', {
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
    await queryInterface.addColumn('users', 'updatedBy', {
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
    await queryInterface.addColumn('users', 'deletedBy', {
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
    // deletedAt (Soft Delete)
    // ==========================
    await queryInterface.addColumn('users', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'deletedAt');
    await queryInterface.removeColumn('users', 'deletedBy');
    await queryInterface.removeColumn('users', 'updatedBy');
    await queryInterface.removeColumn('users', 'createdBy');
  },
};