"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all(
      ["shipping_charge"].map(async (item) => {
        return await queryInterface.addColumn("shopping_carts", item, {
          type: Sequelize.DOUBLE,
          allowNull: false,
          defaultValue: 0,
        });
      })
    );
  },

  async down(queryInterface, Sequelize) {
    return Promise.all(
      ["shipping_charge"].map(async (item) => {
        return await queryInterface.removeColumn("shopping_carts", item);
      })
    );
  },
};
