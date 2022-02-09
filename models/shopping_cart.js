"use strict";
module.exports = (sequelize, DataTypes) => {
  const shopping_cart = sequelize.define(
    "shopping_cart",
    {
      userprofile_id: DataTypes.STRING,
      gross_amount: DataTypes.DOUBLE,
      tax_amount: DataTypes.DOUBLE,
      net_amount: DataTypes.DOUBLE,
      discount: DataTypes.DOUBLE,
      discounted_price: DataTypes.DOUBLE,
      voucher_code: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      status: DataTypes.STRING,
    },
    {}
  );
  shopping_cart.associate = function (models) {
    // associations can be defined here
    models.shopping_cart.belongsTo(models.user_profiles, {
      foreignKey: "userprofile_id",
      targetKey: "id",
    });
    models.shopping_cart.hasMany(models.shopping_cart_item, {
      foreignKey: "shopping_cart_id",
      targetKey: "id",
    });
    models.shopping_cart.hasMany(models.cart_address, {
      foreignKey: "cart_id",
      targetKey: "id",
    });
    models.shopping_cart.hasMany(models.giftwrap, {
      foreignKey: "cart_id",
      targetKey: "id",
    });
  };
  return shopping_cart;
};
