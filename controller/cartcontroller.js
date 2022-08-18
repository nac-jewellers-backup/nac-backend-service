import crypto, { async } from "crypto-random-string";
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const models = require("./../models");
import "dotenv/config";
const squelize = require("sequelize");
const Op = require("sequelize").Op;
const uuidv1 = require("uuid/v1");
import aws from "aws-sdk";
import dotenv from "dotenv";
import { sequelize } from "../models";
var request = require("request");
var dateFormat = require("dateformat");
const moment = require("moment");
const emailTemp = require("./notify/Emailtemplate");
const { send_sms } = require("../controller/notify/user_notify");
const {
  sendOrderConfirmation,
  sendShippingConfirmation,
  sendRateProduct,
  sendPaymentConfimed,
  sendAbandonedCart,
  sendAppointmentOTP,
  sendAppointmentConfirmation,
} = require("./notify/email_templates");
import { sendMail } from "./notify/user_notify";
import axios from "axios";
dotenv.config();
aws.config.update({
  region: "ap-southeast-1", // Put your aws region here
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const S3_BUCKET = process.env.AWS_IMAGE_BUCKET_NAME;

const loadCountries = () => {
  return new Promise((resolve, reject) => {
    models.master_countries
      .findAll({
        attributes: [
          "id",
          "name",
          "nicename",
          "phonecode",
          "currency",
          "currency_alias",
          "currency_symbol",
          "fx_conversion_rate",
        ],
        raw: true,
      })
      .then((countries) => {
        let result = {};
        countries.forEach((item) => {
          result[item.name.toLowerCase()] = {
            ...item,
          };
        });
        resolve(result);
      })
      .catch(reject);
  });
};

exports.addgiftwrap = async (req, res) => {
  const { cart_id, gift_from, gift_to, message } = req.body;

  var isvalid = true;
  const giftwrapobj = {
    id: uuidv1(),
    cart_id,
    gift_from,
    gift_to,
    message,
    is_active: true,
  };
  models.giftwrap
    .create(giftwrapobj)
    .then((giftwrapobj) => {
      res.send(200, { message: "Success" });
    })
    .catch((reason) => {
      res.send(500, { message: "Failed" });
    });
};
exports.getvoucher = async (req, res) => {
  const { id } = req.body;
  let response = await models.vouchers.findOne({
    where: {
      id: id,
    },
  });
  res.send(200, { response });
};
exports.createvoucher = async (req, res) => {
  const {
    vouchername,
    vouchercodes,
    description,
    isloggedin,
    discounttype,
    maxdiscount,
    startdate,
    enddate,
    attributes,
    discount,
    isonce,
    limittouse,
    minorderqty,
    minorder,
  } = req.body;
  let vouchers = [];
  let product_attributes = {};
  let keys = Object.keys(attributes);
  keys.forEach((key) => {
    let attributeobj = attributes[key];
    if (Array.isArray(attributeobj)) {
      let componentarr = [];
      attributeobj.forEach((attr) => {
        if (attr.alias) {
          if (attr.alias == "Gold Jewellery") {
            componentarr.push(attr.short_code);
          } else {
            componentarr.push(attr.alias);
          }
        }
      });
      if (componentarr.length > 0) {
        product_attributes[key] = componentarr;
      }
    }
  });
  let discounttype_value = 2;
  // vouchercodes.forEach(codes => {
  let voucherobj = {
    id: uuidv1(),
    voucher_codes: vouchercodes,
    code: vouchercodes[0],
    name: vouchername,
    description: description,
    isloginneeded: isloggedin,
    discount_amount: discount,
    max_discount: maxdiscount,
    type: discounttype ? discounttype : null,
    min_cart_value: minorder,
    max_uses: limittouse,
    min_cart_qty: minorderqty,
    uses: 0,
    max_uses_user: isonce ? isonce : 1,
    is_active: true,
    starts_at: startdate,
    expires_at: enddate,
    product_attributes: product_attributes,
  };
  //
  //   vouchers.push(voucherobj)
  // })
  await models.vouchers.create(voucherobj);
  res.send(200, { codes: voucherobj });
};
exports.applyvoucher = async (req, res) => {
  try {
    const { vouchercode, cart_id, user_profile_id } = req.body;
    let vouchers = [];
    vouchers.push(vouchercode);
    var isloggedin = false;
    if (user_profile_id) {
      let userprofile = await models.user_profiles.findOne({
        where: {
          id: user_profile_id,
        },
      });

      if (userprofile.facebookid || userprofile.user_id) {
        isloggedin = true;
      }
    }

    var attributes_condition = [];

    let coupon_info = await models.vouchers.findOne({
      where: {
        is_active: true,
        voucher_codes: {
          [Op.overlap]: vouchers,
        },
      },
    });
    console.log(">>>><<<<<<<<");
    console.log(JSON.stringify(coupon_info));
    if (coupon_info) {
      // attributes_condition.push({
      //   attributes:{
      //     [Op.contains]: coupon_info.attributes
      //   }
      // })
      let keys = Object.keys(coupon_info.product_attributes);
      keys.forEach((key) => {
        let attributeobj = coupon_info.product_attributes[key];
        if (Array.isArray(attributeobj)) {
          let componentarr = [];
          attributeobj.forEach((attr) => {
            if (attr.alias) {
              let attr_where = {
                attributes: {
                  [Op.contains]: [attr.alias],
                },
              };
              componentarr.push(attr_where);
            }
          });
          if (componentarr.length > 0) {
            let attrobj = {
              [Op.or]: componentarr,
            };
            attributes_condition.push(attrobj);
          }
        }
      });
    } else {
      return res.status(200).send({ message: "Please Enter Valid Coupon" });
    }

    var couponwhereclause = {
      [Op.and]: attributes_condition,
    };
    // var couponwhereclause = {
    //   product_category : 'Jewellery'
    // }
    // var cskcoupons = ['NACCSK2020','NACCSK100','NACCSK101','NACCSK102','NACCSK103','NACCSK104']
    // if(cskcoupons.indexOf(vouchercode.toUpperCase()) > -1)
    // {
    //   couponwhereclause['product_type'] = 'Kada'
    // }
    let shoppingcart = await models.shopping_cart_item.findAll({
      include: [
        {
          model: models.trans_sku_lists,
          attributes: ["generated_sku", "markup_price"],
          include: [
            {
              model: models.product_lists,
              attributes: ["product_category"],
              where: couponwhereclause,
            },
          ],
        },
      ],
      where: {
        shopping_cart_id: cart_id,
      },
    });
    console.log(">>>><<<<<<<<");
    var eligible_amount = 0;
    shoppingcart.forEach((element) => {
      if (element.trans_sku_list) {
        eligible_amount = eligible_amount + element.trans_sku_list.markup_price;
      }

      console.log(JSON.stringify(eligible_amount));
    });

    models.vouchers
      .findOne({
        where: {
          is_active: true,
          min_cart_value: {
            [Op.lte]: eligible_amount,
          },
          code: {
            [Op.iLike]: vouchercode,
          },
        },
      })
      .then(async (giftwrapobj) => {
        var message_response = "";
        console.log("_____userstatus");
        console.log(isloggedin);
        console.log(giftwrapobj.isloginneeded);

        console.log("_______________");
        if (!giftwrapobj.isloginneeded) {
          isloggedin = true;
        }
        if (giftwrapobj.uses >= giftwrapobj.max_uses) {
          eligible_amount = 0;
          return res.send(409, {
            status: "409",
            message: "This promocode already used",
          });
        }
        if (
          isloggedin &&
          giftwrapobj &&
          giftwrapobj.discount_amount &&
          eligible_amount > 0
        ) {
          var discountvalue = giftwrapobj.discount_amount;
          message_response = "You have applied promo code successfully";
          var discountpercent = discountvalue / 100;
          // isvalid = true
          // message_response = "Applied Successfully"
          var query = "";
          if (giftwrapobj.type === 2) {
            let discountval = eligible_amount * discountpercent;
            // let discountendamount  = eligible_amount * discountpercent;
            if (giftwrapobj.max_discount) {
              if (discountval > giftwrapobj.max_discount) {
                discountval = giftwrapobj.max_discount;
              }
            }

            query =
              "UPDATE shopping_carts SET discount = " +
              discountval +
              ", discounted_price = (gross_amount - " +
              discountval +
              "), voucher_code = '" +
              vouchercode +
              "' where id ='" +
              cart_id +
              "'";
          } else {
            if (giftwrapobj.max_discount) {
              if (discountvalue > giftwrapobj.max_discount) {
                discountvalue = giftwrapobj.max_discount;
              }
            }
            query =
              "UPDATE shopping_carts SET discount = " +
              discountvalue +
              " , discounted_price = (gross_amount -" +
              discountvalue +
              "), voucher_code = '" +
              vouchercode +
              "' where id ='" +
              cart_id +
              "'";
          }
          console.log(JSON.stringify(query));

          await models.sequelize.query(query).then(([results, metadata]) => {
            // Results will be an empty array and metadata will contain the number of affected rows.
            console.log(JSON.stringify(metadata));
            models.shopping_cart
              .findOne({
                where: {
                  id: cart_id,
                },
              })
              .then((price_response) => {
                res.send(200, {
                  status: "200",
                  message: message_response,
                  price_response,
                  coupon_type: giftwrapobj.description,
                });
              });
          });
        } else {
          console.log("voucher invalid");
          if (!isloggedin) {
            res.send(409, {
              status: "409",
              message: "You should login to apply this voucher",
            });
          } else {
            let vouchers = await models.vouchers.findAll({
              where: {
                is_active: true,
                min_cart_value: {
                  [Op.lte]: eligible_amount,
                },
                code: {
                  [Op.iLike]: vouchercode,
                },
              },
            });
            if (vouchers.length > 0) {
              res.send(409, {
                status: "409",
                message: "Promo code is invalid for this order",
              });
            } else {
              res.send(409, { status: "409", message: "Enter valid coupon" });
            }
          }
        }
      })
      .catch((reason) => {
        res.send(409, { status: "409", message: "Enter valid coupon", reason });
      });
    // res.send(200,{message:"Applied Succesfully","discounted_price":1000,"tax_price":320})
  } catch (err) {
    console.log(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Calcutta",
      }) +
        " - Error message : " +
        err
    );
  }
};
exports.paymentsuccess = async (req, res) => {
  try {
    const { TRANSACTIONID, TRANSACTIONPAYMENTSTATUS } = req.body;
    console.log("???XXXXXXXXXXXXXXXXXXX");
    console.log(JSON.stringify(req.body));
    // if(txndata.TRANSACTIONSTATUS == '200')
    // {
    let transid = TRANSACTIONID;

    let orderobj = await models.orders.findOne({
      where: {
        payment_id: transid,
      },
    });
    let paymentcontent = {
      order_id: orderobj.id,
      payment_response: JSON.stringify(req.body),
    };
    let redirectionurl = process.env.baseurl;
    if (TRANSACTIONPAYMENTSTATUS == "SUCCESS") {
      await models.orders.update(
        { payment_status: "Paid" },
        { where: { id: orderobj.id } }
      );
      const update_cartstatus = {
        status: "paid",
      };
      let updatecart = await models.shopping_cart.update(update_cartstatus, {
        returning: true,
        where: {
          id: orderobj.cart_id,
        },
      });
      //update inventory post successfull payment
      let updateInventory = await models.sequelize
        .query(`update inventories i set number_of_items = (number_of_items - sub.qty) from 
              (select product_sku,qty from shopping_cart_items where shopping_cart_id in (
                select cart_id from public.orders where id = '${orderobj.id}'
              )) as sub where i.generated_sku = sub.product_sku and i.number_of_items > 0`);
      sendorderconformationemail(orderobj.id);
      redirectionurl = redirectionurl + "/paymentsuccess/" + orderobj.id;
    } else {
      await models.orders.update(
        { payment_status: "Failed" },
        { where: { id: orderobj.id } }
      );
      redirectionurl = redirectionurl + "/cart";
    }

    let new_cart = await models.payment_details.create(paymentcontent, {
      returning: true,
    });

    return res.redirect(redirectionurl);
  } catch (err) {
    console.log(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Calcutta",
      }) +
        " - Error message : " +
        err
    );
  }
};
exports.updateorderstatus = async (req, res) => {
  const {
    orderstatus,
    paymentstatus,
    cartid,
    orderid,
    awbNumber,
    comments,
    giftmessage,
  } = req.body;
  var payment_current_status = "";
  if (paymentstatus) {
    if (paymentstatus.name) {
      payment_current_status = paymentstatus.name;
    } else {
      payment_current_status = paymentstatus;
    }
  }

  let response = await models.orders.update(
    {
      order_status: orderstatus.name,
      awb_number: awbNumber,
      comments: comments,
      payment_status: payment_current_status,
    },
    {
      where: {
        id: orderid,
      },
    }
  );

  let response1 = await models.giftwrap.update(
    {
      message: giftmessage,
    },
    {
      where: {
        cart_id: cartid,
      },
    }
  );

  res.send(200, { message: "success" });
};
exports.resendorderemail = async (req, res) => {
  const { order_id } = req.body;

  sendorderconformationemail(order_id, res);
  //return res.send(200,{message:"Confomation mail sent successfully"})
};

