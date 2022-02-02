const models = require("../models");
const { send_sms } = require("./notify/user_notify");
const uuidv1 = require("uuid/v1");
var jwt = require("jsonwebtoken");

exports.sendOtp = ({ mobile_no }) => {
  return new Promise(async (resolve, reject) => {
    let otp = Math.floor(100000 + Math.random() * 900000);
    models.user_profiles
      .findOne({
        where: { mobile: mobile_no },
      })
      .then(async (profile) => {
        try {
          if (profile) {
            await models.user_profiles.upsert({
              id: profile.id,
              otp,
            });
          } else {
            const user = await models.users.create({
              id: uuidv1(),
              mobile: mobile_no,
              status: "Active",
            });
            await models.user_profiles.create({
              id: uuidv1(),
              user_id: user.id,
              mobile: mobile_no,
              otp,
              status: "Active",
            });
          }
          await send_sms({
            mobile_no: `+91${mobile_no}`,
            sender_id: "NACJWL",
            msg_txt: `Dear customer, Thank you for registering with NAC Jewellers. Pl use the OTP ${otp} to login.`,
          });
          resolve({
            status: 200,
            message: "OTP triggered successfully!",
          });
        } catch (error) {
          console.error(error);
          reject(error);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

exports.resendOtp = ({ mobile_no }) => {
  return new Promise((resolve, reject) => {
    models.user_profiles
      .findOne({
        attributes: ["otp"],
        where: { mobile: mobile_no, otp: { [models.Sequelize.Op.not]: null } },
      })
      .then(async (profile) => {
        if (profile) {
          await send_sms({
            mobile_no,
            sender_id: "NACJWL",
            msg_txt: `Dear customer, Thank you for registering with NAC Jewellers. Pl use the OTP ${profile.otp} to login.`,
          });
          resolve({
            status: 200,
            message: "OTP triggered successfully!",
          });
        } else {
          reject(new Error(`No such user/otp generated`));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

exports.verifyOtp = ({ mobile_no, otp }) => {
  return new Promise((resolve, reject) => {
    models.user_profiles
      .findOne({
        attributes: ["id", "email", "mobile"],
        where: { mobile: mobile_no, otp },
      })
      .then(async (profile) => {
        if (profile) {
          await models.user_profiles.upsert({
            id: profile.id,
            otp: null,
          });
          var token = jwt.sign({ id: profile.id }, process.env.SECRET, {
            expiresIn: "1d", // expires in 24 hours
          });
          resolve({
            status: 200,
            message: "OTP verified successfully!",
            accessToken: token,
            userprofile: profile,
          });
        } else {
          reject({
            status: 500,
            message: "Invalid otp, Please try again.",
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
