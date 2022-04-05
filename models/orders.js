"use strict";
module.exports = (sequelize, DataTypes) => {
  const orders = sequelize.define(
    "orders",
    {
      cart_id: DataTypes.UUID,
      user_profile_id: DataTypes.UUID,
      payment_mode: DataTypes.STRING,
      payment_status: DataTypes.STRING,
      order_status: DataTypes.STRING,
      awb_number: DataTypes.TEXT,
      comments: DataTypes.TEXT,
      payment_id: DataTypes.INTEGER,
      currency: DataTypes.STRING,
      fx_conversion_rate: DataTypes.DOUBLE,
    },
    {}
  );
  orders.associate = function (models) {
    // associations can be defined here
    models.orders.belongsTo(models.user_profiles, {
      foreignKey: "user_profile_id",
      targetKey: "id",
    });
    models.orders.belongsTo(models.shopping_cart, {
      foreignKey: "cart_id",
      targetKey: "id",
    });
    models.orders.hasMany(models.payment_details, {
      foreignKey: "order_id",
      targetKey: "id",
    });
  };
  return orders;
};
