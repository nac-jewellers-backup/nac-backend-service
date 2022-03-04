"use strict";
module.exports = (sequelize, DataTypes) => {
  const master_countries = sequelize.define(
    "master_countries",
    {
      iso: DataTypes.STRING,
      name: DataTypes.STRING,
      nicename: DataTypes.STRING,
      iso3: DataTypes.STRING,
      numcode: DataTypes.STRING,
      phonecode: DataTypes.STRING,
      currency: DataTypes.STRING,
      currency_alias: DataTypes.STRING,
      currency_symbol: DataTypes.STRING,
      fx_conversion_rate: DataTypes.DOUBLE,
      is_active: DataTypes.BOOLEAN,
    },
    {}
  );
  master_countries.associate = function (models) {
    // associations can be defined here
    master_countries.belongsToMany(models.shipping_zones, {
      through: {
        model: models.shipping_zone_countries,
      },
      foreignKey: "country_id",
    });
  };
  return master_countries;
};
