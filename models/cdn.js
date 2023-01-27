"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class cdn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  cdn.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true },
      page: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
      data: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "cdn",
    }
  );
  return cdn;
};
