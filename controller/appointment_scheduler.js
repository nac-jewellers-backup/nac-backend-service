import { async } from "crypto-random-string";
import moment from "moment";
const models = require("./../models");
const { send_sms } = require("./notify/user_notify");
const {
  sendAppointmentOTP,
  sendAppointmentConfirmation,
} = require("./notify/email_templates");
const { groupBy } = require("lodash");

exports.findAppointmentTimeSlot = ({
  appointment_date,
  appointment_type_id,
}) => {
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
            appointment_type_id,
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
          await sendAppointmentOTP({ appointment_id });
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
      .then(async (result) => {
        if (result[0] == 1) {
          await sendAppointmentConfirmation({ appointment_id });
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

const DATE_FORMATS = ["DD-MM-YYYY", "YYYY-MM-DD", "DD/MM/YYYY", "YYYY/MM/DD"];

let APPOINTMENT_MASTERS = {};

const loadAppointmentMasters = async () => {
  let result = await models.appointment_type_master.findAll();
  APPOINTMENT_MASTERS = result.reduce((preV, curV) => {
    preV[curV.name.toLowerCase()] = curV.id;
    return preV;
  }, {});
};

const checkAppoitmentDate = ({ start_date, end_date }) => {
  return new Promise((resolve, reject) => {
    models.appointment_dates
      .findOne({
        where: { start_date, end_date },
      })
      .then(async (result) => {
        if (result) {
          resolve(result);
        } else {
          resolve(
            await models.appointment_dates.create({
              start_date,
              end_date,
              start_date_time: start_date,
              end_date_time: end_date,
              is_active: true,
            })
          );
        }
      })
      .catch(reject);
  });
};

const upsertAppointmentDateTimeSlot = ({
  start_time,
  end_time,
  appointment_type_id,
  appointment_date_id,
}) => {
  return new Promise((resolve, reject) => {
    models.appointment_date_time_slots
      .findOne({
        where: {
          start_time,
          end_time,
          appointment_type_id,
          appointment_date_id,
        },
      })
      .then(async (result) => {
        if (result) {
          resolve(result);
        } else {
          resolve(
            await models.appointment_date_time_slots.create({
              start_time,
              end_time,
              appointment_type_id,
              appointment_date_id,
              is_active: true,
            })
          );
        }
      })
      .catch(reject);
  });
};

exports.uploadSchedulerData = async (data) => {
  await loadAppointmentMasters();

  data = data.map((item) => {
    return {
      ...item,
      appointment_type_id:
        APPOINTMENT_MASTERS[item?.appointment_type.toLowerCase()],
    };
  });

  let groupByStartDate = groupBy(data, (i) => {
    return `${moment(i.start_date, DATE_FORMATS).format("YYYY-MM-DD")},${moment(
      i.end_date,
      DATE_FORMATS
    ).format("YYYY-MM-DD")}`;
  });

  for (const key in groupByStartDate) {
    let elements = groupByStartDate[key];
    let [start_date, end_date] = key.split(",");
    let appointment_date = await checkAppoitmentDate({ start_date, end_date });
    await Promise.all(
      elements.map(async (item) => {
        try {
          await upsertAppointmentDateTimeSlot({
            ...item,
            appointment_date_id: appointment_date?.id,
          });
        } catch (error) {
          console.log(error);
        }
      })
    );
  }

  return { statusCode: 200, message: "Completed successfully!" };
};
