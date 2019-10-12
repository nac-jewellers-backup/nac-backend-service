'use strict';
module.exports = (sequelize, DataTypes) => {
  const shopping_cart_item = sequelize.define('shopping_cart_item', {
    shopping_cart_id: DataTypes.STRING,
    product_sku: DataTypes.STRING,
    qty: DataTypes.INTEGER,
    price: DataTypes.DOUBLE,
    offer_price: DataTypes.DOUBLE,
    is_active: DataTypes.BOOLEAN
  }, {});
  shopping_cart_item.associate = function(models) {
    // associations can be defined here
  };
  return shopping_cart_item;
};