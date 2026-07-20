'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ==========================
    // createdBy
    // ==========================
    await queryInterface.addColumn('business_units', 'createdBy', {
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
    await queryInterface.addColumn('business_units', 'updatedBy', {
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
    await queryInterface.addColumn('business_units', 'deletedBy', {
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
    await queryInterface.addColumn('business_units', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('business_units', 'deletedAt');
    await queryInterface.removeColumn('business_units', 'deletedBy');
    await queryInterface.removeColumn('business_units', 'updatedBy');
    await queryInterface.removeColumn('business_units', 'createdBy');
  },
};