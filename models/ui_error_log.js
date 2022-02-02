'use strict';
module.exports = (sequelize, DataTypes) => {
  const ui_error_log = sequelize.define('ui_error_log', {
    page: DataTypes.STRING,
    error: DataTypes.STRING,
    message: DataTypes.STRING
  }, {});
  ui_error_log.associate = function(models) {
    // associations can be defined here
  };
  return ui_error_log;
};