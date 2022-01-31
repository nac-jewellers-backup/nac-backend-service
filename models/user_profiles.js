"use strict";
module.exports = (sequelize, DataTypes) => {
  const user_profiles = sequelize.define(
    "user_profiles",
    {
      user_id: DataTypes.UUID,
      first_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      otp: DataTypes.STRING,
      mobile: DataTypes.STRING,
      ismobileverified: DataTypes.BOOLEAN,
      isemailverified: DataTypes.BOOLEAN,
      address: DataTypes.STRING,
      city: DataTypes.STRING,
      country: DataTypes.STRING,
      country_code: DataTypes.STRING,
      salutation: DataTypes.STRING,
      pincode: DataTypes.STRING,
      facebookid: DataTypes.STRING,
      islogin: DataTypes.BOOLEAN,
      lastlogin: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM,
        values: ["Active", "Inactive", "Blocked"],
      },
    },
    {}
  );
  user_profiles.associate = function (models) {
    models.user_profiles.belongsTo(models.users, {
      foreignKey: "user_id",
      targetKey: "id",
    });
    models.user_profiles.hasMany(models.orders, {
      foreignKey: "user_profile_id",
      targetKey: "id",
    });
    // associations can be defined here
    // models.user_profiles.hasMany(models.user_address,{
    //   foreignKey: 'user_profile_id',
    //   targetKey: 'id'
    // });
  };
  return user_profiles;
};
