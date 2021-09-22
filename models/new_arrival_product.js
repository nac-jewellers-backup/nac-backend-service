"use strict";
module.exports = (sequelize, DataTypes) => {
  const new_arrival_products = sequelize.define(
    "new_arrival_products",
    {
      product_id: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {}
  );
  new_arrival_products.associate = function (models) {
    // associations can be defined here
    models.new_arrival_products.belongsTo(models.product_lists, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
  };
  return new_arrival_products;
};
