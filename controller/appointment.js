import { sendAppointmentOTP } from "./notify/email_templates";

const models = require("../models");
const { send_sms } = require("./notify/user_notify");

export const send_appoinment_otp = ({
  email,
  mobile,
  name,
  appointment_type_id,
}) => {
  return new Promise((resolve, reject) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    models.appointment
      .create({
        customer_name: name,
        email,
        mobile_country_code: "+91",
        mobile,
        otp,
        appointment_type_id,
      })
      .then(async (res) => {
        try {
          let { otp, id, ...rest } = res;
          await sendAppointmentOTP({ appointment_id: id });
          let status = await send_sms({
            mobile_no: `+91${mobile}`,
            sender_id: "NACJWL",
            msg_txt: `Dear customer, Thank you for registering with NAC Jewellers. Pl use the OTP ${otp} to login.`,
          });
          await models.appointment_communication_log.create({
            appointment_id: id,
            communication_type: `sms`,
            type: `otp`,
            sender_response_id: status.respid,
          });
          resolve({
            status: true,
            message: "OTP triggered successfully",
            data: {
              appointment_id: id,
              ...status,
            },
          });
        } catch (error) {
          reject(error);
        }
      })
      .catch(reject);
  });
};

export const resend_appointment_otp = ({
  email,
  mobile,
  name,
  appointment_id,
}) => {
  return new Promise((resolve, reject) => {
    models.appointment
      .findByPk(appointment_id)
      .then(async (res) => {
        if (res) {
          let { otp, ...rest } = res;
          await sendAppointmentOTP({ appointment_id });
          let status = await send_sms({
            mobile_no: `+91${res.mobile}`,
            sender_id: "NACJWL",
            msg_txt: `Dear customer, Thank you for registering with NAC Jewellers. Pl use the OTP ${otp} to login.`,
          });
          await models.appointment_communication_log.create({
            appointment_id: appointment_id,
            communication_type: `sms`,
            type: `resendotp`,
            sender_response_id: status.respid,
          });
          resolve({
            status: true,
            message: "OTP triggered successfully",
            data: {
              appointment_id: appointment_id,
              ...status,
            },
          });
        } else {
          reject({
            status: error,
            message: `Please check appointment Id or OTP`,
          });
        }
      })
      .catch(reject);
  });
};

export const verify_appointment_otp = ({ appointment_id, otp }) => {
  return new Promise((resolve, reject) => {
    models.appointment
      .findOne({
        where: {
          id: appointment_id,
          otp,
        },
      })
      .then(async (res) => {
        if (res) {
          await models.appointment.update(
            { is_verified: true, is_active: true, status: "Booked" },
            {
              where: {
                id: appointment_id,
              },
            }
          );
          resolve({
            status: true,
            message: `OTP verified succsessfully!`,
          });
        } else {
          reject({
            status: error,
            message: `Please check OTP`,
          });
        }
      })
      .catch(reject);
  });
};
