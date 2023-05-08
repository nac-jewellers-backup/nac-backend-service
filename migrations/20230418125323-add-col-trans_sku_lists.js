"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("trans_sku_lists", "is_orderable", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
    await queryInterface.addColumn("trans_sku_lists", "order_shipping_days", {
      type: Sequelize.INTEGER,
      defaultValue: 55,
    });
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve(true);
  },
};
