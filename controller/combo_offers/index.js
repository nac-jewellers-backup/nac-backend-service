import { get, groupBy, sum } from "lodash";
import { sendStatus } from "../../middlewares/socket";
const uuid = require("uuid/v4");
const models = require("./../../models");
const csv = require("csvtojson");
const arrayChunk = require("array-chunk");

const DISCOUNT_TYPE = {
  PERCENTAGE: "PERCENTAGE",
  FLAT: "FLAT",
};

export const upsertComboOffers = ({ filepath }) => {
  let comboArray = [];
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(filepath)
      .on("data", (data) => {
        const jsonStr = data.toString("utf8");
        comboArray.push(JSON.parse(jsonStr));
      })
      .on("end", async () => {
        console.log(">>>>>>>>>>> Starting Sync >>>>>>>>>>>>>>>");
        try {
          let completedCombos = 0;
          const totalComboOffers = comboArray.length;
          comboArray = arrayChunk(comboArray, 500);
          for (let index = 0; index < comboArray.length; index++) {
            let element = comboArray[index];
            element = element.map((i) => {
              if (i.discount_type) {
                Object.keys(DISCOUNT_TYPE).forEach((type) => {
                  if (
                    i.discount_type
                      .toLowerCase()
                      .includes(DISCOUNT_TYPE[type].toLowerCase())
                  )
                    i.discount_type = DISCOUNT_TYPE[type];
                });
              }
              i.offered_products = i.offered_products?.split(",");
              return i;
            });
            await models.product_combo_offer.bulkCreate(element, {
              updateOnDuplicate: ["main_product"],
            });
            completedCombos += comboArray[index].length;
            sendStatus("combo_sync", {
              status:
                completedCombos == totalComboOffers
                  ? "completed"
                  : "in-progress",
              completed: completedCombos / totalComboOffers,
            });
            resolve("completed");
          }
        } catch (error) {
          console.log(error);
        }
      })
      .on("error", (err) => {
        console.error(err);
        reject(err);
      });
  });
};

