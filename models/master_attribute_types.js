"use strict";
module.exports = (sequelize, DataTypes) => {
  const master_attribute_types = sequelize.define(
    "master_attribute_types",
    {
      name: DataTypes.STRING,
      short_code: DataTypes.STRING,
      filter_position: DataTypes.INTEGER,
      is_filter: DataTypes.BOOLEAN,
      is_active: DataTypes.BOOLEAN,
      is_search: DataTypes.BOOLEAN,
      is_top_menu: DataTypes.BOOLEAN,
    },
    {}
  );
  master_attribute_types.associate = function (models) {
    // associations can be defined here
  };
  return master_attribute_types;
};
