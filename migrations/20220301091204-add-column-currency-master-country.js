"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all(
      ["currency", "currency_alias", "currency_symbol"].map(async (item) => {
        return await queryInterface.addColumn("master_countries", item, {
          type: Sequelize.STRING,
          allowNull: true,
        });
      })
    );
  },

  async down(queryInterface, Sequelize) {
    return Promise.all(
      ["currency", "currency_alias", "currency_symbol"].map(async (item) => {
        return await queryInterface.removeColumn("master_countries", item);
      })
    );
  },
};
