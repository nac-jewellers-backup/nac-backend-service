"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("daily_metal_prices", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      metal_name: {
        type: Sequelize.STRING,
      },
      display_name: {
        type: Sequelize.STRING,
      },
      display_price: {
        type: Sequelize.DOUBLE,
      },
      is_active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("daily_metal_prices");
  },
};
