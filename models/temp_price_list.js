"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class temp_price_list extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  temp_price_list.init(
    {
      product_id: DataTypes.TEXT,
      generated_sku: DataTypes.TEXT,
      pricing: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "temp_price_list",
    }
  );
  return temp_price_list;
};
