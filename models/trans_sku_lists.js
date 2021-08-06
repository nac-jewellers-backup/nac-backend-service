"use strict";
const uuidv1 = require("uuid/v1");

module.exports = (sequelize, DataTypes) => {
  const trans_sku_lists = sequelize.define(
    "trans_sku_lists",
    {
      purity: {
        type: DataTypes.STRING,
      },
      metal_color: {
        type: DataTypes.STRING,
      },
      product_id: {
        type: DataTypes.STRING,
      },
      isdefault: {
        type: DataTypes.BOOLEAN,
      },
      diamond_type: {
        type: DataTypes.STRING,
      },
      generated_sku: {
        type: DataTypes.STRING,
      },
      sku_size: {
        type: DataTypes.STRING,
      },
      sku_weight: {
        type: DataTypes.DOUBLE,
      },
      gross_weight: {
        type: DataTypes.DOUBLE,
      },
      net_weight: {
        type: DataTypes.DOUBLE,
      },
      cost_price: {
        type: DataTypes.DOUBLE,
      },
      selling_price: {
        type: DataTypes.DOUBLE,
      },
      markup_price: {
        type: DataTypes.DOUBLE,
      },
      cost_price_tax: {
        type: DataTypes.DOUBLE,
      },
      selling_price_tax: {
        type: DataTypes.DOUBLE,
      },
      markup_price_tax: {
        type: DataTypes.DOUBLE,
      },
      discount_price_tax: {
        type: DataTypes.DOUBLE,
      },
      discount_price: {
        type: DataTypes.DOUBLE,
      },
      discount: {
        type: DataTypes.DOUBLE,
      },
      sku_url: {
        type: DataTypes.STRING,
      },
      sku_id: {
        type: DataTypes.STRING,
      },
      vendor_delivery_time: {
        type: DataTypes.INTEGER,
      },
      discount_desc: {
        type: DataTypes.TEXT,
      },
      attributes: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
      },
      is_ready_to_ship: {
        type: DataTypes.BOOLEAN,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
      },
      is_soldout: {
        type: DataTypes.BOOLEAN,
      },
      margin_on_sale_percentage: {
        type: DataTypes.DOUBLE,
      },
      min_order_qty: {
        type: DataTypes.INTEGER,
      },
      max_order_qty: {
        type: DataTypes.INTEGER,
      },
      item_id: {
        type: DataTypes.TEXT,
      },
      product_record_date: {
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  trans_sku_lists.associate = function (models) {
    // associations can be defined here
    //models.trans_sku_lists.hasMany(models.product_materials)
    // models.trans_sku_lists.hasMany(models.product_materials,{
    //   foreignKey: 'product_sku',
    //   targetKey: 'generated_sku'
    // });
    models.trans_sku_lists.belongsTo(models.trans_sku_descriptions, {
      foreignKey: "generated_sku",
      targetKey: "sku_id",
    });
    models.trans_sku_lists.hasMany(models.pricing_sku_materials, {
      foreignKey: "product_sku",
      targetKey: "generated_sku",
    });
    models.trans_sku_lists.hasMany(models.pricing_sku_metals, {
      foreignKey: "product_sku",
      targetKey: "generated_sku",
    });
    models.trans_sku_lists.belongsTo(models.product_lists, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });

    models.trans_sku_lists.belongsTo(models.master_metals_purities, {
      foreignKey: "purity",
      targetKey: "name",
    });
    models.trans_sku_lists.hasMany(models.inventory, {
      foreignKey: "generated_sku",
      sourceKey: "generated_sku",
    });
  };
  return trans_sku_lists;
};
