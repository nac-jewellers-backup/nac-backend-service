"use strict";
module.exports = (sequelize, DataTypes) => {
  const product_gemstones = sequelize.define(
    "product_gemstones",
    {
      gemstone_type: DataTypes.INTEGER,
      gemstone_shape: DataTypes.STRING,
      gemstone_setting: DataTypes.STRING,
      gemstone_size: DataTypes.STRING,
      stone_count: DataTypes.INTEGER,
      stone_weight: DataTypes.DOUBLE,
      product_sku: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      item_name: DataTypes.STRING,
      sub_item_name: DataTypes.STRING,
      description: DataTypes.STRING,
      stone_amount: DataTypes.DOUBLE,
      stone_rate: DataTypes.DOUBLE,
    },
    { timestamps: false }
  );
  product_gemstones.associate = function (models) {
    // associations can be defined here
    models.product_gemstones.belongsTo(models.master_gemstones_types, {
      foreignKey: "gemstone_type",
      targetKey: "name",
    });
  };
  return product_gemstones;
};
