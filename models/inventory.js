"use strict";
module.exports = (sequelize, DataTypes) => {
  const inventory = sequelize.define(
    "inventory",
    {
      generated_sku: DataTypes.STRING,
      number_of_items: DataTypes.INTEGER,
      warehouse_id: DataTypes.INTEGER,
    },
    {}
  );
  inventory.associate = function (models) {
    // associations can be defined here
    inventory.belongsTo(models.trans_sku_lists, {
      foreignKey: "generated_sku",
      sourceKey: "generated_sku",
    });
    inventory.belongsTo(models.warehouse, {
      foreignKey: "warehouse_id",
    });
  };
  return inventory;
};
