"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class appointment_communication_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  appointment_communication_log.init(
    {
      appointment_id: DataTypes.INTEGER,
      communication_type: DataTypes.STRING,
      type: DataTypes.STRING,
      sender_response_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "appointment_communication_log",
    }
  );
  return appointment_communication_log;
};
