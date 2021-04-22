"use strict";
module.exports = (sequelize, DataTypes) => {
  const master_hash_tags = sequelize.define(
    "master_hash_tags",
    {
      name: DataTypes.STRING,
      alias: DataTypes.STRING,
      alias_id: DataTypes.BIGINT,
      is_filter: DataTypes.BOOLEAN,
      is_active: DataTypes.BOOLEAN,
      filter_order: DataTypes.INTEGER,
    },
    {}
  );
  master_hash_tags.associate = function (models) {
    // associations can be defined here
  };
  return master_hash_tags;
};
