"use strict";
module.exports = (sequelize, DataTypes) => {
  const shopping_cart_item = sequelize.define(
    "shopping_cart_item",
    {
      shopping_cart_id: DataTypes.STRING,
      product_sku: DataTypes.STRING,
      qty: DataTypes.INTEGER,
      price: DataTypes.DOUBLE,
      offer_price: DataTypes.DOUBLE,
      is_active: DataTypes.BOOLEAN,
      is_combo_offer: DataTypes.BOOLEAN,
      combo_main_product: DataTypes.STRING,
    },
    {}
  );
  shopping_cart_item.associate = function (models) {
    // associations can be defined here
    models.shopping_cart_item.belongsTo(models.trans_sku_lists, {
      foreignKey: "product_sku",
      targetKey: "generated_sku",
    });
  };
  return shopping_cart_item;
};
