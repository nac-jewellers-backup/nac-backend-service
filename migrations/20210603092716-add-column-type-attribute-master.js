"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Attribute_masters", "type", {
        type: Sequelize.STRING,
        references: {
          model: "master_attribute_types", // name of Source model
          key: "name",
        },
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Attribute_masters", "type"),
    ]);
  },
};
