"use strict";
module.exports = (sequelize, DataTypes) => {
  const featured_product = sequelize.define(
    "featured_product",
    {
      product_id: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {}
  );
  featured_product.associate = function (models) {
    // associations can be defined here
    models.featured_product.belongsTo(models.product_lists, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
  };
  return featured_product;
};
