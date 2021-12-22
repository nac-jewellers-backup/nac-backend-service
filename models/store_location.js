'use strict';
module.exports = (sequelize, DataTypes) => {
  const store_location = sequelize.define('store_location', {
    name: DataTypes.STRING,
    lat: DataTypes.STRING,
    long: DataTypes.STRING,
    address: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {});
  store_location.associate = function(models) {
    // associations can be defined here
  };
  return store_location;
};