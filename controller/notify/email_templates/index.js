const ejs = require("ejs");
const path = require("path");
const models = require("./../../../models");
const moment = require("moment");
import { getShippingDate } from "../../inventorycontroller";
const { sendMail } = require("../user_notify");
var addresstypes = [1, 3];

let createTemplate = ({ type, data }) => {
  return new Promise((resolve, reject) => {
    ejs
      .renderFile(path.join(__dirname, `${type}.ejs`), data)
      .then(resolve)
      .catch(reject);
  });
};

let sendOrderConfirmation = ({ order_id }) => {
  return new Promise(async (resolve, reject) => {
    var addresstypes = [1, 3];
    try {
      let orderdetails = await models.orders.findOne({
        attributes: ["id", "createdAt", "payment_mode"],
        include: [
          { model: models.user_profiles, attributes: ["email", "mobile"] },
          {
            model: models.shopping_cart,
            attributes: ["gross_amount", "discount", "discounted_price"],
            include: [
              {
                model: models.shopping_cart_item,
                attributes: ["price"],
                include: [
                  {
                    model: models.trans_sku_lists,
                    attributes: [
                      "sku_id",
                      "discount_price",
                      "generated_sku",
                      "metal_color",
                      "product_id",
                    ],
                  },
                ],
              },
              {
                model: models.cart_address,
                attributes: [
                  "firstname",
                  "lastname",
                  "addressline1",
                  "addressline2",
                  "city",
                  "state",
                  "country",
                  "pincode",
                  "contact_number",
                ],
                where: {
                  address_type: {
                    [models.Sequelize.Op.in]: addresstypes,
                  },
                },
              },
            ],
          },
        ],
        where: {
          id: order_id,
        },
        plain: true,
      });

      var emilreceipiants = [
        {
          to: orderdetails.user_profile.email,
          subject: "Order Placed Successfully",
        },
        { to: process.env.adminemail, subject: "Order Placed Successfully" },
      ];
      let order_items = [];
      for (
        let i = 0;
        i < orderdetails.shopping_cart.shopping_cart_items.length;
        i++
      ) {
        let element = orderdetails.shopping_cart.shopping_cart_items[i];
        let product = await models.product_lists.findOne({
          where: { product_id: element.trans_sku_list.product_id },
          attributes: ["product_name"],
          include: {
            model: models.product_images,
            attributes: ["image_url"],
            where: {
              image_position: 1,
            },
          },
        });
        let ships_by = moment
          .tz(
            await getShippingDate({
              sku_id: element.trans_sku_list.sku_id,
              current_datetime: orderdetails.createdAt,
            }).shipping_date
          )
          .format("DD MMMM YYYY");
        order_items.push({
          price: element.price,
          sku_id: element.trans_sku_list.generated_sku,
          image_url: product.product_images[0].image_url,
          name: product.product_name,
          discount_price: element.trans_sku_list.discount_price,
          ships_by,
        });
      }

      let email_template_body = {
        payment_mode: orderdetails.payment_mode,
        order_id: orderdetails.id,
        order_time: moment
          .tz(orderdetails.createdAt, "Asia/Kolkata")
          .format("DD MMM YYYY HH:mm:ss"),
        order_items,
        address: orderdetails.shopping_cart.cart_addresses[0],
        gross_total: orderdetails.shopping_cart.gross_amount,
        discount: orderdetails.shopping_cart.discount,
        discounted_price: orderdetails.shopping_cart.discounted_price,
      };
      sendMail(
        emilreceipiants,
        await createTemplate({
          type: "order_confirmed",
          data: email_template_body,
        })
      ).then(async (result) => {
        let { response } = result;
        await models.communication_log.create({
          order_id,
          type: "email",
          message_type: "order",
          sender_response_id: response[0].message_id,
        });
      });
      resolve(orderdetails);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

let sendShippingConfirmation = ({ order_id }) => {
  return new Promise(async (resolve, reject) => {
    var addresstypes = [1, 3];
    try {
      let orderdetails = await models.orders.findOne({
        attributes: ["id", "createdAt", "updatedAt", "payment_mode"],
        include: [
          { model: models.user_profiles, attributes: ["email"] },
          {
            model: models.shopping_cart,
            attributes: ["gross_amount", "discount", "discounted_price"],
            include: [
              {
                model: models.shopping_cart_item,
                attributes: ["price"],
                include: [
                  {
                    model: models.trans_sku_lists,
                    attributes: [
                      "sku_id",
                      "discount_price",
                      "generated_sku",
                      "metal_color",
                      "product_id",
                    ],
                  },
                ],
              },
              {
                model: models.cart_address,
                attributes: [
                  "firstname",
                  "lastname",
                  "addressline1",
                  "addressline2",
                  "city",
                  "state",
                  "country",
                  "pincode",
                ],
                where: {
                  address_type: {
                    [models.Sequelize.Op.in]: addresstypes,
                  },
                },
              },
            ],
          },
        ],
        where: {
          id: order_id,
        },
      });

      var emilreceipiants = [
        {
          to: orderdetails.user_profile.email,
          subject: "Order Shipped Successfully",
        },
        { to: process.env.adminemail, subject: "Order Shipped Successfully" },
      ];
      let order_items = [];
      for (
        let i = 0;
        i < orderdetails.shopping_cart.shopping_cart_items.length;
        i++
      ) {
        let element = orderdetails.shopping_cart.shopping_cart_items[i];
        let product = await models.product_lists.findOne({
          where: { product_id: element.trans_sku_list.product_id },
          attributes: ["product_name"],
          include: {
            model: models.product_images,
            attributes: ["image_url"],
            where: {
              image_position: 1,
            },
          },
        });

        let ships_by = `${moment
          .tz(orderdetails.updatedAt, "Asia/Kolkata")
          .format("Do")} to ${moment
          .tz(orderdetails.updatedAt, "Asia/Kolkata")
          .add(5, "days")
          .format("Do MMMM")}`;

        order_items.push({
          price: element.price,
          sku_id: element.trans_sku_list.generated_sku,
          image_url: product.product_images[0].image_url,
          name: product.product_name,
          discount_price: element.trans_sku_list.discount_price,
          ships_by,
        });
      }

      let email_template_body = {
        payment_mode: orderdetails.payment_mode,
        order_id: orderdetails.id,
        order_time: moment
          .tz(orderdetails.createdAt, "Asia/Kolkata")
          .format("DD MMM YYYY HH:mm:ss"),
        order_items,
        address: orderdetails.shopping_cart.cart_addresses[0],
        gross_total: orderdetails.shopping_cart.gross_amount,
        discount: orderdetails.shopping_cart.discount,
        discounted_price: orderdetails.shopping_cart.discounted_price,
      };
      sendMail(
        emilreceipiants,
        await createTemplate({
          type: "shipping",
          data: email_template_body,
        })
      ).then(async (result) => {
        let { response } = result;
        await models.communication_log.create({
          order_id,
          type: "email",
          message_type: "shipping_confirmed",
          sender_response_id: response[0].message_id,
        });
      });
      resolve(orderdetails);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

let sendPaymentConfimed = ({ order_id }) => {
  return new Promise(async (resolve, reject) => {
    var addresstypes = [1, 3];
    try {
      let orderdetails = await models.orders.findOne({
        attributes: ["id", "createdAt", "updatedAt", "payment_mode"],
        include: [
          { model: models.user_profiles, attributes: ["email"] },
          {
            model: models.shopping_cart,
            attributes: ["gross_amount", "discount", "discounted_price"],
            include: [
              {
                model: models.shopping_cart_item,
                attributes: ["price"],
                include: [
                  {
                    model: models.trans_sku_lists,
                    attributes: [
                      "sku_id",
                      "discount_price",
                      "generated_sku",
                      "metal_color",
                      "product_id",
                    ],
                  },
                ],
              },
              {
                model: models.cart_address,
                attributes: [
                  "firstname",
                  "lastname",
                  "addressline1",
                  "addressline2",
                  "city",
                  "state",
                  "country",
                  "pincode",
                ],
                where: {
                  address_type: {
                    [models.Sequelize.Op.in]: addresstypes,
                  },
                },
              },
            ],
          },
          { model: models.payment_details, attributes: ["payment_response"] },
        ],
        where: {
          id: order_id,
        },
      });
      var emilreceipiants = [
        {
          to: orderdetails.user_profile.email,
          subject: "Payment Successfull",
        },
        { to: process.env.adminemail, subject: "Payment Successfull" },
      ];
      let order_items = [];
      for (
        let i = 0;
        i < orderdetails.shopping_cart.shopping_cart_items.length;
        i++
      ) {
        let element = orderdetails.shopping_cart.shopping_cart_items[i];
        let product = await models.product_lists.findOne({
          where: { product_id: element.trans_sku_list.product_id },
          attributes: ["product_name"],
          include: {
            model: models.product_images,
            attributes: ["image_url"],
            where: {
              image_position: 1,
            },
          },
        });

        let ships_by = `${moment
          .tz(orderdetails.updatedAt, "Asia/Kolkata")
          .format("Do")} to ${moment
          .tz(orderdetails.updatedAt, "Asia/Kolkata")
          .add(5, "days")
          .format("Do MMMM")}`;

        order_items.push({
          price: element.price,
          sku_id: element.trans_sku_list.generated_sku,
          image_url: product.product_images[0].image_url,
          name: product.product_name,
          discount_price: element.trans_sku_list.discount_price,
          ships_by,
        });
      }

      let email_template_body = {
        transaction_id: JSON.parse(
          orderdetails.payment_details[0].payment_response
        )["APTRANSACTIONID"],
        payment_mode: orderdetails.payment_mode,
        order_id: orderdetails.id,
        order_time: moment
          .tz(orderdetails.createdAt, "Asia/Kolkata")
          .format("DD MMM YYYY HH:mm:ss"),
        order_items,
        address: orderdetails.shopping_cart.cart_addresses[0],
        gross_total: orderdetails.shopping_cart.gross_amount,
        discount: orderdetails.shopping_cart.discount,
        discounted_price: orderdetails.shopping_cart.discounted_price,
      };
      sendMail(
        emilreceipiants,
        await createTemplate({
          type: "payment_successful",
          data: email_template_body,
        })
      ).then(async (result) => {
        let { response } = result;
        await models.communication_log.create({
          order_id,
          type: "email",
          message_type: "payment_confirmed",
          sender_response_id: response[0].message_id,
        });
      });
      resolve(orderdetails);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

let sendRateProduct = ({ order_id }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let orderdetails = await models.orders.findOne({
        attributes: ["id", "createdAt", "updatedAt", "payment_mode"],
        include: [{ model: models.user_profiles, attributes: ["email"] }],
        where: {
          id: order_id,
        },
      });
      var emilreceipiants = [
        {
          to: orderdetails.user_profile.email,
          subject: "Review Product",
        },
        { to: process.env.adminemail, subject: "Review Product" },
      ];
      let email_template_body = {};
      sendMail(
        emilreceipiants,
        await createTemplate({
          type: "rate",
          data: email_template_body,
        })
      ).then(async (result) => {
        let { response } = result;
        await models.communication_log.create({
          order_id,
          type: "email",
          message_type: "rating",
          sender_response_id: response[0].message_id,
        });
      });
      resolve(orderdetails);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

let sendAbandonedCart = ({ cart_id, first_name }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let cart_details = await models.shopping_cart.findOne({
        attributes: [
          "createdAt",
          "gross_amount",
          "discounted_price",
          "discount",
        ],
        include: [
          { model: models.user_profiles, attributes: ["email", "first_name"] },
          {
            model: models.shopping_cart_item,
            attributes: ["price"],
            include: [
              {
                model: models.trans_sku_lists,
                attributes: [
                  "sku_id",
                  "discount_price",
                  "generated_sku",
                  "metal_color",
                  "product_id",
                ],
              },
            ],
          },
          {
            model: models.cart_address,
            required: false,
            attributes: [
              "firstname",
              "lastname",
              "addressline1",
              "addressline2",
              "city",
              "state",
              "country",
              "pincode",
            ],
            where: {
              address_type: {
                [models.Sequelize.Op.in]: addresstypes,
              },
            },
          },
        ],
        where: {
          id: cart_id,
        },
      });

      let order_items = [];
      for (let i = 0; i < cart_details.shopping_cart_items.length; i++) {
        let element = cart_details.shopping_cart_items[i];
        let product = await models.product_lists.findOne({
          where: { product_id: element.trans_sku_list.product_id },
          attributes: ["product_name"],
          include: {
            model: models.product_images,
            attributes: ["image_url"],
            where: {
              image_position: 1,
            },
          },
        });
        let ships_by = moment
          .tz(
            await getShippingDate({
              sku_id: element.trans_sku_list.sku_id,
              current_datetime: new Date(),
            }).shipping_date
          )
          .format("DD MMMM YYYY");
        order_items.push({
          price: element.price,
          sku_id: element.trans_sku_list.generated_sku,
          image_url: product.product_images[0].image_url,
          name: product.product_name,
          discount_price: element.trans_sku_list.discount_price,
          ships_by,
        });
      }

      let email_template_body = {
        firstname:
          first_name ||
          cart_details?.user_profile?.first_name ||
          cart_details?.cart_addresses?.[0]?.firstname,
        order_time: moment
          .tz(cart_details.createdAt, "Asia/Kolkata")
          .format("DD MMM YYYY HH:mm:ss"),
        order_items,
        address: cart_details.cart_addresses[0],
        gross_total: cart_details.gross_amount,
        discount: cart_details.discount,
        discounted_price: cart_details.discounted_price,
      };

      var emilreceipiants = [
        {
          to: cart_details.user_profile.email,
          subject: "You left some items in your cart",
        },
        {
          to: process.env.adminemail,
          subject: "You left some items in your cart",
        },
      ];

      sendMail(
        emilreceipiants,
        await createTemplate({
          type: "abandoned_cart",
          data: email_template_body,
        })
      ).then(async (result) => {
        let { response } = result;
        await models.communication_log.create({
          cart_id,
          type: "email",
          message_type: "abandoned cart",
          sender_response_id: response[0].message_id,
        });
      });

      resolve(cart_details);
    } catch (error) {
      reject(error);
    }
  });
};

let sendAppointmentOTP = ({ appointment_id }) => {
  return new Promise((resolve, reject) => {
    models.appointment
      .findByPk(appointment_id, {
        plain: true,
      })
      .then(async (result) => {
        const subject = `OTP for your appointment @NAC Jwellers`;
        let emilreceipiants = [
          {
            to: result.email,
            subject,
          },
          {
            to: process.env.adminemail,
            subject,
          },
        ];
        sendMail(
          emilreceipiants,
          await createTemplate({
            type: "appointment_otp",
            data: result,
          })
        )
          .then(async (result) => {
            let { response } = result;
            await models.communication_log.create({
              cart_id: null,
              type: "email",
              message_type: "appointment_otp",
              sender_response_id: response[0].message_id,
            });
          })
          .catch((err) => console.log(err));
        resolve(result);
      })
      .catch(reject);
  });
};

let sendAppointmentConfirmation = ({
  appointment_id,
  isMeetingLink = false,
}) => {
  return new Promise((resolve, reject) => {
    models.appointment
      .findByPk(appointment_id, {
        attributes: ["customer_name", "email", "meeting_link", "mobile"],
        include: [
          { model: models.appointment_type_master, attributes: ["name"] },
          {
            model: models.appointment_date_time_slots,
            attributes: ["start_time", "end_time"],
            include: {
              model: models.appointment_dates,
              attributes: ["start_date", "end_date"],
            },
          },
        ],
        // plain: true,
      })
      .then(async (result) => {
        result = JSON.parse(JSON.stringify(result));
        let subject = "NAC | Appointment";
        let type = "appointment_confirmation";
        if (isMeetingLink || result.meeting_link) {
          subject = "NAC - Meeting Invitation";
          type = "appointment_invite";
        }
        if (result?.appointment_type_master?.name?.toLowerCase() == "alive") {
          type = "alive_page";
        }
        var emilreceipiants = [
          {
            to: result.email,
            subject,
          },
          {
            to: process.env.adminemail,
            subject,
          },
        ];
        sendMail(
          emilreceipiants,
          await createTemplate({
            type,
            data: {
              customer_name: result.customer_name,
              mobile: result.mobile,
              appointment_date: moment(
                result?.appointment_date_time_slot?.appointment_date
                  ?.start_date,
                "YYYY-MM-DD"
              ).format("DD-MM-YYYY"),
              appointment_time: `${moment(
                result?.appointment_date_time_slot?.start_time,
                "HH:mm:ss"
              ).format("hh:mm A")} - ${moment(
                result?.appointment_date_time_slot?.end_time,
                "HH:mm:ss"
              ).format("hh:mm A")}`,
              meeting_link: result.meeting_link,
            },
          })
        )
          .then(async (result) => {
            let { response } = result;
            await models.appointment_communication_log.create({
              appointment_id: appointment_id,
              communication_type: `email`,
              type,
              sender_response_id: response[0].message_id,
            });
          })
          .catch((err) => console.log(err));
        resolve({
          ...result,
        });
      })
      .catch(reject);
  });
};

let sendEnquiry = ({ appointment_id }) => {
  return new Promise((resolve, reject) => {
    models.appointment
      .findByPk(appointment_id, {
        attributes: ["customer_name", "email", "mobile", "comments"],
        plain: true,
      })
      .then(async (result) => {
        result = JSON.parse(JSON.stringify(result));
        let subject = "NAC Query";
        let type = "nac_query_template";
        var emilreceipiants = [
          {
            to: result.email,
            subject,
          },
          {
            to: process.env.adminemail,
            subject,
          },
        ];
        sendMail(
          emilreceipiants,
          await createTemplate({
            type,
            data: {
              ...result,
            },
          })
        )
          .then(async (result) => {
            let { response } = result;
            await models.appointment_communication_log.create({
              appointment_id: appointment_id,
              communication_type: `email`,
              type,
              sender_response_id: response[0].message_id,
            });
          })
          .catch((err) => console.log(err));
        resolve({
          ...result,
        });
      })
      .catch(reject);
  });
};

export {
  createTemplate,
  sendOrderConfirmation,
  sendShippingConfirmation,
  sendRateProduct,
  sendPaymentConfimed,
  sendAbandonedCart,
  sendAppointmentOTP,
  sendAppointmentConfirmation,
  sendEnquiry,
};