exports.paymentfailure = async (req, res) => {
  try {
    console.log(JSON.stringify(req.body));
    if (req.body && req.body.TRANSACTIONID) {
      let orderobj = await models.orders.findOne({
        where: {
          payment_id: req.body.TRANSACTIONID,
        },
      });
      const update_cartstatus = {
        status: "pending",
      };
      let updatecart = await models.shopping_cart.update(update_cartstatus, {
        returning: true,
        where: {
          id: orderobj.cart_id,
        },
      });
      let paymentcontent = {
        order_id: orderobj.id,
        payment_response: JSON.stringify(req.body),
      };
      let new_cart = await models.payment_details.create(paymentcontent, {
        returning: true,
      });
      let redirectionurl = process.env.baseurl + "/cart";
      return res.redirect(redirectionurl);
    } else {
      let redirectionurl = process.env.baseurl + "/cart";
      return res.redirect(redirectionurl);
    }
  } catch (err) {
    console.log(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Calcutta",
      }) +
        " - Error message : " +
        err
    );
  }
};
exports.generatepaymenturl = async (req, res) => {
  const { chargetotal } = req.body;
  var timezone = "IST";
  var authenticateTransaction = true;
  var txntype = "sale";
  var txndatetime = "";
  var currency = "356";
  var mode = "payonly";
  var storename = "3396023678";
  //var chargetotal="1";
  var paymentMethod = "";
  var dateval = new Date();
  var full_bypass = false;
  var sharedsecret = process.env.PG_SECRET;
  var currentdate = new Date();
  var day = moment.tz(new Date(), "Asia/Kolkata").format("YYYY:MM:DD-HH:mm:ss");
  var cartval = chargetotal;
  if (process.env.cartvalue) {
    cartval = process.env.cartvalue;
  }
  //var day=dateFormat(new Date(), "yyyy:mm:dd-HH:MM:ss");
  const crypto = require("crypto");
  var shasum = crypto.createHash("sha1");
  var responseSuccessURL = "http://127.0.0.1/PHP/response_success.php";

  var responseFailURL = "http://127.0.0.1/PHP/response_fail.php";
  var binarystring = storename + day + cartval + currency + sharedsecret;

  let hash = bin2hex(binarystring);
  shasum.update(hash);

  function bin2hex(s) {
    var i,
      l,
      o = "",
      n;

    s += "";

    for (i = 0, l = s.length; i < l; i++) {
      n = s.charCodeAt(i).toString(16);
      o += n.length < 2 ? "0" + n : n;
    }

    return o;
  }
  let bodyparams = {
    timezone,
    authenticateTransaction,
    txntype,
    txndatetime,
    currency,
    mode,
    hash,
    storename,
    chargetotal,
    paymentMethod,
    full_bypass,
    sharedsecret,
    responseSuccessURL,
    responseFailURL,
  };

  res.send(200, { hash: shasum.digest("hex"), day, currentutc: currentdate });
  //   console.log(JSON.stringify(bodyparams))
  //   request({
  //     url: 'https://test.ipg-online.com/connect/gateway/processing',
  //     method: "POST",
  //     headers: {"Content-Type": "application/json"},
  //     body: JSON.stringify(bodyparams)
  // }, function(error, response, body) {
  //    res.send(200,response,body);

  // });
};
exports.sendtoairpay = async (req, res) => {
  const { buyerPhone, buyerPinCode, orderid, amount, customvar, subtype } =
    req.body;
  var paymentid = 0;
  var cartval = 1.0;
  var buyerEmail = "";
  var buyerFirstName = "";
  var buyerLastName = "";
  var buyerAddress = "";
  var buyerCity = "";
  var buyerState = "";
  var buyerCountry = "";
  if (orderid) {
    let cartvalueobj = await models.orders.findOne({
      include: [
        {
          model: models.shopping_cart,
          include: [
            {
              model: models.cart_address,
            },
          ],
        },
        {
          model: models.user_profiles,
        },
      ],
      where: {
        id: orderid,
      },
    });
    cartvalueobj = JSON.parse(JSON.stringify(cartvalueobj));
    if (cartvalueobj) {
      if (cartvalueobj.user_profile) {
        buyerEmail = cartvalueobj.user_profile.email || "";
      }
      if (cartvalueobj.shopping_cart) {
        if (cartvalueobj.shopping_cart.cart_addresses) {
          let cartaddres_arr = cartvalueobj.shopping_cart.cart_addresses;
          if (cartaddres_arr.length > 0) {
            let cartaddressobject = cartaddres_arr[0];
            // buyerEmail = cartaddressobject.email ? cartaddressobject.email : "";
            buyerFirstName = cartaddressobject.firstname
              ? cartaddressobject.firstname
              : "";
            buyerLastName = cartaddressobject.lastname
              ? cartaddressobject.lastname
              : "";
            buyerAddress = cartaddressobject.addressline1
              ? cartaddressobject.addressline1
              : "";
            buyerCity = cartaddressobject.city ? cartaddressobject.city : "";
            buyerState = cartaddressobject.state ? cartaddressobject.state : "";

            buyerCountry = cartaddressobject.country
              ? cartaddressobject.country
              : "";
          }
        }
      }
    }
    if (cartvalueobj) {
      paymentid = cartvalueobj.payment_id;
    }
    if (cartvalueobj.shopping_cart) {
      if (process.env.NODE_ENV == "production") {
        cartval = cartvalueobj.shopping_cart.discounted_price; //Cart Value To Be greater than 1 in production!
      }
    }
  } else {
  }
  var md5 = require("md5");
  var sha256 = require("sha256");
  var dateformat = require("dateformat");
  var mid = process.env.airpay_mid;
  var username = process.env.airpay_username;
  var password = process.env.airpay_password;
  var secret = process.env.airpay_secret;
  var now = new Date();
  cartval = Math.round(cartval, 2);
  let alldata =
    buyerEmail +
    buyerFirstName +
    buyerLastName +
    buyerAddress +
    buyerCity +
    buyerState +
    buyerCountry +
    cartval +
    paymentid;
  console.log(alldata);
  let udata = username + ":|:" + password;
  let privatekey = sha256(secret + "@" + udata);
  let aldata = alldata + dateformat(now, "yyyy-mm-dd");
  let checksum = md5(aldata + privatekey);
  let fdata = req.body;
  var bodyparams = {
    ...fdata,
    buyerEmail,
    buyerFirstName,
    buyerLastName,
    buyerAddress,
    buyerCity,
    buyerState,
    buyerCountry,
    cartval,
    paymentid,
    privatekey: privatekey,
    mercid: mid,
    currency: 356,
    isocurrency: "INR",
    chmod: "",
    amount: cartval,
    checksum: checksum,
    paymentid,
  };
  console.log(JSON.stringify(bodyparams));
  //   request({
  //     url: 'https://payments.airpay.co.in/pay/index.php',
  //     method: "POST",
  //     headers: {"Content-Type": "application/json"},
  //     body: JSON.stringify(bodyparams)
  // }, function(error, response, body) {
  //   console.log(JSON.stringify(response))
  //   console.log(JSON.stringify(body))

  res.send(200, bodyparams);

  //});
  //res.render('sendtoairpay', { mid : mid,data: fdata,privatekey : privatekey,checksum:checksum});
};

