"use strict";
module.exports = (sequelize, DataTypes) => {
  const communication_log = sequelize.define(
    "communication_log",
    {
      order_id: DataTypes.UUID,
      cart_id: DataTypes.UUID,
      type: DataTypes.STRING,
      message_type: DataTypes.STRING,
      sender_response_id: DataTypes.STRING,
    },
    {}
  );
  communication_log.associate = function (models) {
    // associations can be defined here
  };
  return communication_log;
};
