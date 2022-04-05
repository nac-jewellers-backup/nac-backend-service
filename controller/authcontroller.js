import crypto from "crypto-random-string";
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const models = require("./../models");
import "dotenv/config";
const Op = require("sequelize").Op;
const uuidv1 = require("uuid/v1");
const emailTemp = require("./notify/Emailtemplate");
import { sendMail } from "./notify/user_notify";

exports.signin = (req, res) => {
  models.users
    .findOne({
      where: {
        email: req.body.email,
      },
      include: [
        {
          model: models.user_roles,
          attributes: ["id"],
        },
      ],
    })
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.status(404).send({ message: "User Does Not Exist" });
      }
      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!passwordIsValid) {
        return res.status(401).send({
          auth: false,
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      var token = jwt.sign({ id: user.email }, process.env.SECRET, {
        expiresIn: "1d", // expires in 24 hours
      });
      models.user_profiles
        .findOne({
          where: { email: user.email },
          attributes: ["id", "email"],
        })
        .then((userprofile) => {
          res.status(200).send({ accessToken: token, userprofile });
        })
        .catch((err) => {
          res.status(500).json({
            description: "Can not access User Page",
            error: err,
          });
        });
    })
    .catch((err) => {
      res.status(500).send("Error -> " + err);
    });
};

exports.fbsignin = async (req, res) => {
  const { fbid } = req.body;
  models.user_profiles
    .findOne({
      where: {
        facebookid: fbid,
      },
    })
    .then((user) => {
      console.log(user);
      if (!user) {
        return res.status(404).send({ message: "User Does Not Exist" });
      }

      var token = jwt.sign({ id: user.email }, process.env.SECRET, {
        expiresIn: "1d", // expires in 24 hours
      });
      res.status(200).send({ accessToken: token, user });
    })
    .catch((err) => {
      res.status(500).send("Error -> " + err);
    });
};
exports.fbsignup = async (req, res) => {
  const { fbid, firstname, lastname, email, salutation } = req.body;
  let useraccount = await models.user_profiles.findOne({
    where: {
      facebookid: fbid,
    },
  });

  if (useraccount) {
    res.status(409).send({ message: "User Already Exist" });
  } else {
    let user_profile = await models.user_profiles.create({
      id: uuidv1(),
      user_id: null,
      email: email,
      facebookid: fbid,
      first_name: firstname,
      last_name: lastname,
      salutation: salutation,
      isemailverified: false,
    });
    var token = jwt.sign({ id: email }, process.env.SECRET, {
      expiresIn: "1d", // expires in 24 hours
    });
    var emilreceipiants = [
      { to: email, subject: "You have successfully registered!" },
    ];

    // sendMail(emilreceipiants, emailTemp.getName(firstname));

    res.send(200, {
      accessToken: token,
      user_profile,
      user_profile_id: user_profile.id,
    });
  }
};
exports.signup = (req, res) => {
  let { username, password, email, firstname, lastname, roles, salutation } =
    req.body;
  var uservalue = {
    id: uuidv1(),
    username: username,
    password: bcrypt.hashSync(password, 8),
    email: email,
  };

  models.users
    .findOrCreate({
      where: { email },
      defaults: uservalue,
    })
    .spread(async (user, created) => {
      if (!created) {
        res.send(409, { message: "Email ID Already Exist", user });
      } else {
        let user_roles = await models.master_roles.findAll({
          where: {
            role_name: {
              [Op.in]: roles,
            },
          },
        });
        var userroles = [];
        user_roles.forEach((role) => {
          const roleobj = {
            id: uuidv1(),
            user_id: user.id,
            role_name: role.role_name,
            role_id: role.id,
          };
          userroles.push(roleobj);
        });
        console.log(JSON.stringify(userroles));
        await models.user_roles.bulkCreate(userroles, {
          individualHooks: true,
        });
        var verifytoken = crypto({ length: 16 });

        await models.access_tokens.create({
          id: uuidv1(),
          user_id: user.id,
          token: verifytoken,
        });
        let user_profile = await models.user_profiles.create({
          id: uuidv1(),
          user_id: user.id,
          email: email,
          first_name: firstname,
          last_name: lastname,
          salutation: salutation,
          isemailverified: false,
        });
        var token = jwt.sign({ id: user.email }, process.env.SECRET, {
          expiresIn: "1d", // expires in 24 hours
        });
        var emilreceipiants = [
          { to: email, subject: "You have successfully registered!" },
        ];

        // sendMail(emilreceipiants, emailTemp.getName(firstname));

        res.send(200, {
          accessToken: token,
          user,
          user_profile_id: user_profile.id,
        });
      }
    });
};
exports.changepassword = (req, res) => {
  const { oldpassword, newpassword } = req.body;
  models.users
    .findOne({
      where: {
        email: req.userName,
      },
    })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Does Not Exist" });
      }
      var passwordIsValid = bcrypt.compareSync(oldpassword, user.password);
      if (!passwordIsValid) {
        return res.status(401).send({
          auth: false,
          accessToken: null,
          message: "Invalid Password!",
        });
      }
      if (newpassword) {
        console.log(JSON.stringify(user));
        user
          .update({ password: bcrypt.hashSync(req.body.newpassword, 8) })
          .then(async (updatedUser) => {
            let userprofile = await models.user_profiles.findOne({
              where: {
                email: req.userName,
              },
            });
            var emilreceipiants = [
              { to: user.email, subject: "Password Reset Successfully" },
            ];
            sendMail(
              emilreceipiants,
              emailTemp.changepasswordTemp(userprofile.first_name)
            );
            return res
              .status(200)
              .json({ message: `Password Reset Successfully` });
          })
          .catch((reason) => {
            return res.status(403).json({ message: `Please Try Again` });
          });
      }
    })
    .catch((err) => {
      res.status(500).send("Error -> " + err);
    });
};