exports.getsizes = async (req, res) => {
  var prooduct_sizes = await models.trans_sku_lists.findAll({
    attributes: ["sku_size"],
    group: ["sku_size"],
    where: {
      sku_size: {
        [Op.ne]: null,
      },
    },
    order: [["sku_size", "ASC"]],
  });

  res.send(200, { status: 200, sizes: prooduct_sizes });
};
exports.removecartitem = async (req, res) => {
  try {
    let { cart_id, product_id } = req.body;

    let cart = await models.shopping_cart.findByPk(cart_id);

    if (!cart) {
      return res.status(403).send({ message: "No Such Cart ID exists!" });
    } else if (cart.status != "pending") {
      return res
        .status(403)
        .send({ message: "Please check cart it's already submitted" });
    }

    await models.shopping_cart_item.destroy({
      where: {
        shopping_cart_id: cart_id,
        product_sku: product_id,
      },
    });

    let totalCartItems = await models.shopping_cart_item.count({
      where: {
        shopping_cart_id: cart_id,
      },
    });

    if (totalCartItems) {
      let gross_amount = await models.shopping_cart_item.findOne({
        attributes: [[squelize.literal("SUM(price)"), "price"]],
        where: {
          shopping_cart_id: cart_id,
        },
      });
      // console.log("cartline length");

      await models.shopping_cart
        .update(
          {
            gross_amount: gross_amount.price,
            net_amount: gross_amount.price,
            discount: 0,
            discounted_price: gross_amount.price,
          },
          {
            where: { id: cart_id },
          }
        )
        .then((price_splitup_model) => {
          res.send(200, { message: "You removed this product successfully" });
        })
        .catch((reason) => {
          // console.log(reason);
          res.status(500).send(reason);
        });
    } else {
      models.shopping_cart
        .destroy({
          where: {
            id: cart_id,
          },
        })
        .then((price_splitup_model) => {
          res.send(200, { message: "You removed this product successfully" });
        })
        .catch((reason) => {
          // console.log(reason);
          res.status(500).send(reason);
        });
    }
  } catch (err) {
    console.log(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Calcutta",
      }) +
        " - Error message : " +
        err
    );
  }
};
exports.updatecartitem = async (req, res) => {
  try {
    let { cart_id, product } = req.body;

    let cart = await models.shopping_cart.findByPk(cart_id);

    if (!cart) {
      return res.status(403).send({ message: "No Such Cart ID exists!" });
    } else if (cart.status != "pending") {
      return res
        .status(403)
        .send({ message: "Please check cart it's already submitted" });
    }

    // let product_in_cart = await models.shopping_cart_item.findAll({
    //   where: {
    //     shopping_cart_id: cart_id,
    //   },
    // });
    // var cartproducts = [];
    // product_in_cart.forEach((prod_element) => {
    //   cartproducts.push(prod_element.product_sku);
    // });
    // let cartlines = [];
    for (let i = 0; i < products.length; i++) {
      let product = products[i];
      let trans_sku_list = await models.trans_sku_lists.findOne({
        attributes: ["markup_price"],
        where: { generated_sku: product.sku_id },
      });
      let cart_item = await models.shopping_cart_item.findOne({
        where: { shopping_cart_id: cart_id, product_sku: product.sku_id },
      });
      if (cart_item) {
        await models.shopping_cart_item.update(
          {
            shopping_cart_id: cart_id,
            product_sku: product.sku_id,
            qty: product.qty,
            price: Number(product.qty || 1) * trans_sku_list.markup_price,
          },
          { where: { shopping_cart_id: cart_id, product_sku: product.sku_id } }
        );
      } else {
        await models.shopping_cart_item.create({
          id: uuidv1(),
          shopping_cart_id: cart_id,
          product_sku: product.sku_id,
          qty: product.qty,
          price: Number(product.qty || 1) * trans_sku_list.markup_price,
        });
      }
    }
    // products.forEach((element) => {
    //   console.log("productscart");
    //   console.log(product_in_cart.length);

    //   if (cartproducts.indexOf(element.sku_id) == -1) {
    //     console.log("updated");
    //     if (element.sku_id) {
    //       let prod_count = parseInt(element.qty);
    //       const lineobj = {
    //         id: uuidv1(),
    //         shopping_cart_id: cart_id,
    //         product_sku: element.sku_id,
    //         qty: element.qty,
    //         price: prod_count * element.price,
    //       };
    //       console.log(JSON.stringify(lineobj));

    //       cartlines.push(lineobj);
    //     }
    //   }
    //   console.log("cartline length" + cartlines.length);
    // });

    // console.log("cartline length");
    // if (cartlines.length > 0) {
    //   await models.shopping_cart_item.bulkCreate(cartlines, {
    //     individualHooks: true,
    //   });
    // }
    console.log("cartline length212");
    let gross_amount = await models.shopping_cart_item.findOne({
      attributes: [[squelize.literal("SUM(price)"), "price"]],
      where: {
        shopping_cart_id: cart_id,
      },
    });
    // console.log("cartline length");

    await models.shopping_cart
      .update(
        {
          gross_amount: gross_amount.price,
          net_amount: gross_amount.price,
          discount: 0,
          discounted_price: gross_amount.price,
        },
        {
          where: { id: cart_id },
        }
      )
      .then((price_splitup_model) => {
        res.send(200, { message: "Update product successfully" });
      })
      .catch((reason) => {
        // console.log(reason);
      });
  } catch (err) {
    console.log(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Calcutta",
      }) +
        " - Error message : " +
        err
    );
  }
};
exports.addtocart = async (req, res) => {
  try {
    let createNewCart = () => {
      return new Promise(async (resolve, reject) => {
        try {
          const cartobj = {
            id: uuidv1(),
            userprofile_id: user_id,
            status: "pending",
          };
          let new_cart = await models.shopping_cart.create(cartobj, {
            returning: true,
          });
          resolve(new_cart.id);
        } catch (err) {
          reject(err);
        }
      });
    };

    let { user_id, products, cart_id } = req.body;

    try {
      if (cart_id) {
        let cart = await models.shopping_cart.findByPk(cart_id);
        if (!cart) {
          return res.status(403).send({ message: "Something went wrong!" });
        } else if (cart.status != "pending") {
          cart_id = await createNewCart();
        }
      } else {
        cart_id = await createNewCart();
      }

      // let product_in_cart = await models.shopping_cart_item.findAll({
      //   where: {
      //     shopping_cart_id: cart_id,
      //   },
      // });
      // var cartproducts = [];
      // product_in_cart.forEach((prod_element) => {
      //   cartproducts.push(prod_element.product_sku);
      // });
      // let cartlines = [];

      for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let trans_sku_list = await models.trans_sku_lists.findOne({
          attributes: ["markup_price"],
          where: { generated_sku: product.sku_id },
        });
        let cart_item = await models.shopping_cart_item.findOne({
          where: { shopping_cart_id: cart_id, product_sku: product.sku_id },
        });
        if (cart_item) {
          await models.shopping_cart_item.update(
            {
              shopping_cart_id: cart_id,
              product_sku: product.sku_id,
              qty: product.qty,
              price: Number(product.qty || 1) * trans_sku_list.markup_price,
            },
            {
              where: { shopping_cart_id: cart_id, product_sku: product.sku_id },
            }
          );
        } else {
          await models.shopping_cart_item.create({
            id: uuidv1(),
            shopping_cart_id: cart_id,
            product_sku: product.sku_id,
            qty: product.qty,
            price: Number(product.qty || 1) * trans_sku_list.markup_price,
          });
        }
      }

      // products.forEach((element) => {
      //   // console.log("productscart");
      //   // console.log(product_in_cart.length);

      //   if (cartproducts.indexOf(element.sku_id) == -1) {
      //     // console.log("updated");
      //     if (element.sku_id) {
      //       let prod_count = parseInt(element.qty);
      //       const lineobj = {
      //         id: uuidv1(),
      //         shopping_cart_id: cart_id,
      //         product_sku: element.sku_id,
      //         qty: element.qty,
      //         price: prod_count * element.price,
      //       };
      //       // console.log(JSON.stringify(lineobj));

      //       cartlines.push(lineobj);
      //     }
      //   }
      //   console.log("cartline length" + cartlines.length);
      // });

      // console.log("cartline length");
      // if (cartlines.length > 0) {
      //   await models.shopping_cart_item.bulkCreate(cartlines, {
      //     individualHooks: true,
      //   });
      // }

      // console.log("cartline length212");
      let gross_amount = await models.shopping_cart_item.findOne({
        attributes: [[squelize.literal("SUM(price)"), "price"]],
        where: {
          shopping_cart_id: cart_id,
        },
      });
      // console.log("cartline length");

      await models.shopping_cart
        .update(
          {
            gross_amount: gross_amount.price,
            net_amount: gross_amount.price,
            discount: 0,
            discounted_price: gross_amount.price,
          },
          {
            where: { id: cart_id },
          }
        )
        .then((price_splitup_model) => {
          res.send(200, { cart_id });
        })
        .catch((reason) => {
          console.log(reason);
        });
    } catch (error) {
      console.log(error);
    }
  } catch (err) {
    console.log(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Calcutta",
      }) +
        " - Error message : " +
        err
    );
  }
};
exports.uploadimage = (req, res) => {
  console.log(req.body);
  const { foldername } = req.body;
  let extension = req.body.image;

  let basefolder = `products`;
  basefolder = `${process.env.NODE_ENV}/${basefolder}`;

  if (foldername) {
    basefolder = foldername;
  }
  const s3 = new aws.S3(); // Create a new instance of S3
  const fileName =
    basefolder +
    "/" +
    req.body.filename +
    "." +
    extension.replace("jpeg", "jpg").toLowerCase();
  const fileType = req.body.image;
  console.log(fileName);

  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: "public-read",
  };
  s3.getSignedUrl("putObject", s3Params, (err, data) => {
    if (err) {
      console.log(data);
      res.json({ success: false, error: err });
      return false;
    }
    // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved.
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`,
      filepath: `${fileName}`,
    };
    // Send it all back
    res.json({ success: true, data: { returnData } });
  });
};
exports.adduseraddress = async (req, res) => {
  let { user_id, address, id } = req.body;
  address.forEach(async (element) => {
    var address_obj = {};
    if (!id) {
      address_obj = {
        id: uuidv1(),
        userprofile_id: user_id,
        firstname: element.firstname,
        lastname: element.lastname,
        pincode: element.pincode,
        addressline1: element.addressline1,
        addressline2: element.addressline2,
        city: element.city,
        state: element.state,
        country: element.country,
        country_code: element.country_code,
        contact_number: element.contactno,
        address_type: element.addresstype,
        salutation: element.salutation,
        is_active: true,
        default_billing: false,
        default_shipping: false,
      };
    } else {
      address_obj = {
        userprofile_id: user_id,
        firstname: element.firstname,
        lastname: element.lastname,
        pincode: element.pincode,
        addressline1: element.addressline1,
        addressline2: element.addressline2,
        city: element.city,
        salutation: element.salutation,
        state: element.state,
        country: element.country,
        country_code: element.country_code,
        contact_number: element.contactno,
        address_type: element.addresstype,
        default_billing: false,
        is_active: true,
        default_shipping: false,
      };
    }
    console.log(JSON.stringify(address_obj));
    if (id) {
      let branchobj = await models.user_address.update(address_obj, {
        returning: true,
        where: {
          id,
        },
      });
      res.send(200, { message: "updated successfully", branchobj });
    } else {
      let response = await models.user_address.create(address_obj);
      res.send(200, { message: "added successfully" });
    }
  });
};

exports.removeaddress = async (req, res) => {
  let { address_id } = req.body;
  const add_wishlist = {
    is_active: false,
  };
  models.user_address
    .update(add_wishlist, {
      returning: true,
      where: {
        id: address_id,
      },
    })
    .then(function (response) {
      res.send(200, { message: "updated successfully" });
    })
    .catch((reason) => {
      res.send(500, { message: "Error Please try again" });
      console.log(reason);
    });
};
async function updateshippingcharge(cart_id, res) {
  let cart = await models.shopping_cart.findByPk(cart_id, {
    include: {
      model: models.cart_address,
      required: false,
      where: {
        cart_id,
        address_type: {
          [models.Sequelize.Op.in]: [1, 3],
        },
      },
    },
  });

  if (!cart) {
    return res.status(403).send({ message: "No such cart exists!" });
  }
  let charges, final_shipping_charge;
  if (cart && cart.cart_addresses && cart.cart_addresses.length) {
    charges = await models.shipping_charges.findOne({
      attributes: ["shipment_charge"],
      include: {
        required: true,
        attributes: ["name"],
        model: models.shipping_zones,
        include: {
          model: models.master_countries,
          attributes: [],
          required: true,
          through: {
            attributes: [],
          },
          where: {
            name: {
              [models.Sequelize.Op.iLike]: cart.cart_addresses[0].country,
            },
          },
        },
      },
      where: {
        is_active: true,
        is_cart: true,
        range_from: {
          [models.Sequelize.Op.lte]: cart.net_amount,
        },
        range_to: {
          [models.Sequelize.Op.gte]: cart.net_amount,
        },
      },
    });
    charges = JSON.parse(JSON.stringify(charges));
    if (charges) {
      final_shipping_charge = charges.shipment_charge;
    }
    //updating cart with shipping_charge
    await models.shopping_cart.update(
      {
        shipping_charge: final_shipping_charge,
        gross_amount: Number(cart.net_amount) + Number(final_shipping_charge),
        discount_price:
          Number(cart.discount_price) + Number(final_shipping_charge),
      },
      {
        where: { id: cart_id },
      }
    );
  } else {
    return res.status(200).send({
      ...charges,
      shipping_charge: "Free",
    });
  }
  res.status(200).send({
    ...charges,
    shipping_charge:
      final_shipping_charge == 0 ? "Free" : final_shipping_charge,
  });
}
exports.getshippingcharge = async (req, res) => {
  const { cart_id } = req.body;

  // res.send(200, { shipping_charge: "Free" });

  await updateshippingcharge(cart_id, res);
};
exports.addaddress = async (req, res) => {
  let { user_id, address, cart_id, isguestlogin } = req.body;

  let address_arr = [];
  let add_user_address = [];

  address.forEach((element) => {});
  processaddress(0);
  async function processaddress(addresscount) {
    let element = address[addresscount];

    let cart_address_val = await models.cart_address.findOne({
      where: {
        cart_id: cart_id,
        address_type: element.addresstype,
      },
    });

    if (!cart_address_val) {
      const address_obj = {
        id: uuidv1(),
        cart_id: cart_id,
        userprofile_id: user_id,
        firstname: element.firstname,
        lastname: element.lastname,
        pincode: element.pincode,
        addressline1: element.addressline1,
        addressline2: element.addressline2,
        city: element.city,
        state: element.state,
        country: element.country,
        country_code: element.country_code,
        contact_number: element.contactno,
        address_type: element.addresstype,
        salutation: element.salutation,
      };
      address_arr.push(address_obj);
      if (!element.address_id && !isguestlogin) {
        const user_address_obj = {
          id: uuidv1(),
          userprofile_id: user_id,
          firstname: element.firstname,
          lastname: element.lastname,
          pincode: element.pincode,
          addressline1: element.addressline1,
          addressline2: element.addressline2,
          city: element.city,
          state: element.state,
          country: element.country,
          country_code: element.country_code,
          contact_number: element.contactno,
          address_type: element.addresstype,
          default_billing: false,
          default_shipping: false,
          salutation: element.salutation,
        };
        add_user_address.push(user_address_obj);
      }
    } else {
      let updateactiveskus = await models.cart_address.update(
        {
          userprofile_id: user_id,
          firstname: element.firstname,
          lastname: element.lastname,
          pincode: element.pincode,
          addressline1: element.addressline1,
          addressline2: element.addressline2,
          city: element.city,
          state: element.state,
          country: element.country,
          country_code: element.country_code,
          contact_number: element.contactno,
          address_type: element.addresstype,
          salutation: element.salutation,
        },
        {
          where: {
            cart_id: cart_id,
          },
        }
      );
    }
    addresscount = addresscount + 1;

    if (address.length > addresscount) {
      processaddress(addresscount);
    } else {
      console.log(address_arr.length);
      console.log(JSON.stringify(address_arr));

      if (add_user_address.length > 0) {
        await models.user_address
          .bulkCreate(add_user_address, { individualHooks: true })
          .then(function (response) {});
      }
      models.cart_address
        .bulkCreate(address_arr, { individualHooks: true })
        .then(function (response) {
          res.send(200, {
            message: "updated successfully",
            shippingcharge: "200",
          });
        })
        .catch((reason) => {
          res.send(500, { message: "Error Please try again" });
          console.log(reason);
        });
    }
  }
};

exports.addwishlist = async (req, res) => {
  let { user_id, product_id, product_sku } = req.body;
  const add_wishlist = {
    id: uuidv1(),
    product_id: product_id,
    userprofile_id: user_id,
    sku_id: product_sku,
    is_active: true,
  };
  let wishlistobj = await models.user_whislists.findAll({
    where: {
      product_id: product_id,
      userprofile_id: user_id,
      sku_id: product_sku,
    },
  });
  if (wishlistobj && wishlistobj.length > 0) {
    let branchobj = await models.user_whislists
      .update(
        { is_active: true },
        {
          returning: true,
          where: {
            product_id: product_id,
            userprofile_id: user_id,
            sku_id: product_sku,
          },
        }
      )
      .then(function (response) {
        res.send(200, { message: "updated successfully" });
      })
      .catch((reason) => {
        res.send(500, { message: "Error Please try again" });
        console.log(reason);
      });
  } else {
    models.user_whislists
      .create(add_wishlist, {
        returning: true,
      })
      .then(function (response) {
        res.send(200, { message: "added successfully" });
      })
      .catch((reason) => {
        res.send(500, { message: "Error Please try again" });
        console.log(reason);
      });
  }
};

exports.removewishlist = async (req, res) => {
  let { user_id, product_id, product_sku } = req.body;
  const add_wishlist = {
    is_active: false,
  };
  let branchobj = await models.user_whislists
    .update(add_wishlist, {
      returning: true,
      where: {
        product_id: product_id,
        userprofile_id: user_id,
        sku_id: product_sku,
      },
    })
    .then(function (response) {
      res.send(200, { message: "updated successfully" });
    })
    .catch((reason) => {
      res.send(500, { message: "Error Please try again" });
      console.log(reason);
    });
};
exports.addorder = async (req, res) => {
  try {
    let countries = await loadCountries();
    let { user_id, cart_id, payment_mode, voucher_code } = req.body;

    //Getting Cart Details and Address Details
    let cartDetails = await models.shopping_cart.findByPk(cart_id, {
      include: {
        model: models.cart_address,
        where: {
          address_type: 1,
        },
      },
      plain: true,
    });

    //Getting Order Details if already created for this cart to avoid duplicates
    let orderDetails = await models.orders.findOne({
      where: {
        cart_id,
        payment_mode,
      },
      plain: true,
    });

    let address = cartDetails?.cart_addresses[0];
    if (!address) {
      return res
        .status(403)
        .send({ error: true, message: "No Cart Address found!" });
    }
    let country_data = countries[address.country.toLowerCase()];
    var paymentstatus = "Initiated";
    var orderstatus = "Initiated";
    if (payment_mode === "COD") {
      paymentstatus = "Submitted";
      orderstatus = "Submitted";
    }
    if (payment_mode == "Offline") {
      paymentstatus = "Submitted";
      orderstatus = "Submitted";
    }
    const order_bj = {
      id: uuidv1(),
      cart_id: cart_id,
      user_profile_id: user_id,
      payment_mode: payment_mode,
      payment_status: paymentstatus,
      order_status: orderstatus,
      currency: country_data.currency_alias,
      fx_conversion_rate: country_data.fx_conversion_rate,
    };
    const update_cartstatus = {
      status: "submitted",
    };
    let updatecart = await models.shopping_cart.update(update_cartstatus, {
      returning: true,
      where: {
        id: cart_id,
      },
    });

    if (orderDetails) {
      if (payment_mode === "COD" || payment_mode == "Offline") {
        sendorderconformationemail(orderDetails.id, res);
      } else {
        res.status(200).send({
          message: "Order placed successfully",
          order: orderDetails,
        });
      }
    } else {
      models.orders
        .create(order_bj, {
          returning: true,
        })
        .then(async function (response) {
          if (voucher_code) {
            // let discountendamount  = eligible_amount * discountpercent;

            var query =
              "UPDATE vouchers SET uses = (uses + 1) where code ='" +
              voucher_code.toUpperCase() +
              "'";
            // console.log("-------");
            // console.log(query);
            await models.sequelize.query(query).then(([results, metadata]) => {
              // Results will be an empty array and metadata will contain the number of affected rows.
            });
          }
          if (payment_mode === "COD" || payment_mode == "Offline") {
            sendorderconformationemail(order_bj.id, res);
          } else {
            res.send(200, {
              message: "Order placed successfully",
              order: response,
            });
          }
        })
        .catch((reason) => {
          res.send(500, { message: "Error Please try again" });
          console.log(reason);
        });
    }
  } catch (err) {
    console.log(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Calcutta",
      }) +
        " - Error message : " +
        err
    );
  }
};
exports.testorderemail = async (req, res) => {
  var emilreceipiants = [
    { to: "manokarantk@gmail.com", subject: "Password Reset Successfully" },
  ];
  // sendMail(emilreceipiants,emailTemp.changepasswordTemp("Manokaran"))
  sendorderconformationemail("9cb91100-b083-11ea-82de-63badb42bd5b", res);
};
async function sendorderconformationemail(order_id, res) {
  sendOrderConfirmation({ order_id: order_id })
    .then(async (orderdetails) => {
      let {
        id,
        user_profile: { mobile },
        shopping_cart: { cart_addresses, discounted_price },
      } = orderdetails;

      let msg_txt = `Dear ${cart_addresses[0].firstname}, Your order ID ${id
        .split("-")
        .pop()} is confirmed. Total Amount, ${discounted_price}. Thank you for shopping with NAC Jewellers. Customer care: 044 43996666`;

      // console.log(msg_txt);
      let smsResponse = await send_sms({
        mobile_no: `91${cart_addresses[0].contact_number || mobile}`,
        msg_txt,
        sender_id: "NACJWL",
      });

      await models.communication_log.create({
        order_id,
        type: "sms",
        message_type: "order",
        sender_response_id: smsResponse.data.respid,
      });

      if (res) {
        return res.send(200, { order: orderdetails });
      }
    })
    .catch((error) => {
      console.error(error);
      if (res) return res.send(500, { ...error });
    });
}

exports.addproductreview = async (req, res) => {
  let { user_id, username, rate, product_id, product_sku, title, message } =
    req.body;
  let userreviews = await models.customer_reviews.findAll({
    where: {
      product_sku,
      userprofile_id: user_id,
    },
  });
  if (!userreviews || userreviews.length === 0) {
    const review_content = {
      id: uuidv1(),
      product_id: product_id,
      product_sku: product_sku,
      customer_name: username,
      userprofile_id: user_id,
      title: title,
      message: message,
      rating: rate,
      is_publish: false,
      is_active: true,
    };

    models.customer_reviews
      .create(review_content, {
        returning: true,
      })
      .then(function (response) {
        res.send(200, {
          message:
            "Your review has been sent to our team. Will post it soon. Thanks!",
        });
      })
      .catch((reason) => {
        res.send(500, { message: "Error Please try again" });
        console.log(reason);
      });
  } else {
    res.send(409, { message: "You have reviewed this product already." });
  }
};

exports.updatecart_latestprice = async (req, res) => {
  let { cart_id, user_id } = req.body;
  let condition = {};
  if (cart_id) {
    condition["id"] = cart_id;
  }
  if (user_id) {
    condition["userprofile_id"] = user_id;
  }
  try {
    let cart = await models.shopping_cart.findOne({
      where: { ...condition, status: "pending" },
      raw: true,
      order: [["createdAt", "desc"]],
    });
    if (!cart) {
      res.status(200).send({ message: "No Cart Found!" });
      return;
    }

    /* Update Cart Items to latest price based on SKUs*/
    await models.sequelize.query(`update shopping_cart_items i 
      set price = qty * (select markup_price from trans_sku_lists t
      where i.product_sku = t.generated_sku)
      where shopping_cart_id = '${cart.id}'`);
    /* Update Cart with latest prices*/
    await models.sequelize.query(`update shopping_carts c set 
      gross_amount = (select sum(price) from shopping_cart_items i where i.shopping_cart_id = '${cart.id}'),
      discounted_price = (select sum(price) from shopping_cart_items i where i.shopping_cart_id = '${cart.id}')
      where id = '${cart.id}'`);

    res.status(200).send({ message: "Cart Updated Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
};

exports.payment_ipn_callback = async (req, res) => {
  let { TRANSACTIONID } = req.body;
  let { id: order_id } = await models.orders.findOne({
    where: {
      payment_id: TRANSACTIONID,
    },
  });
  if (order_id) {
    let paymentcontent = {
      order_id: order_id,
      payment_response: JSON.stringify(req.body),
    };
    let new_cart = await models.payment_details.create(paymentcontent, {
      returning: true,
    });
  }
  res.status(200).send({ message: "Added Payment Details successfully!" });
};

exports.trigger_mail = async (req, res) => {
  let { order_id, type } = req.body;
  try {
    if (type === "order") {
      await sendorderconformationemail(order_id);
    }
    if (type === "shipping") {
      await sendShippingConfirmation({ order_id });
    }
    if (type === "rate") {
      await sendRateProduct({ order_id });
    }
    if (type === "payment") {
      await sendPaymentConfimed({ order_id });
    }
    if (type === "abandoned_cart") {
      return res
        .status(200)
        .send(await sendAbandonedCart({ cart_id: order_id }));
    }
    if (type === "appointment_otp") {
      await sendAppointmentOTP({ ...req.body });
    }
    if (type === "appointment_confirmation") {
      return res
        .status(200)
        .send(await sendAppointmentConfirmation({ ...req.body }));
    }
    res.status(200).send({ message: "mail triggered successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ...error });
  }
};

exports.syncFxRate = (req, res) => {
  let syncSourceURL = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/`;
  models.master_countries
    .findAll({
      attributes: ["id", "currency_alias"],
      raw: true,
    })
    .then((countries) => {
      Promise.all(
        countries.map(async ({ id, currency_alias }) => {
          axios
            .get(`${syncSourceURL}${currency_alias.toLowerCase()}.json`)
            .then(async (res) => {
              if (res.status == 200)
                await models.master_countries.update(
                  {
                    fx_conversion_rate: Number(
                      res.data[currency_alias.toLowerCase()]["inr"]
                    ).toFixed(2),
                  },
                  {
                    where: { id },
                  }
                );
            })
            .catch((err) => {
              console.log(err);
            });
          return Promise.resolve("Completed " + currency_alias + " Sync!");
        })
      )
        .then(() => {
          res
            .status(200)
            .send({ message: "Fx Sync for all countries completed!" });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ ...err });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ ...err });
    });
};

