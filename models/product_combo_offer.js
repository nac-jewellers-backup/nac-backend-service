"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class product_combo_offer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      product_combo_offer.belongsTo(models.trans_sku_lists, {
        targetKey: "product_id",
        foreignKey: "main_product",
      });
    }
  }
  product_combo_offer.init(
    {
      main_product: { type: DataTypes.STRING, unique: true },
      offered_products: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        defaultValue: [],
      },
      is_active: DataTypes.BOOLEAN,
      discount_type: {
        type: DataTypes.STRING,
      },
      discount_value: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: "product_combo_offer",
    }
  );
  return product_combo_offer;
};