exports.verification = (req, res) => {
  console.log(req.params.email);
  return models.User.findOne({
    where: { email: req.params.email },
  })
    .then((user) => {
      if (user.isVerified) {
        return res.status(202).json(`Email Already Verified`);
      } else {
        return models.VerificationToken.findOne({
          where: {
            token: req.params.token,
            tokentype: 1,
            userId: user.id,
            createdAt: {
              [Op.lt]: new Date(),
              [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000),
            },
          },
        })
          .then((foundToken) => {
            if (foundToken) {
              return user
                .update({ isVerified: true })
                .then((updatedUser) => {
                  return res
                    .status(403)
                    .json(`User with ${user.email} has been verified`);
                })
                .catch((reason) => {
                  return res.status(403).json(`Verification failed`);
                });
            } else {
              return res.status(404).json(`Token expired`);
            }
          })
          .catch((reason) => {
            return res.status(404).json(`Token expired`);
          });
      }
    })
    .catch((reason) => {
      return res.status(404).json(`Email not found1`);
    });
};
exports.resetpassword = (req, res) => {
  console.log("usertokenval " + req.userName);
  return models.users
    .findOne({
      where: { email: req.userName },
    })
    .then((user) => {
      // return models.VerificationToken.findOne({
      //   where: { token: req.body.verificationToken,tokentype: 2, userId: user.id,
      //         createdAt: {
      //         [Op.lt]: new Date(),
      //         [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000)
      //       } }
      // })
      //   .then((foundToken) => {

      //  if(foundToken){

      return user
        .update({ password: bcrypt.hashSync(req.body.password, 8) })
        .then(async (updatedUser) => {
          let userprofile = await models.user_profiles.findOne({
            where: {
              email: user.email,
            },
          });
          var emilreceipiants = [
            { to: user.email, subject: "Password Reset Successfully" },
          ];

          sendMail(
            emilreceipiants,
            emailTemp.changepasswordTemp(userprofile.first_name)
          );
          return res.status(200).json(`Password Reset Successfully`);
        })
        .catch((reason) => {
          return res.status(403).json(`Please Try Again`);
        });
      // } else {
      //   return res.status(404).json(`Token expired` );
      // }
      // })
      // .catch(reason => {
      //   return res.status(404).json(`Token expired`);
      // });
    })
    .catch((reason) => {
      return res.status(404).json(`Email not found`);
    });
};
exports.verifypasswordtoken = (req, res) => {
  if (req.userName) {
    res.send(200, { message: "token is valid" });
  }
};
exports.forgotpassword = (req, res) => {
  console.log(JSON.stringify(req.body.email));
  models.users
    .findOne({
      where: { email: req.body.email },
    })
    .then(async (user) => {
      console.log(user.id);
      // if user email already exists
      if (user) {
        // if(!user.isVerified) {
        //   return res.status(409).json('Please verify email then try reset password');
        // } else {
        let userprofile = await models.user_profiles.findOne({
          where: {
            email: user.email,
          },
        });

        var token = jwt.sign({ id: user.email }, process.env.SECRET, {
          expiresIn: "1d", // expires in 24 hours
        });
        var emilreceipiants = [
          { to: user.email, subject: "Reset password request" },
        ];
        var verifyurl = `${process.env.baseurl}/resetpassword/${token}`;
        sendMail(
          emilreceipiants,
          emailTemp.forgotpasswordTemp(
            userprofile.first_name,
            "manokarantk@gmail.com",
            verifyurl
          )
        );
        // sendVerificationEmail(user.email, result.token);
        return res.status(200).send({
          message: "Please check your registered email inbox for reset link",
          status: "success",
        });

        // }
      } else {
        res.status(404).send({
          message: "Email ID not Registered with us",
          status: "failure",
        });
      }
    })
    .catch((error) => {
      res.status(500).send({
        message: "Email ID not Registered with us",
        status: "failure",
      });
    });
};
exports.userContent = (req, res) => {
  console.log(req.userName);
  models.User.findOne({
    where: { userName: req.userName },
    attributes: ["userName"],
    include: [
      {
        model: models.Role,
        attributes: ["id", "name"],
        through: {
          attributes: ["userId", "roleId"],
        },
      },
    ],
  })
    .then((user) => {
      res.status(200).json({
        description: "User Content Page",
        user: user,
      });
    })
    .catch((err) => {
      res.status(500).json({
        description: "Can not access User Page",
        error: err,
      });
    });
};
exports.updateuserprofile = (req, res) => {
  console.log(req.userName);
  const {
    contactno,
    pincode,
    firstname,
    lastname,
    country_code,
    country,
    salutation,
  } = req.body;
  models.user_profiles
    .findOne({
      where: { email: req.userName },
    })
    .then((userprofile) => {
      userprofile
        .update({
          first_name: firstname,
          last_name: lastname,
          pincode: pincode,
          mobile: contactno,
          country: country,
          country_code: country_code,
          salutation: salutation,
        })
        .then((updatedUser) => {
          return res.status(200).json(`Profile Updated Successfully`);
        })
        .catch((reason) => {
          return res.status(403).json(`Please Try Again`);
        });
    });
};

