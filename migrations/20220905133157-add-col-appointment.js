"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("appointments", "other_location", {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: { schema: "public", tableName: "store_locations" },
          key: "id",
        },
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  },
};
