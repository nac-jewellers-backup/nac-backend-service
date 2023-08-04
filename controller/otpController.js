const models = require("../models");
const { send_sms } = require("./notify/user_notify");
const uuidv1 = require("uuid/v1");
var jwt = require("jsonwebtoken");

exports.sendOtp = ({ email, mobile_no }) => {
  console.log("kkk")
  return new Promise(async (resolve, reject) => {
    if (!email || !mobile_no || mobile_no.length != 10) {
      return reject({
        statusCode: 403,
        message: "Please check email,mobile_no!",
      });
    }
    let user = await models.users.findOne({
      where: {
        email,
      },
      plain: true,
    });
    let user_id = "";
    if (user) {
      user_id = user.id;
    } else {
      let user = await models.users.create(
        {
          id: uuidv1(),
          email: email,
          status: "Active",
        },
        {
          returning: true,
          plain: true,
        }
      );
      user_id = user.id;
    }

    let otp = Math.floor(100000 + Math.random() * 900000);
    models.user_profiles
      .findOne({
        where: { user_id: user_id, mobile: mobile_no },
      })
      .then(async (profile) => {
        try {
          if (profile) {
            await models.user_profiles.upsert({
              id: profile.id,
              otp,
            });
          } else {
            await models.user_profiles.create({
              id: uuidv1(),
              user_id: user_id,
              email: email,
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
    console.log("jhg")
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
        include: {
          model: models.users,
        },
        where: { mobile: mobile_no, otp },
      })
      .then(async (profile) => {
        if (profile) {
          let { id, email, mobile } = profile;
          await models.user_profiles.upsert({
            id,
            otp: null,
          });
          var token = jwt.sign({ id: profile.user.email }, process.env.SECRET, {
            expiresIn: "1d", // expires in 24 hours
          });
          resolve({
            status: 200,
            message: "OTP verified successfully!",
            accessToken: token,
            userprofile: { id, email, mobile },
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
