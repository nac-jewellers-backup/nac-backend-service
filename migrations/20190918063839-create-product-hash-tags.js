"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("product_hash_tags", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      hash_tag: {
        type: Sequelize.STRING,
        references: {
          model: "master_hash_tags", // name of Source model
          key: "name",
        },
      },
      is_active: {
        type: Sequelize.BOOLEAN,
      },
      product_id: {
        type: Sequelize.STRING,
        references: {
          model: "product_lists", // name of Source model
          key: "product_id",
        },
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
    return queryInterface.dropTable("product_styles");
  },
};
