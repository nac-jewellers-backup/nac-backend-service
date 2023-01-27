"use strict";
module.exports = (sequelize, DataTypes) => {
  const appointment_dates = sequelize.define(
    "appointment_dates",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      start_date: {
        type: DataTypes.DATEONLY,
      },
      start_date_time: {
        type: DataTypes.DATE,
      },
      end_date: {
        type: DataTypes.DATEONLY,
      },
      end_date_time: {
        type: DataTypes.DATE,
      },
      is_unavailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_by: {
        type: DataTypes.UUID,
      },
      updated_by: {
        type: DataTypes.UUID,
      },
    },
    {
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  appointment_dates.associate = function (models) {
    // associations can be defined here
    appointment_dates.belongsTo(models.user_profiles, {
      foreignKey: "created_by",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    appointment_dates.belongsTo(models.user_profiles, {
      foreignKey: "updated_by",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    appointment_dates.hasMany(models.appointment_date_time_slots, {
      foreignKey: "appointment_date_id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  };
  return appointment_dates;
};
