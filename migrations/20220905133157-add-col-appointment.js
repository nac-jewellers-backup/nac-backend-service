"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("appointments", "are_more_members_joining", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  },
};
