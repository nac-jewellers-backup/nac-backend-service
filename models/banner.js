'use strict';
module.exports = (sequelize, DataTypes) => {
  const banner = sequelize.define('banner', {
    url: DataTypes.STRING
  }, {});
  banner.associate = function(models) {
    // associations can be defined here
  };
  return banner;
};