exports.guestlogin = (req, res) => {
  const { email } = req.body;
  let otp = Math.floor(100000 + Math.random() * 900000);

  models.user_profiles
    .findOne({
      where: { email },
      attributes: ["user_id", "id", "otp"],
    })
    .then((user) => {
      if (!user) {
        //  otp = '000000'
        console.log(otp);
        const guest = {
          id: uuidv1(),
          email: email,
          otp: otp,
          isemailverified: false,
        };
        var emilreceipiants = [{ to: email, subject: "Verify user" }];

        models.user_profiles
          .create(guest, {
            returning: true,
          })
          .then((guestuser) => {
            // sendMail(
            //   emilreceipiants,
            //   emailTemp.guestloginTemp("", "manokarantk@gmail.com", otp)
            // );

            res.status(200).json({
              description: "User Content Page",
              user: guestuser,
            });
          });
      } else {
        user.update({
          otp,
        });
        var emilreceipiants = [{ to: email, subject: "Verify user" }];

        // sendMail(
        //   emilreceipiants,
        //   emailTemp.guestloginTemp("", "manokarantk@gmail.com", otp)
        // );

        res.status(200).json({
          description: "User Content Page",
          user: user,
        });
      }
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
      res.status(500).json({
        description: "Can not access User Page",
        error: err,
      });
    });
};