exports.getPincodeDetails = ({ pincode /* country_short_code */ }) => {
  return new Promise(async (resolve, reject) => {
    // let country_master = await models.master_countries.findOne({
    //   attributes: ["nicename"],
    //   where: {
    //     iso: country_short_code,
    //     is_active: true,
    //   },
    // });
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${process.env.GOOGLE_GEOLOCATION_KEY}`
        // `https://api.worldpostallocations.com/?postalcode=${pincode}&countrycode=${country_short_code}`
      )
      .then(async ({ data: { status, results } }) => {
        if (status == "OK") {
          let pincode_master = await models.pincode_master.findOne({
            where: { pincode },
          });
          if (!pincode_master) {
            let { address_components } = results[0];
            let pincodeObject = {
              id: uuidv1(),
              pincode,
              is_cod: true,
              is_delivery: true,
              is_active: true,
              min_cartvalue: 5000,
              max_cartvalue: 85000,
            };
            address_components = address_components.reverse();
            if (address_components.length == 4) {
              ["country", "state", "district"].forEach((item, index) => {
                pincodeObject[item] = address_components[index]?.long_name;
              });
            } else {
              ["country", "state", "district", "area"].forEach(
                (item, index) => {
                  let temp = index;
                  if (item == "area") {
                    temp += 1;
                  }
                  pincodeObject[item] = address_components[temp]?.long_name;
                }
              );
            }

            await models.pincode_master.create(pincodeObject);
          }
          resolve({ status, results });
        } else {
          reject({ status });
        }
      })
      .catch(reject);
  });
};

