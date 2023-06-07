"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("shopping_cart_items", "is_combo_offer", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn(
      "shopping_cart_items",
      "combo_main_product",
      {
        type: Sequelize.TEXT,
      }
    );
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve(true);
  },
};
