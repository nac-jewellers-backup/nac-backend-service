"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all(
      ["currency", "fx_conversion_rate"].map(async (item) => {
        return await queryInterface.addColumn("orders", item, {
          type: item == "currency" ? Sequelize.STRING : Sequelize.DOUBLE,
          defaultValue: item == "currency" ? "INR" : 1,
          allowNull: false,
        });
      })
    );
  },

  async down(queryInterface, Sequelize) {
    return Promise.all(
      ["currency", "fx_conversion_rate"].map(async (item) => {
        return await queryInterface.removeColumn("orders", item);
      })
    );
  },
};
