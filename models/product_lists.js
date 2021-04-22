"use strict";
const uuidv1 = require("uuid/v1");

module.exports = (sequelize, DataTypes) => {
  const product_lists = sequelize.define(
    "product_lists",
    {
      id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: uuidv1(),
      },
      product_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      vendor_code: DataTypes.STRING,
      product_name: DataTypes.STRING,
      product_category: DataTypes.STRING,
      product_series: DataTypes.INTEGER,
      isactive: DataTypes.BOOLEAN,
      default_size: DataTypes.DOUBLE,
      default_weight: DataTypes.DOUBLE,
      gender: DataTypes.STRING,
      height: DataTypes.DOUBLE,
      width: DataTypes.DOUBLE,
      length: DataTypes.DOUBLE,
      product_type: DataTypes.STRING,
      earring_backing: DataTypes.STRING,
      product_vendor_code: DataTypes.STRING,
      size_varient: DataTypes.STRING,
      colour_varient: DataTypes.STRING,
      selling_qty: DataTypes.INTEGER,
      isreorderable: DataTypes.BOOLEAN,
      hsn_number: DataTypes.STRING,
      attributes: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
      },
    },
    {}
  );
  product_lists.associate = function (models) {
    // associations can be defined here
    // models.trans_sku_lists.hasMany(models.product_diamonds,{
    //   foreignKey: 'product_sku',
    //   targetKey: 'generated_sku'
    // });
    models.product_lists.hasMany(models.product_materials, {
      foreignKey: "product_sku",
      targetKey: "product_id",
    });

    models.product_lists.hasMany(models.product_materials, {
      foreignKey: "product_sku",
      targetKey: "product_id",
      as: "productMaterialsByProductSku",
    });
    models.product_lists.hasMany(models.product_metalcolours, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });

    models.product_lists.hasMany(models.product_diamonds, {
      foreignKey: "product_sku",
      targetKey: "product_id",
      as: "productDiamondsByProductSku",
    });

    models.product_lists.hasMany(models.product_diamonds, {
      foreignKey: "product_sku",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_gemstones, {
      foreignKey: "product_sku",
      targetKey: "product_id",
    });

    models.product_lists.hasMany(models.product_occassions, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });

    models.product_lists.hasMany(models.trans_sku_lists, {
      foreignKey: "product_id",
      targetKey: "product_id",
      as: "transSkuListsByProductId",
    });
    models.product_lists.hasMany(models.trans_sku_lists, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_styles, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_themes, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_purities, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_collections, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_images, {
      foreignKey: "product_id",
      targetKey: "product_id",
      as: "productImagesByProductId",
    });
    models.product_lists.hasMany(models.product_images, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_stonecolor, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_stonecount, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_gender, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_by_design, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.hasMany(models.product_by_weight, {
      foreignKey: "product_id",
      targetKey: "product_id",
    });
    models.product_lists.belongsTo(models.master_product_categories, {
      foreignKey: "product_category",
      targetKey: "name",
    });
    models.product_lists.belongsTo(models.master_product_types, {
      foreignKey: "product_type",
      targetKey: "name",
    });
  };
  return product_lists;
};
