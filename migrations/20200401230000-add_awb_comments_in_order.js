'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
        queryInterface.addColumn(
          'orders',
          'awb_number',
          {
            type: Sequelize.TEXT,
            allowNull: true
          }
        ),
        queryInterface.addColumn(
          'orders',
          'comments',
          {
            type: Sequelize.TEXT,
            allowNull: true
          }
        ),
      ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
