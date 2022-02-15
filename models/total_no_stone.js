"use strict";
module.exports = (sequelize, DataTypes) => {
  const total_no_stone = sequelize.define(
    "total_no_stone",
    {
      product_id: DataTypes.STRING,
      product_sku: DataTypes.STRING,
      type: DataTypes.STRING,
      selling_price: DataTypes.DOUBLE,
      markup_price: DataTypes.DOUBLE,
      discount_price: DataTypes.DOUBLE,
      margin_percentage: DataTypes.DOUBLE,
    },
    {}
  );
  total_no_stone.associate = function (models) {
    // associations can be defined here
  };
  return total_no_stone;
};
