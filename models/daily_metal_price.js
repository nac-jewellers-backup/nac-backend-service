"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class daily_metal_price extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  daily_metal_price.init(
    {
      metal_name: DataTypes.STRING,
      display_name: DataTypes.STRING,
      display_price: DataTypes.DOUBLE,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "daily_metal_price",
    }
  );
  return daily_metal_price;
};
