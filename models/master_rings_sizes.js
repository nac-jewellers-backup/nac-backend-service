"use strict";
module.exports = (sequelize, DataTypes) => {
  const master_rings_sizes = sequelize.define(
    "master_rings_sizes",
    {
      name: DataTypes.STRING,
      alias: DataTypes.STRING,
      product_type: DataTypes.STRING,
      size: DataTypes.INTEGER,
      size_value: DataTypes.STRING,
      gender: DataTypes.STRING,
    },
    {}
  );
  master_rings_sizes.associate = function (models) {
    // associations can be defined here
  };
  return master_rings_sizes;
};
