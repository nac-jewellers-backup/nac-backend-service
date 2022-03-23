"use strict";
module.exports = (sequelize, DataTypes) => {
  const appointment = sequelize.define(
    "appointment",
    {
      customer_name: DataTypes.STRING,
      email: DataTypes.STRING,
      mobile_country_code: DataTypes.STRING,
      mobile: DataTypes.STRING,
      otp: DataTypes.STRING,
      is_verified: DataTypes.BOOLEAN,
      appointment_type_id: DataTypes.INTEGER,
      slot_id: DataTypes.UUID,
      location_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {}
  );
  appointment.associate = function (models) {
    // associations can be defined here
    appointment.belongsTo(models.appointment_date_time_slots, {
      foreignKey: "slot_id",
      targetKey: "id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  };
  return appointment;
};
