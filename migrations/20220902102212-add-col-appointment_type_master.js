"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn(`appointment_date_time_slots`, "user_id"),
      queryInterface.removeColumn(`appointment_dates`, "user_id"),
      queryInterface.addColumn(
        "appointment_date_time_slots",
        "appointment_type_id",
        {
          type: Sequelize.INTEGER,
          references: {
            model: "appointment_type_masters", // name of Source model
            key: "id",
          },
        }
      ),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.resolve();
  },
};
