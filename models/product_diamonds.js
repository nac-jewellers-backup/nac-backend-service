"use strict";
module.exports = (sequelize, DataTypes) => {
  const product_diamonds = sequelize.define(
    "product_diamonds",
    {
      diamond_colour: DataTypes.STRING,
      diamond_clarity: DataTypes.STRING,
      diamond_settings: DataTypes.STRING,
      diamond_type: DataTypes.STRING,
      diamond_shape: DataTypes.STRING,
      stone_count: DataTypes.INTEGER,
      stone_weight: DataTypes.DOUBLE,
      product_sku: DataTypes.STRING,
      item_name: DataTypes.STRING,
      sub_item_name: DataTypes.STRING,
      description: DataTypes.STRING,
      stone_amount: DataTypes.DOUBLE,
      stone_rate: DataTypes.DOUBLE,
    },
    { timestamps: false }
  );
  product_diamonds.associate = function (models) {
    // associations can be defined here
  };
  return product_diamonds;
};
