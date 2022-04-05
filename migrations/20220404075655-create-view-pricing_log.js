"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {    
    return queryInterface.sequelize.query(`CREATE OR REPLACE VIEW pricing_log AS    
    select 
    p.id as price_running_history_id,
    ('{'||product_ids||'}')::text[] as requested_products,
    ('{'||completed_products||'}')::text[] as successfully_executed_products,
    array_subtract(('{'||product_ids||'}')::text[],('{'||completed_products||'}')::text[]) failed_products
    from price_running_histories p order by id desc;
    
    comment on view pricing_log is
      E'@foreignKey (price_running_history_id) references price_running_histories (id)|@price_running_history_id price_history';`);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.query(
      `DROP VIEW IF EXISTS pricing_log`
    );
  },
};
