"use strict";
module.exports = (sequelize, DataTypes) => {
  const shipping_zone_countries = sequelize.define(
    "shipping_zone_countries",
    {
      country_id: DataTypes.INTEGER,
      zone_id: DataTypes.INTEGER,
      is_active: DataTypes.BOOLEAN,
    },
    {}
  );
  shipping_zone_countries.associate = function (models) {
    // associations can be defined here
    shipping_zone_countries.belongsTo(models.shipping_zones, {
      foreignKey: "zone_id",
      targetKey: "id",
    });
    shipping_zone_countries.belongsTo(models.master_countries, {
      foreignKey: "country_id",
      targetKey: "id",
    });
  };
  return shipping_zone_countries;
};
