"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("appointment_communication_logs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      appointment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "appointments", // name of Source model
          key: "id",
        },
      },
      communication_type: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      sender_response_id: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("appointment_communication_logs");
  },
};
