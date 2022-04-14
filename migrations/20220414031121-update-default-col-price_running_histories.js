"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize
      .query(`ALTER TABLE IF EXISTS public.price_running_histories
              ALTER COLUMN completed_product_count SET DEFAULT 0;

              ALTER TABLE IF EXISTS public.price_running_histories
              ALTER COLUMN completed_products SET DEFAULT '';`);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(`SELECT 1;`);
  },
};