export const fetchComboProducts = ({ main_product }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let comboOffer = await models.product_combo_offer.findOne({
        where: { main_product, is_active: true },
        include: {
          model: models.trans_sku_lists,
          attributes: ["generated_sku", "markup_price", "discount_price"],
          include: {
            model: models.product_lists,
            attributes: ["product_name", "product_id"],
            include: {
              model: models.product_images,
              attributes: [
                ["ishover", "ishover"],
                ["image_url", "imageUrl"],
                ["image_position", "imagePosition"],
                ["isdefault", "isdefault"],
              ],
              where: {
                isdefault: true,
                image_position: {
                  [models.Sequelize.Op.in]: [1, 2],
                },
              },
              required: false,
            },
          },
        },
      });
      if (!comboOffer) {
        return reject(new Error("No Combo offer exists!"));
      }
      comboOffer = comboOffer.toJSON();
      let offeredProducts = await models.trans_sku_lists.findAll({
        attributes: ["generated_sku", "markup_price", "discount_price"],
        include: {
          model: models.product_lists,
          attributes: ["product_name", "product_id"],
          include: {
            model: models.product_images,
            attributes: [
              ["ishover", "ishover"],
              ["image_url", "imageUrl"],
              ["image_position", "imagePosition"],
              ["isdefault", "isdefault"],
            ],
            where: {
              isdefault: true,
              image_position: {
                [models.Sequelize.Op.in]: [1, 2],
              },
            },
            required: false,
          },
        },
        where: {
          product_id: {
            [models.Sequelize.Op.in]: comboOffer.offered_products,
          },
        },
      });
      offeredProducts = JSON.parse(JSON.stringify(offeredProducts));
      let comboProducts = [
        {
          ...comboOffer.trans_sku_list.product_list,
          generated_sku: comboOffer.trans_sku_list.generated_sku,
          markup_price: comboOffer.trans_sku_list.markup_price,
          discount_price: comboOffer.trans_sku_list.discount_price,
        },
        ...offeredProducts.map((i) => {
          return {
            ...i.product_list,
            generated_sku: i.generated_sku,
            markup_price: i.markup_price,
            discount_price: i.discount_price,
          };
        }),
      ];
      resolve({ comboOffer, comboProducts });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const comboOfferPriceCalculation = ({ comboOffer, comboProducts }) => {
  let totalPrice = sum(comboProducts.map((i) => i.markup_price || 0));
  let offerPrice = totalPrice;
  if (comboOffer.discount_type == DISCOUNT_TYPE.PERCENTAGE) {
    offerPrice = (offerPrice * (1 - comboOffer.discount_value / 100)).toFixed(
      2
    );
    comboProducts = comboProducts.map((item) => {
      return {
        ...item,
        offerPrice: (
          item.markup_price *
          (1 - comboOffer.discount_value / 100)
        ).toFixed(2),
      };
    });
  } else if (comboOffer.discount_type == DISCOUNT_TYPE.FLAT) {
    comboProducts = comboProducts.map((item) => {
      return {
        ...item,
        offerPrice: (
          item.markup_price -
          (item.markup_price * comboOffer.discount_value) / offerPrice
        ).toFixed(2),
      };
    });
    offerPrice = offerPrice - comboOffer.discount_value;
  }
  return { totalPrice, offerPrice, comboProducts };
};

export const displayComboOffer = ({ product_id: main_product }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { comboOffer, comboProducts } = await fetchComboProducts({
        main_product,
      });
      let {
        totalPrice,
        offerPrice,
        comboProducts: calculatedComboProducts,
      } = comboOfferPriceCalculation({
        comboOffer,
        comboProducts,
      });
      resolve({
        discount_type: comboOffer.discount_type,
        discount_value: comboOffer.discount_value,
        totalPrice,
        offerPrice,
        comboProducts: calculatedComboProducts,
      });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const checkCartAndApplyCombo = ({ cartComboRequested, cartID }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { main_product, combo_products: requestedComboProducts } =
        cartComboRequested;
      let { comboOffer, comboProducts: offeredComboSet } =
        await fetchComboProducts({
          main_product,
        });
      //Extract elements based on the 'product_id' key from requested Set including main_product
      const requestedSet = [
        main_product,
        ...requestedComboProducts.map((item) => get(item, "product_id")),
      ];
      // Find common elements to apply Combo only based on offered Combo Products
      let finalComboSet = offeredComboSet.filter((item) =>
        requestedSet.includes(get(item, "product_id"))
      );
      if (finalComboSet.length > 1) {
        let { totalPrice, offerPrice, comboProducts } =
          comboOfferPriceCalculation({
            comboOffer,
            comboProducts: finalComboSet,
          });
        if (Boolean(cartID)) {
          await models.shopping_cart_item.destroy({
            where: {
              shopping_cart_id: cartID,
              combo_main_product: main_product,
            },
          });
          let cartItems = comboProducts.map((item) => {
            return {
              id: `'${uuid()}'`,
              shopping_cart_id: cartID,
              product_sku: item.generated_sku,
              qty: 1,
              price: item.offerPrice,
              is_combo_offer: true,
              combo_main_product: main_product,
            };
          });
          await models.shopping_cart_item.bulkCreate(cartItems);
        }
        resolve({ totalPrice, offerPrice, comboProducts });
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export const checkExistingCartAndUpdateLatestPrice = async ({ cartID }) => {
  if (!cartID) return;
  let shopping_cart_items = await models.shopping_cart_item.findAll({
    attributes: ["combo_main_product", "product_sku"],
    where: { shopping_cart_id: cartID, is_combo_offer: true },
    raw: true,
  });
  if (shopping_cart_items.length <= 0) return;
  shopping_cart_items = groupBy(shopping_cart_items, (item) => {
    return item.combo_main_product;
  });

  let comboMainProducts = Object.keys(shopping_cart_items);
  for (let index = 0; index < comboMainProducts.length; index++) {
    const item = comboMainProducts[index];
    let element = shopping_cart_items[item];
    element = await Promise.all(
      element
        .filter((i) => !i.product_sku.includes(item))
        .map(async (item) => {
          let { product_id } = await models.trans_sku_lists.findOne({
            where: { generated_sku: item.product_sku },
          });
          return {
            product_id,
          };
        })
    );
    await checkCartAndApplyCombo({
      cartComboRequested: { main_product: item, combo_products: element },
      cartID,
    });
  }
};
