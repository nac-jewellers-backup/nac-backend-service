"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("temp_price_lists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_id: {
        type: Sequelize.STRING,
        references: {
          model: "product_lists", // name of Source model
          key: "product_id",
        },
      },
      generated_sku: {
        type: Sequelize.STRING,
        unique: true,
        references: {
          model: "trans_sku_lists", // name of Source model
          key: "generated_sku",
        },
      },
      pricing: {
        type: Sequelize.JSON,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("temp_price_lists");
  },
};
