"use strict";
module.exports = (sequelize, DataTypes) => {
  const pricing_sku_materials = sequelize.define(
    "pricing_sku_materials",
    {
      material_name: DataTypes.STRING,
      product_id: DataTypes.STRING,
      product_sku: DataTypes.STRING,
      cost_price: DataTypes.DOUBLE,
      component: DataTypes.STRING,
      selling_price: DataTypes.DOUBLE,
      markup: DataTypes.DOUBLE,
      discount_price: DataTypes.DOUBLE,
      margin_percentage: DataTypes.DOUBLE,
    },
    {}
  );
  pricing_sku_materials.associate = function (models) {
    // associations can be defined here
    pricing_sku_materials.belongsTo(models.trans_sku_lists, {
      foreignKey: "product_sku",
      targetKey: "generated_sku",
    });
  };
  return pricing_sku_materials;
};
