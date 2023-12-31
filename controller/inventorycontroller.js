const moment = require("moment");
const models = require("./../models");
const { findIndex, sumBy, filter } = require("lodash");
const { v4: uuidv4 } = require("uuid");

let addHolidays = (holidays) => {
  return new Promise((resolve, reject) => {
    try {
      if (!Array.isArray(holidays) || holidays.length < 1) {
        throw new Error("Please send holidays in an array");
      }
      models.holiday_manager
        .bulkCreate(
          holidays.map((item) => {
            return {
              holiday: item.holiday,
              date: moment(item.date, ["DD/MM/YYYY", "DD-MM-YYYY"]),
            };
          }),
          {
            ignoreDuplicates: true,
          }
        )
        .then((result) => {
          resolve(result);
        })
        .catch((err) => {
          reject(err);
        });
    } catch (error) {
      reject(error);
    }
  });
};

let addInventories = (inventory, warehouses) => {
  var getWarehouseId = (warehouseName) => {
    var index = findIndex(warehouses, (item) => {
      return item.name.toLowerCase() == warehouseName.toLowerCase();
    });
    return warehouses[index].id;
  };

  return new Promise(async (resolve, reject) => {
    var item = {
      generated_sku: inventory.TAGNO,
      warehouse_id: getWarehouseId(inventory.warehouse_name),
    };
    models.inventory
      .findOne({ attributes: ["id"], where: { ...item } })
      .then(async (result) => {
        if (result) {
          await models.inventory.update(
            { number_of_items: inventory.quantity },
            { where: { id: result.id } }
          );
        } else {
          await models.inventory.create({
            id: `${uuidv4()}`,
            ...item,
            number_of_items: element.quantity,
          });
        }
        resolve("Completed");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

let getShippingDate = async ({ sku_id, current_datetime }) => {
  if (!current_datetime) {
    current_datetime = moment();
  }

  var getHolidayCount = (currentDate, shippingDate) => {
    return new Promise((resolve, reject) => {
      models.holiday_manager
        .count({
          where: {
            date: {
              [models.Sequelize.Op.gte]: currentDate,
              [models.Sequelize.Op.lt]: shippingDate,
            },
          },
        })
        .then((result) => resolve(result))
        .catch((err) => reject(err));
    });
  };

  return new Promise(async (resolve, reject) => {
    models.trans_sku_lists
      .findOne({
        attributes: [
          "is_ready_to_ship",
          "is_active",
          "vendor_delivery_time",
          "is_orderable",
          "order_shipping_days",
        ],
        include: [
          { model: models.product_lists, attributes: ["isreorderable"] },
          {
            model: models.inventory,
            required: false,
            attributes: ["number_of_items"],
            include: {
              required: false,
              model: models.warehouse,
              attributes: ["shipping_in_days"],
              where: {
                is_active: true,
              },
            },
          },
        ],
        where: { sku_id },
        order: [
          [models.inventory, models.warehouse, "shipping_in_days", "asc"],
        ],
      })
      .then(async (result) => {
        result = JSON.parse(JSON.stringify(result));        
        if (!result) {
          resolve({ status: "Enquire Now", shipping_date: null });
        }
        var duration = moment
          .duration(moment(current_datetime).diff(moment({ hour: 14 })))
          .as("minutes");

        if (!result.is_active) {
          resolve({ status: "Enquire Now", shipping_date: null });
        }
        
        if (!result.is_ready_to_ship && result.is_orderable) {
          resolve({
            status: "Make an Order",
            shipping_days: result.order_shipping_days,
          });
        }

        if (result.is_active) {
          if (Array.isArray(result.inventories)) {
            if (result.inventories.length == 0) {
              var totalDaysToShip =
                result.vendor_delivery_time + (duration > 10 ? 0 : 1);
              var shippingDate = moment(current_datetime).set(
                totalDaysToShip,
                "days"
              );
              var holidayCount = getHolidayCount(
                moment(current_datetime),
                shippingDate
              );
              if (holidayCount > 0) {
                shippingDate.add(holidayCount, "days");
              }
              if (result.is_ready_to_ship) {
                console.log(shippingDate,"---shippingDate")
                resolve({ status: "Buy Now", shipping_date: shippingDate });
              } else {
                if (result.product_list.isreorderable) {
                  console.log(shippingDate,"###shippingDate")
                  resolve({ status: "Buy Now", shipping_date: shippingDate });
                } else {
                  console.log(shippingDate,"***shippingDate")
                  resolve({ status: "Enquire Now", shipping_date: null });
                }
              }
            } else {
              if (sumBy(result.inventories, "number_of_items") == 0) {
                var totalDaysToShip =
                  result.vendor_delivery_time + (duration > 10 ? 0 : 1);
                var shippingDate = moment(current_datetime).add(
                  totalDaysToShip,
                  "d"
                );
                var holidayCount = getHolidayCount(
                  moment(current_datetime),
                  shippingDate
                );
                if (holidayCount > 0) {
                  shippingDate.add(holidayCount, "days");
                }
                resolve({ status: "Buy Now", shipping_date: shippingDate });
              } else {
                let inventory = filter(result.inventories, (item) => {
                  return item.number_of_items > 0;
                });

                var totalDaysToShip =
                  inventory[0].warehouse.shipping_in_days +
                  (duration > 10 ? 0 : 1);
                var shippingDate = moment(current_datetime).add(
                  totalDaysToShip,
                  "d"
                );
                console.log(shippingDate,"00000");
                var holidayCount = getHolidayCount(
                  moment(current_datetime),
                  shippingDate
                );
                if (holidayCount > 0) {
                  shippingDate.add(holidayCount, "days");
                }
                resolve({ status: "Buy Now", shipping_date: shippingDate });
              }
            }
          }
        } else {
          resolve({ status: "Enquire Now", shipping_date: null });
        }
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  addHolidays,
  addInventories,
  getShippingDate,
};