const Geonames = require("geonames.js"); /* commonJS */
const geonames = Geonames({
  username: "nac_jewellers",
  lan: "en",
  encoding: "JSON",
});

exports.syncPincode = ({ pincode }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // const countryList = await loadCountries();
      // let countries = await geonames.countryInfo({});
      // countries = countries.geonames.filter((i) =>
      //   [
      //     ,
      //     // ...Object.keys(countryList)
      //     "united arab emirates",
      //   ].includes(i.countryName.toLowerCase())
      // );
      // resolve(countries)
      // let response = {};
      geonames
        .postalCodeSearch({
          postalcode: pincode,
          countryCode: "AU",
        })
        .then((result) => {
          console.log(result.postalCodes.length);
          resolve(result);
        })
        .catch(reject);
      // Promise.allSettled(
      //   countries.map(async (country) => {
      //     let states = await geonames.children({
      //       geonameId: country.geonameId,
      //     });
      //     await Promise.allSettled(
      //       states.geonames.map(async (state) => {
      //         let regions = await geonames.children({
      //           geonameId: state.geonameId,
      //         });
      //         await Promise.allSettled(
      //           regions.geonames.map(async (region) => {
      //             const cities = await geonames.children({
      //               geonameId: region.geonameId,
      //             });
      //             if (Array.isArray(response[country.countryCode])) {
      //               response[country.countryCode].push(cities.geonames);
      //             } else {
      //               response[country.countryCode] = [cities.geonames];
      //             }
      //           })
      //         );
      //       })
      //     );
      //   })
      // )
      //   .then(() => {
      //     resolve(response);
      //   })
      //   .catch((err) => {
      //     reject(err);
      //   });
    } catch (error) {
      reject(error);
    }
  });
};
