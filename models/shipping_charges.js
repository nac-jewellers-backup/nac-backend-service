"use strict";
module.exports = (sequelize, DataTypes) => {
  const shipping_charges = sequelize.define(
    "shipping_charges",
    {
      zone_id: DataTypes.INTEGER,
      name: DataTypes.STRING,
      charge_type: DataTypes.INTEGER,
      range_from: DataTypes.DOUBLE,
      range_to: DataTypes.DOUBLE,
      shipment_charge: DataTypes.DOUBLE,
      product_attributes: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
      },
      is_cart: DataTypes.BOOLEAN,
      display_attributes: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
    },
    {}
  );
  shipping_charges.associate = function (models) {
    // associations can be defined here
    shipping_charges.belongsTo(models.shipping_zones, {
      foreignKey: "zone_id",
      targetKey: "id",
    });
  };
  return shipping_charges;
};
