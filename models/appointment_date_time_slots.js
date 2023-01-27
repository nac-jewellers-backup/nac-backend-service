"use strict";
module.exports = (sequelize, DataTypes) => {
  const appointment_date_time_slots = sequelize.define(
    "appointment_date_time_slots",
    {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      appointment_date_id: {
        type: DataTypes.UUID,
      },
      appointment_type_id: {
        type: DataTypes.INTEGER,
      },
      start_time: {
        type: DataTypes.TIME,
      },
      end_time: {
        type: DataTypes.TIME,
      },
      start_date_time: {
        type: DataTypes.DATE,
      },
      end_date_time: {
        type: DataTypes.DATE,
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
  appointment_date_time_slots.associate = function (models) {
    // associations can be defined here
    appointment_date_time_slots.belongsTo(models.user_profiles, {
      foreignKey: "created_by",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    appointment_date_time_slots.belongsTo(models.user_profiles, {
      foreignKey: "updated_by",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    appointment_date_time_slots.belongsTo(models.appointment_dates, {
      foreignKey: "appointment_date_id",
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  };
  return appointment_date_time_slots;
};
