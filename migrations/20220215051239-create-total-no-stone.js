"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("total_no_stones", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.fn("uuid_generate_v4"),
      },
      product_id: {
        type: Sequelize.STRING,
      },
      product_sku: {
        type: Sequelize.STRING,
        references: {
          model: "trans_sku_lists", // name of Source model
          key: "generated_sku",
        },
      },
      type: {
        type: Sequelize.STRING,
      },
      selling_price: {
        type: Sequelize.DOUBLE,
      },
      markup_price: {
        type: Sequelize.DOUBLE,
      },
      discount_price: {
        type: Sequelize.DOUBLE,
      },
      margin_percentage: {
        type: Sequelize.DOUBLE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),        
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("total_no_stones");
  },
};
