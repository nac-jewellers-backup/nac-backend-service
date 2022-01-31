"use strict";
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    "users",
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      email: DataTypes.STRING,
      mobile: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM,
        values: ["Active", "Inactive", "Blocked"],
      },
      isverified: DataTypes.BOOLEAN,
    },
    {
      schema: "auth",
    }
  );
  users.associate = function (models) {
    models.users.hasOne(models.user_profiles, {
      foreignKey: "id",
      targetKey: "user_id",
    });
    models.users.hasMany(models.access_tokens, {
      foreignKey: "id",
      targetKey: "user_id",
    });
    models.users.hasMany(models.user_roles, {
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };
  return users;
};
