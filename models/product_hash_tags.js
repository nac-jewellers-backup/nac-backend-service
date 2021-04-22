"use strict";
module.exports = (sequelize, DataTypes) => {
  const product_hash_tags = sequelize.define(
    "product_hash_tags",
    {
      hash_tag: DataTypes.STRING,
      product_id: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
    },
    {}
  );
  product_hash_tags.associate = function (models) {
    // associations can be defined here
    models.product_hash_tags.belongsTo(models.master_hash_tags, {
      foreignKey: "hash_tag",
      targetKey: "name",
    });
  };
  return product_hash_tags;
};