exports.verifyotp = (req, res) => {
  const { email, otp } = req.body;

  models.user_profiles
    .findOne({
      where: { email, otp },
      attributes: ["id"],
    })
    .then((user) => {
      if (!user) {
        res.status(401).json({
          message: "Enter valid OTP",
        });
      } else {
        res.status(200).json({
          description: "User Content Page",
          user: user,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        description: "Can not access User Page",
        error: err,
      });
    });
};

exports.addquestion = (req, res) => {
  const { name, email, phone, message } = req.body;
  const askquestion = {
    name,
    email,
    phone,
    message,
    is_active: true,
  };
  models.askus
    .create(askquestion, {
      returning: true,
    })
    .then((response) => {
      if (!response) {
        res.status(401).json({
          message: "Please try after sometime",
        });
      } else {
        var emilreceipiants = [
          { to: process.env.styloriemail, subject: "Contact us" },
          { to: process.env.adminemail, subject: "Contact us" },
        ];
        sendMail(emilreceipiants, emailTemp.contactusTemp(req.body));

        res.status(200).json({
          message: "Thanks for contacting us. Our Team will reach out you.",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        description: "Can't access User Page",
        error: err,
      });
    });
};
exports.asktoexport = (req, res) => {
  const { name, email, phone, message, product_sku } = req.body;
  const askexport = {
    product_sku,
    name,
    email,
    phone,
    message,
    is_active: true,
  };
  models.asktoexpert
    .create(askexport, {
      returning: true,
    })
    .then((response) => {
      if (!response) {
        res.status(401).json({
          message: "Please try after sometime",
        });
      } else {
        var emilreceipiants = [
          { to: process.env.styloriemail, subject: "Ask our Expert" },
          { to: process.env.adminemail, subject: "Ask our Expert" },
        ];
        sendMail(emilreceipiants, emailTemp.asktoexpertTemp(req.body));

        res.status(200).json({
          message: "Thanks for contacting us. Our Expert will reach out you.",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        description: "Can not access User Page",
        error: err,
      });
    });
};

exports.addemailsubscription = (req, res) => {
  const { email } = req.body;
  const emailsubscribe = {
    email,
    is_active: true,
  };

  models.email_subscription
    .findOne({
      where: {
        email: email,
      },
    })
    .then((subscribe) => {
      if (subscribe) {
        res
          .status(409)
          .json({ message: "Your email ID already subscribed with us" });
      } else {
        models.email_subscription
          .create(emailsubscribe, {
            returning: true,
          })
          .then((response) => {
            if (!response) {
              res.status(401).json({
                message: "Please try after sometime",
              });
            } else {
              // var emilreceipiants = [{to : email,subject:"Subscribe Email"}]

              // sendMail(emilreceipiants,emailTemp.subscribeTemp(""))

              res.status(200).json({
                message: "You have subscribed successfully.",
              });
            }
          })
          .catch((err) => {
            res.status(500).json({
              description: "Can not access User Page",
              error: err,
            });
          });
      }
    });
};

exports.getmasterroles = async (req, res) => {
  let masterroles = await models.master_roles.findAll({
    attributes: ["id", ["role_name", "name"]],

    where: {
      // role_name: {
      //   [Op.notIn] : ['Admin','user']
      // }
    },
  });

  res.status(200).send({ roles: masterroles });
};

exports.getwebusers = async (req, res) => {
  // let userslists = await models.users.findAll({
  //   attributes:["id","username","password","email","mobile","status"],
  //   include:[
  //     {
  //       model : models.user_roles,
  //       attributes : ["role_name"],
  //       include:[{
  //         model:models.master_roles,
  //         attributes:["id",["role_name","name"]]
  //       }],
  //       where:{
  //         role_name: {
  //           [Op.in] : ['user']
  //         }
  //       }
  //     }

  //   ]

  // })

  let userslists = await models.user_profiles.findAll({
    // include: [
    //   {
    //     model : models.user,
    //     // include : [
    //     //   {
    //     //     model : models.user_roles,
    //     //     where :
    //     //     {
    //     //       role_name : {
    //     //         [Op.notIn] : 'Admin'
    //     //       }
    //     //     }
    //     //   }
    //     // ]
    //   }
    // ],
    // limit :10
  });

  res.status(200).send({ users: userslists.length });
};

exports.getadminusers = async (req, res) => {
  let userslists = await models.users.findAll({
    attributes: ["id", "username", "password", "email", "mobile", "status"],
    include: [
      {
        model: models.user_roles,
        attributes: ["role_name"],
        include: [
          {
            model: models.master_roles,
            attributes: ["id", ["role_name", "name"]],
          },
        ],
        where: {
          role_name: {
            [Op.notIn]: ["user"],
          },
        },
      },
    ],
  });

  res.status(200).send({ users: userslists });
};

exports.getpageaccess = async (req, res) => {
  const { userName } = req;
  console.log(userName);
  let userobj = await models.users.findOne({
    attributes: ["id"],
    where: {
      email: userName,
    },
  });
  let user_roles = await models.user_roles.findAll({
    attributes: ["role_id"],
    where: {
      user_id: userobj.id,
    },
  });

  let userroles = [];
  user_roles.forEach((roleobj) => {
    userroles.push(roleobj.role_id);
  });
  let user_pages = await models.role_permissions.findAll({
    attributes: ["role_id", "page_id", "is_view", "is_write"],
    include: [
      {
        model: models.uniquepages,
      },
    ],
    where: {
      role_id: {
        [Op.in]: userroles,
      },
      [Op.or]: [
        {
          is_view: true,
        },
        {
          is_write: true,
        },
      ],
    },
  });
  let userpages = [];
  user_pages.forEach((element) => {
    let pageobj = {
      pagename: element.uniquepage.displayname,
      pageurl: element.uniquepage.pagename,
      is_view: element.is_view,
      is_write: element.is_write,
    };
    userpages.push(pageobj);
  });
  res.send(200, { pages: userpages });
};

exports.getuserinfo = async (req, res) => {
  const { user_id } = req.body;
  let userinfo = {};
  let useraddress = await models.user_address.findAll({
    where: {
      userprofile_id: user_id,
    },
  });
  let userprofile = await models.user_profiles.findOne({
    attributes: [
      "id",
      "first_name",
      "last_name",
      "email",
      "mobile",
      "ismobileverified",
      "isemailverified",
      "address",
      "city",
      "country",
      "pincode",
      "lastlogin",
      "createdAt",
    ],
    where: {
      id: user_id,
    },
  });
  let addressess = [];
  let useraddressobj = {};
  if (useraddress) {
    useraddress.forEach((element) => {
      let addresobj = {};
      addresobj["firstname"] = element.firstname;
      addresobj["lastname"] = element.lastname;
      addresobj["address"] = element.addressline1 + "," + element.addressline2;
      addresobj["city"] = element.city;
      addresobj["state"] = element.state;
      addresobj["country"] = element.country;
      addresobj["pincode"] = element.pincode;
      addresobj["mobile"] = element.country_code + element.contact_number;
      addresobj["addresstype"] = "";
      if (element.default_billing && element.default_shipping) {
        addresobj["addresstype"] = "Billing & Shipping";
      } else if (element.default_billing) {
        addresobj["addresstype"] = "Billing";
      } else if (element.default_shipping) {
        addresobj["addresstype"] = "Shipping";
      }
      if (!useraddressobj.city) {
        if (element.default_shipping) {
          useraddressobj = element;
        } else {
          if (element.default_billing) {
            useraddressobj = element;
          }
        }
      }

      addressess.push(addresobj);
    });
  }
  console.log("+XXXXXXXX+");

  if (!useraddressobj.city && addressess.length > 0) {
    console.log("+XXXXXXXX+");
    useraddressobj = addressess[0];
  }
  userprofile["address"] = useraddressobj;

  let userorders = await models.orders.findAll({
    include: [
      {
        model: models.shopping_cart,
        attributes: ["gross_amount"],
        include: [
          {
            model: models.shopping_cart_item,
            attributes: ["product_sku"],
          },
        ],
      },
    ],
    where: {
      user_profile_id: user_id,
    },
  });

  let orders = [];
  if (userorders) {
    userorders.forEach((element) => {
      let orderobj = {};
      orderobj["orderid"] = element.id;
      orderobj["paymentmode"] = element.payment_mode;
      orderobj["paymentstatus"] = element.payment_status;
      orderobj["orderstatus"] = element.order_status;
      orderobj["awbnumber"] = element.awb_number;
      orderobj["orderdate"] = element.createdAt;

      let skus = [];
      if (element.shopping_cart) {
        let cartobj = element.shopping_cart;

        orderobj["grossamount"] = cartobj.grossamount;

        if (cartobj.shopping_cart_items) {
          cartobj.shopping_cart_items.forEach((cartitem) => {
            skus.push(cartitem.product_sku);
          });
        }
        orderobj["skus"] = skus.join(",");
      }

      orders.push(orderobj);
    });
  }
  let wishlists = await models.user_whislists.findAll({
    where: {
      userprofile_id: user_id,
    },
  });
  userinfo["orders"] = orders;
  userinfo["wishlists"] = wishlists;
  userinfo["addressess"] = addressess;
  res.status(200).send({ userinfo, userprofile });
};

exports.mediaSignin = async (req, res) => {
  let { type, mediaBody } = req.body;
  let userProfile,
    token,
    profileSearch = { email: mediaBody.email };
  try {
    //Finding if existing email exists based on social media sigin
    if (type == "facebook") {
      profileSearch["facebookid"] = mediaBody.id;
    } else if (type == "google") {
      profileSearch["google_id"] = mediaBody.id;
    }
    userProfile = await models.user_profiles.findOne({
      where: {
        [models.Sequelize.Op.or]: {
          ...profileSearch,
        },
      },
      order: [["createdAt", "desc"]],
    });
    token = jwt.sign({ id: mediaBody.email }, process.env.SECRET, {
      expiresIn: "1d", // expires in 24 hours
    });
    if (userProfile) {
      if (type == "facebook" && !userProfile.facebookid) {
        await models.user_profiles.update(
          { facebookid: mediaBody.id },
          { where: { id: userProfile.id } }
        );
      }
      if (type == "google" && !userProfile.google_id) {
        await models.user_profiles.update(
          { google_id: mediaBody.id },
          { where: { id: userProfile.id } }
        );
      }
      return res.status(200).send({
        accessToken: token,
        userprofile: { id: userProfile.id, email: userProfile.email },
      });
    } else {
      let user = await models.users.findOne({
        where: { email: mediaBody.email },
      });
      if (!user) {
        user = await models.users.create({
          id: uuidv1(),
          email: mediaBody.email,
          isverified: true,
        });
      }
      let userProfileObj = {
        ...mediaBody,
        id: uuidv1(),
        user_id: user.id,
        first_name: mediaBody.firstName,
        last_name: mediaBody.lastName,
        isemailverified: true,
      };
      if (type == "facebook") {
        userProfileObj["facebookid"] = mediaBody.id;
      } else if (type == "google") {
        userProfileObj["google_id"] = mediaBody.id;
      }
      userProfile = await models.user_profiles.create(userProfileObj);
      return res.status(200).send({
        accessToken: token,
        userprofile: { id: userProfile.id, email: userProfile.email },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Some error occured!", ...error });
  }
};
