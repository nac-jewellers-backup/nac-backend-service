const models = require("./../models");
const { send_sms } = require("./notify/user_notify");

exports.findAppointmentTimeSlot = ({ appointment_date }) => {
  return new Promise((resolve, reject) => {
    models.appointment_dates
      .findOne({
        attributes: ["id"],
        include: {
          model: models.appointment_date_time_slots,
          attributes: ["id", "start_time", "end_time"],
          required: false,
          where: {
            id: {
              [models.Sequelize.Op.notIn]: models.sequelize.literal(
                `(select slot_id from appointments where slot_id is not null)`
              ),
            },
            is_active: true,
          },
        },
        where: {
          start_date: {
            [models.Sequelize.Op.eq]: appointment_date,
          },
          is_active: true,
        },
      })
      .then((result) => {
        if (!result) {
          return resolve({
            statusCode: 204,
            appointment_slots: [],
            error: true,
            error_message: `No Slots available for this date,Please try calling store!`,
          });
        }
        let { appointment_date_time_slots } = result;
        if (appointment_date_time_slots.length == 0) {
          return resolve({
            statusCode: 204,
            appointment_slots: [],
            error: true,
            error_message: `No Slots available for this date,Please try calling store!`,
          });
        } else {
          return resolve({
            statusCode: 200,
            appointment_slots: appointment_date_time_slots,
            error: false,
            error_message: null,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        reject({ statusCode: 500, ...error });
      });
  });
};

exports.appointment_send_otp = ({ appointment_id }) => {
  return new Promise((resolve, reject) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    models.appointment
      .update(
        { otp },
        { where: { id: appointment_id }, returning: true, raw: true }
      )
      .then(async (result) => {
        let { mobile_country_code, mobile } = result[1][0];
        try {
          await send_sms({
            mobile_no: `${mobile_country_code}${mobile}`,
            sender_id: "NACJWL",
            msg_txt: `Dear customer, Thank you for registering with NAC Jewellers. Pl use the OTP ${otp} to login.`,
          });
          resolve({
            statusCode: 200,
            message: "OTP triggered successfully!",
          });
        } catch (error) {
          reject({
            statusCode: 500,
            ...error,
          });
        }
      })
      .catch(reject);
  });
};

exports.appointment_verify_otp = ({ appointment_id, mobile_no, otp }) => {
  return new Promise((resolve, reject) => {
    models.appointment
      .update(
        { otp: null, is_verified: true },
        {
          where: { id: appointment_id, mobile: mobile_no, otp },
          returning: true,
        }
      )
      .then((result) => {        
        if (result[0] == 1) {
          resolve({
            statusCode: 200,
            message: `OTP verified successfully!`,
          });
        } else {
          reject({
            statusCode: 403,
            message: `Invalid OTP`,
          });
        }
      })
      .catch(reject);
  });
};
