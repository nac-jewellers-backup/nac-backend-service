"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("trans_sku_lists", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      purity: {
        type: Sequelize.STRING,
      },
      metal_color: {
        type: Sequelize.STRING,
      },
      sku_size: {
        type: Sequelize.STRING,
      },
      product_id: {
        type: Sequelize.STRING,
        references: {
          model: "product_lists", // name of Source model
          key: "product_id",
        },
      },
      isfeatured: {
        type: Sequelize.BOOLEAN,
      },
      isdefault: {
        type: Sequelize.BOOLEAN,
      },
      diamond_type: {
        type: Sequelize.STRING,
      },
      generated_sku: {
        type: Sequelize.STRING,
        unique: true,
      },
      sku_weight: {
        type: Sequelize.DOUBLE,
      },
      cost_price: {
        type: Sequelize.DOUBLE,
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

      cost_price_tax: {
        type: Sequelize.DOUBLE,
      },
      selling_price_tax: {
        type: Sequelize.DOUBLE,
      },
      markup_price_tax: {
        type: Sequelize.DOUBLE,
      },
      discount_price_tax: {
        type: Sequelize.DOUBLE,
      },
      margin_on_sale_percentage: {
        type: Sequelize.DOUBLE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("trans_sku_lists");
  },
};
