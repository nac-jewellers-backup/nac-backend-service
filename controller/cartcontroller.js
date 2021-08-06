import crypto from "crypto-random-string";
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
import { sendMail } from "./notify/user_notify";
dotenv.config();
aws.config.update({
  region: "ap-south-1", // Put your aws region here
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});
const S3_BUCKET = process.env.AWS_IMAGE_BUCKET_NAME;

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
            ") where id ='" +
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
            ") where id ='" +
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
};
exports.paymentsuccess = async (req, res) => {
  let paymentcontent = {
    order_id: req.body.oid,
    payment_response: JSON.stringify(req.body),
  };
  let orderobj = await models.orders.findOne({
    where: {
      id: req.body.oid,
    },
  });
  const update_cartstatus = {
    status: "paid",
  };
  let updatecart = await models.shopping_cart.update(update_cartstatus, {
    returning: true,
    where: {
      id: orderobj.cart_id,
    },
  });
  let new_cart = await models.payment_details.create(paymentcontent, {
    returning: true,
  });
  sendorderconformationemail(req.body.oid);
  let redirectionurl = process.env.baseurl + "/paymentsuccess/" + req.body.oid;

  return res.redirect(redirectionurl);
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
  console.log(JSON.stringify(req.body));
  if (req.body && req.body.oid) {
    let orderobj = await models.orders.findOne({
      where: {
        id: req.body.oid,
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
      order_id: req.body.oid,
      payment_response: JSON.stringify(req.body),
    };

    let new_cart = await models.payment_details.create(paymentcontent, {
      returning: true,
    });
    let redirectionurl = process.env.baseurl + "/paymentfail/" + req.body.oid;
    return res.redirect(redirectionurl);
  } else {
    let redirectionurl = process.env.baseurl + "/paymentfail/" + 1;
    return res.redirect(redirectionurl);
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
  let { cart_id, product_id } = req.body;
  await models.shopping_cart_item.destroy({
    where: {
      shopping_cart_id: cart_id,
      product_sku: product_id,
    },
  });

  let gross_amount = await models.shopping_cart_item.findOne({
    attributes: [[squelize.literal("SUM(price)"), "price"]],
    where: {
      shopping_cart_id: cart_id,
    },
  });
  console.log("cartline length");

  await models.shopping_cart
    .update(
      {
        gross_amount: gross_amount.price,
        discounted_price: gross_amount.price,
        discount: 0,
      },
      {
        where: { id: cart_id },
      }
    )
    .then((price_splitup_model) => {
      res.send(200, { message: "You removed this product successfully" });
    })
    .catch((reason) => {
      console.log(reason);
    });
};
exports.updatecartitem = async (req, res) => {
  let { cart_id, product } = req.body;

  let prod_count = parseInt(product.qty);
  await models.shopping_cart_item.update(
    {
      qty: product.qty,
      price: prod_count * product.price,
    },
    {
      where: {
        shopping_cart_id: cart_id,
        product_sku: product.sku_id,
      },
    }
  );

  let gross_amount = await models.shopping_cart_item.findOne({
    attributes: [[squelize.literal("SUM(price)"), "price"]],
    where: {
      shopping_cart_id: cart_id,
    },
  });
  console.log("cartline length");

  await models.shopping_cart
    .update(
      {
        gross_amount: gross_amount.price,
        discounted_price: gross_amount.price,
        discount: 0,
      },
      {
        where: { id: cart_id },
      }
    )
    .then((price_splitup_model) => {
      res.send(200, { message: "Update product successfully" });
    })
    .catch((reason) => {
      console.log(reason);
    });
};
exports.addtocart = async (req, res) => {
  let { user_id, products, cart_id } = req.body;
  console.log(JSON.stringify(req.body));
  if (!cart_id) {
    const cartobj = {
      id: uuidv1(),
      userprofile_id: user_id,
      status: "pending",
    };
    let new_cart = await models.shopping_cart.create(cartobj, {
      returning: true,
    });
    cart_id = new_cart.id;
  }
  let product_in_cart = await models.shopping_cart_item.findAll({
    where: {
      shopping_cart_id: cart_id,
    },
  });
  var cartproducts = [];
  product_in_cart.forEach((prod_element) => {
    cartproducts.push(prod_element.product_sku);
  });
  let cartlines = [];
  products.forEach((element) => {
    console.log("productscart");
    console.log(product_in_cart.length);

    if (cartproducts.indexOf(element.sku_id) == -1) {
      console.log("updated");
      if (element.sku_id) {
        let prod_count = parseInt(element.qty);
        const lineobj = {
          id: uuidv1(),
          shopping_cart_id: cart_id,
          product_sku: element.sku_id,
          qty: element.qty,
          price: prod_count * element.price,
        };
        console.log(JSON.stringify(lineobj));

        cartlines.push(lineobj);
      }
    }
    console.log("cartline length" + cartlines.length);
  });

  console.log("cartline length");
  if (cartlines.length > 0) {
    await models.shopping_cart_item.bulkCreate(cartlines, {
      individualHooks: true,
    });
  }

  console.log("cartline length212");
  let gross_amount = await models.shopping_cart_item.findOne({
    attributes: [[squelize.literal("SUM(price)"), "price"]],
    where: {
      shopping_cart_id: cart_id,
    },
  });
  console.log("cartline length");

  await models.shopping_cart
    .update(
      {
        gross_amount: gross_amount.price,
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
};
exports.uploadimage = (req, res) => {
  console.log(req.body);
  const { foldername } = req.body;
  let extension = req.body.image;
  let basefolder = "base_images";
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
  let cartaddress = await models.cart_address.findOne({
    where: {
      cart_id: cart_id,
      address_type: 1,
    },
  });
  let shippingcountry = cartaddress.country;
  let countryid = await models.master_countries.findOne({
    where: {
      name: shippingcountry.toUpperCase(),
    },
  });
  let zones = await models.shipping_zone_countries.findAll({
    where: {
      country_id: countryid.id,
    },
  });

  let zoneids = [];
  zones.forEach((zoneobj) => {
    zoneids.push(zoneobj.id);
  });

  let products = await models.shopping_cart_item.findAll({
    where: {
      shopping_cart_id: cart_id,
    },
  });
  if (products.length > 0) {
    processskus(0);
  }
  async function processskus(skucount) {
    let attributes_condition = [];
    let itemobj = products[skucount];
    let product_attributes1 = await models.product_lists.findOne({
      hierarchy: true,
      attributes: ["product_id", "product_category", "product_type"],
      include: [
        {
          model: models.trans_sku_lists,
          attributes: ["purity", "generated_sku"],
          include: [
            {
              model: models.master_metals_purities,
              attributes: ["alias"],
            },
          ],
          where: {
            generated_sku: itemobj.product_sku,
          },
        },
        {
          model: models.master_product_categories,
          attributes: ["alias"],
        },
        {
          model: models.master_product_types,
          attributes: ["alias"],
        },
        {
          model: models.product_materials,
          attributes: ["material_name"],
          include: [
            {
              model: models.master_materials,
              attributes: ["alias"],
            },
          ],
        },
        {
          model: models.product_collections,
          attributes: ["collection_name"],
          include: [
            {
              model: models.master_collections,
              attributes: ["alias"],
            },
          ],
        },
        {
          model: models.product_occassions,
          attributes: ["occassion_name"],
          include: [
            {
              model: models.master_occasions,
              attributes: ["alias"],
            },
          ],
        },
        {
          model: models.product_gemstones,
          attributes: ["gemstone_type"],
          include: [
            {
              model: models.master_gemstones_types,
              attributes: ["alias"],
            },
          ],
        },
        {
          model: models.product_styles,
          attributes: ["style_name"],
          include: [
            {
              model: models.master_styles,
              attributes: ["alias"],
            },
          ],
        },
        {
          model: models.product_themes,
          attributes: ["theme_name"],
          include: [
            {
              model: models.master_themes,
              attributes: ["alias"],
            },
          ],
        },
        {
          model: models.product_stonecolor,
        },
        {
          model: models.product_gender,
        },
      ],
    });
    delete product_attributes1["dataValues"];
    delete product_attributes1["_previousDataValues"];
    delete product_attributes1["_modelOptions"];
    delete product_attributes1["_options"];
    delete product_attributes1["isNewRecord"];
    delete product_attributes1["_changed"];

    let keys = Object.keys(product_attributes1);
    let attributes = {};
    function isJson(str) {
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    }

    keys.forEach((element) => {
      if (product_attributes1[element]) {
        let attributeobj = product_attributes1[element];

        if (Array.isArray(attributeobj)) {
          let attributes_value = [];

          attributeobj.forEach((attr_obj) => {
            delete attr_obj["dataValues"];
            delete attr_obj["_previousDataValues"];
            delete attr_obj["_modelOptions"];
            delete attr_obj["_options"];
            delete attr_obj["isNewRecord"];
            delete attr_obj["_changed"];
            let nestkeys = Object.keys(attr_obj);
            nestkeys.forEach((aliasobj) => {
              if (isJson(JSON.stringify(attr_obj[aliasobj]))) {
                attributes_value.push(attr_obj[aliasobj].alias);
                // attributes[element+"_key"] = attr_obj[aliasobj]
              }
            });
            // attributes[element] = attr_obj
          });

          attributes[element] = attributes_value;
        } else {
          let attributes_value = [];
          attributes_value.push(attributeobj.alias);
          attributes[element] = attributes_value;
        }
      }
    });

    let attrkeys = Object.keys(attributes);
    attrkeys.forEach((key) => {
      let attributeobj = attributes[key];
      if (Array.isArray(attributeobj)) {
        if (attributeobj.length > 0) {
          console.log(attributeobj);
          let attrobj = {
            [Op.or]: attributeobj,
          };
          attributes_condition.push(attrobj);
        }
      }
    });
    res.send(200, { attributes });
  }
}
exports.getshippingcharge = async (req, res) => {
  const { cart_id } = req.body;

  res.send(200, { shipping_charge: "Free" });

  //await updateshippingcharge(cart_id,res)
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
  let { user_id, cart_id, payment_mode, voucher_code } = req.body;
  var paymentstatus = "Initiated";
  var orderstatus = "Initiated";
  if (payment_mode === "COD") {
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
        console.log("-------");
        console.log(query);
        await models.sequelize.query(query).then(([results, metadata]) => {
          // Results will be an empty array and metadata will contain the number of affected rows.
        });
      }

      if (payment_mode === "COD") {
        sendorderconformationemail(order_bj.id);
      }
      res.send(200, { message: "Order placed successfully", order: response });
    })
    .catch((reason) => {
      res.send(500, { message: "Error Please try again" });
      console.log(reason);
    });
};
exports.testorderemail = async (req, res) => {
  var emilreceipiants = [
    { to: "manokarantk@gmail.com", subject: "Password Reset Successfully" },
  ];
  // sendMail(emilreceipiants,emailTemp.changepasswordTemp("Manokaran"))
  sendorderconformationemail("9cb91100-b083-11ea-82de-63badb42bd5b", res);
};
async function sendorderconformationemail(order_id, res) {
  var addresstypes = [1, 3];
  let orderdetails = await models.orders.findOne({
    include: [
      { model: models.user_profiles },
      {
        model: models.shopping_cart,
        include: [
          {
            model: models.cart_address,
            where: {
              address_type: {
                [Op.in]: addresstypes,
              },
            },
          },
          {
            model: models.shopping_cart_item,
            include: [
              {
                model: models.trans_sku_lists,
              },
            ],
          },
        ],
      },
    ],
    where: {
      id: order_id,
    },
  });
  var day = "";
  if (orderdetails) {
    day = moment
      .tz(orderdetails.updatedAt, "Asia/Kolkata")
      .format("DD MMM YYYY HH:mm:ss");
  }
  var trans_sku_lists = [];
  var prod_image_condition = [];
  console.log("orderinfodetails");
  console.log(JSON.stringify(orderdetails));
  let skuqty = {};
  orderdetails.shopping_cart.shopping_cart_items.forEach((element) => {
    trans_sku_lists.push(element.product_sku);
    skuqty[element.product_sku] = element.qty;
    prod_image_condition.push({
      product_color: element.trans_sku_list.metal_color,
      product_id: element.trans_sku_list.product_id,
      image_position: 1,
    });
    // console.log(element.metal_color)
  });
  let skudetails = await models.trans_sku_lists.findAll({
    include: [
      {
        model: models.product_lists,
        include: [
          {
            model: models.product_gemstones,
          },
        ],
      },
    ],
    where: {
      generated_sku: {
        [Op.in]: trans_sku_lists,
      },
    },
  });

  var imagelist = {};
  let prodimages = await models.product_images.findAll({
    attributes: [
      "product_id",
      "product_color",
      "image_url",
      "image_position",
      "isdefault",
    ],
    where: {
      [Op.or]: prod_image_condition,
    },
    order: [["image_position", "ASC"]],
  });
  prodimages.forEach((element) => {
    var imagename = element.image_url.replace(
      element.product_id,
      element.product_id + "/1000X1000"
    );

    imagelist[element.product_id] =
      "https://styloriimages.s3.ap-south-1.amazonaws.com/" + imagename;
  });

  var emilreceipiants = [
    {
      to: orderdetails.user_profile.email,
      subject: "Order Placed Successfully",
    },
    { to: process.env.adminemail, subject: "Order Placed Successfully" },
  ];
  // var emilreceipiants = [{to :"manokarantk@gmail.com" ,subject:"Order Placed Successfully"}]
  var isloggedin = false;
  if (
    orderdetails.user_profile.facebookid ||
    orderdetails.user_profile.user_id
  ) {
    isloggedin = true;
  }
  sendMail(
    emilreceipiants,
    emailTemp.orderConformation(
      "",
      process.env.adminemail,
      orderdetails,
      skudetails,
      imagelist,
      day,
      isloggedin,
      skuqty
    )
  );
  //return res.send(200,{orderdetails,skudetails,prodimages,imagelist})
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
