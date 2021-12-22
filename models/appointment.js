"use strict";
module.exports = (sequelize, DataTypes) => {
  const appointment = sequelize.define(
    "appointment",
    {
      customer_name: DataTypes.STRING,
      email: DataTypes.STRING,
      mobile: DataTypes.STRING,
      appointment_type_id: DataTypes.INTEGER,
      slot_id: DataTypes.UUID,
      location_id: DataTypes.INTEGER,
    },
    {}
  );
  appointment.associate = function (models) {
    // associations can be defined here
  };
  return appointment;
};
