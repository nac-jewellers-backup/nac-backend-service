"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("trans_sku_lists", "item_id", {
        type: Sequelize.STRING,
      }),
      queryInterface.addColumn("trans_sku_lists", "product_record_date", {
        type: Sequelize.DATE,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([]);
  },
};
