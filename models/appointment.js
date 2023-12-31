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
      metal_type: DataTypes.ARRAY(DataTypes.STRING),
      product_category: DataTypes.ARRAY(DataTypes.STRING),
      special_requests: DataTypes.STRING,
      is_IT_required: DataTypes.BOOLEAN,
      is_online: DataTypes.BOOLEAN,
      status: DataTypes.STRING,
      comments: DataTypes.STRING,
      meeting_link: DataTypes.STRING,
      are_more_members_joining: DataTypes.BOOLEAN,
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
    appointment.belongsTo(models.appointment_type_master, {
      foreignKey: "appointment_type_id",
      targetKey: "id",
    });
  };
  return appointment;
};
