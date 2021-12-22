'use strict';
module.exports = (sequelize, DataTypes) => {
  const appointment_type_master = sequelize.define('appointment_type_master', {
    name: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {});
  appointment_type_master.associate = function(models) {
    // associations can be defined here
  };
  return appointment_type_master;
};