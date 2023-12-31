'use strict';
module.exports = (sequelize, DataTypes) => {
  const vouchers = sequelize.define('vouchers', {
    code: DataTypes.STRING,
    voucher_codes:DataTypes.ARRAY(DataTypes.TEXT),
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    uses: DataTypes.INTEGER,
    min_cart_value: DataTypes.DOUBLE,
    max_uses: DataTypes.INTEGER,
    max_uses_user: DataTypes.INTEGER,
    min_cart_qty: DataTypes.INTEGER,
    max_discount: DataTypes.DOUBLE,
    type: DataTypes.INTEGER,
    discount_amount: DataTypes.DOUBLE,
    is_fixed: DataTypes.BOOLEAN,
    starts_at: DataTypes.DATE,
    expires_at: DataTypes.DATE,
    is_active: DataTypes.BOOLEAN,
    isloginneeded: DataTypes.BOOLEAN,
    product_attributes: DataTypes.JSON
  }, {});
  vouchers.associate = function(models) {
    // associations can be defined here
  };
  return vouchers;
};