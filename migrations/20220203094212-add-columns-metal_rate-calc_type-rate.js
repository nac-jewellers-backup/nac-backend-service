"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("trans_sku_lists", "metal_rate", {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.addColumn("trans_sku_lists", "calc_type", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: "GROSS-WEIGHT",
      }),
      queryInterface.addColumn("pricing_sku_metals", "rate", {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("trans_sku_lists", "metal_rate"),
      queryInterface.removeColumn("trans_sku_lists", "calc_type"),
      queryInterface.removeColumn("pricing_sku_metals", "rate"),
    ]);
  },
};
