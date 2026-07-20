'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: پہلے nullable column add کریں
    await queryInterface.addColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Step 2: Existing users کو unique username دیں
    await queryInterface.sequelize.query(
      `UPDATE users SET username = 'user_' || id WHERE username IS NULL`
    );

    // Step 3: اب NOT NULL اور UNIQUE بنائیں
    await queryInterface.changeColumn('users', 'username', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'username');
  }
};