"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all(
      ["fx_conversion_rate"].map(async (item) => {
        return await queryInterface.addColumn("master_countries", item, {
          type: Sequelize.DOUBLE,
          allowNull: true,
        });
      })
    );
  },

  async down(queryInterface, Sequelize) {
    return Promise.all(
      ["fx_conversion_rate"].map(async (item) => {
        return await queryInterface.removeColumn("master_countries", item);
      })
    );
  },
};
