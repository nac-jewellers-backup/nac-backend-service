"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("appointments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      customer_name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      mobile_country_code: {
        type: Sequelize.STRING,
        defaultValue: "+91",
      },
      mobile: {
        type: Sequelize.STRING,
      },
      otp: {
        type: Sequelize.STRING,
      },
      is_verified: { type: Sequelize.BOOLEAN },
      appointment_type_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: { schema: "public", tableName: "appointment_type_masters" },
          key: "id",
        },
      },
      slot_id: {
        type: Sequelize.UUID,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: { schema: "public", tableName: "appointment_date_time_slots" },
          key: "id",
        },
      },
      location_id: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: { schema: "public", tableName: "store_locations" },
          key: "id",
        },
      },
      is_active: { type: Sequelize.BOOLEAN },
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
    return queryInterface.dropTable("appointments");
  },
};
