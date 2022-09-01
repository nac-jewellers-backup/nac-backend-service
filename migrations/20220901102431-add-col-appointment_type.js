"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("appointments", "metal_type", {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      }),
      queryInterface.addColumn("appointments", "product_category", {
        type: Sequelize.ARRAY(Sequelize.TEXT),
      }),
      queryInterface.addColumn("appointments", "special_requests", {
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("appointments", "is_IT_required", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("appointments", "is_online", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("appointments", "status", {
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("appointments", "comments", {
        type: Sequelize.TEXT,
      }),
      queryInterface.addColumn("appointments", "meeting_link", {
        type: Sequelize.TEXT,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
